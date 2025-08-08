import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Temporary mock responses
  const mockResponses = {
    cat: ["Meow! 😸", "Purrr... 🐱", "Mrow? 🐈"],
    goldfish: ["I forget what you said... 🐠", "What were we talking about? 🐟"],
    sloth: "S... l... o... w... 🦥"
  };

  try {
    const { message, model = 'cat' } = req.body;
    const responses = mockResponses[model as keyof typeof mockResponses] || mockResponses.cat;
    
    // For sloth mode, we'll stream the response
    if (model === 'sloth') {
      res.setHeader('Content-Type', 'text/plain');
      
      // Simulate streaming
      const response = mockResponses.sloth;
      for (let i = 0; i < response.length; i++) {
        res.write(response.charAt(i));
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 300));
      }
      return res.end();
    } else {
      // For other modes
      const response = Array.isArray(responses) 
        ? responses[Math.floor(Math.random() * responses.length)]
        : responses;
      
      return res.status(200).json({ response });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}