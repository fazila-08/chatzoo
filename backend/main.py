# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import time
import random
import asyncio
from fastapi.responses import StreamingResponse
from typing import Optional
import os
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for models
model = None
tokenizer = None
cat_pipeline = None
goldfish_pipeline = None
sloth_pipeline = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global model, tokenizer, cat_pipeline, goldfish_pipeline, sloth_pipeline
    try:
        logger.info("Loading DistilGPT-2 model...")
        MODEL_NAME = "distilgpt2"
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)
        
        # Add pad token if it doesn't exist
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        # Initialize pipelines for each mode
        cat_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)
        goldfish_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)
        sloth_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)
        
        logger.info("Models loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        raise e
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(lifespan=lifespan)

# CORS configuration - more secure for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Session memory for goldfish mode (ironically stores memory to forget it)
goldfish_memory = {}
GOLDFISH_MAX_MEMORY = 2  # Remember only last 2 exchanges

class ChatRequest(BaseModel):
    message: str
    model: str  # 'cat', 'goldfish', or 'sloth'
    session_id: Optional[str] = "default"

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "models_loaded": model is not None}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not model or not tokenizer:
        raise HTTPException(status_code=503, detail="Models not loaded yet")
    
    user_input = request.message.strip()
    model_type = request.model.lower()
    
    if not user_input:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    if model_type not in ['cat', 'goldfish', 'sloth']:
        raise HTTPException(status_code=400, detail="Invalid model type. Must be 'cat', 'goldfish', or 'sloth'")
    
    try:
        if model_type == 'cat':
            response = generate_cat_response(user_input)
            return {"response": response}
        elif model_type == 'goldfish':
            response = generate_goldfish_response(user_input, request.session_id)
            return {"response": response}
        elif model_type == 'sloth':
            return StreamingResponse(
                generate_sloth_response(user_input),
                media_type="text/plain",
                headers={"Cache-Control": "no-cache"}
            )
    except Exception as e:
        logger.error(f"Error generating response for {model_type}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate response")

def generate_cat_response(input_text: str) -> str:
    """Generate cat-like response with meows and emojis"""
    try:
        # Create a more cat-like prompt
        prompt = f"Human says: {input_text}\nCat responds with meows:"
        
        response = cat_pipeline(
            prompt,
            max_length=len(prompt.split()) + 15,  # Dynamic length
            num_return_sequences=1,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=True,
            temperature=0.8,
            top_p=0.9
        )[0]['generated_text']
        
        # Extract just the cat's response
        if "Cat responds with meows:" in response:
            cat_response = response.split("Cat responds with meows:")[1].strip()
        else:
            cat_response = "meow meow"
        
        # Convert to meows based on word count
        words = input_text.split()
        num_meows = min(max(len(words), 2), 8)  # Between 2-8 meows
        
        meow_variations = ["meow", "mrow", "purr", "mew", "meeeow"]
        meow_endings = ["", "!", "~", "?", "...", " :3"]
        
        meows = []
        for i in range(num_meows):
            meow = random.choice(meow_variations)
            ending = random.choice(meow_endings)
            meows.append(meow + ending)
        
        meow_response = " ".join(meows)
        
        # Add random cat emojis (1-3 emojis)
        cat_emojis = ["😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🐱", "🐈"]
        num_emojis = random.randint(1, 3)
        selected_emojis = random.sample(cat_emojis, num_emojis)
        
        return f"{meow_response} {' '.join(selected_emojis)}"
        
    except Exception as e:
        logger.error(f"Cat response generation failed: {e}")
        return f"meow meow! {random.choice(['😺', '😸', '😹'])}"

def generate_goldfish_response(input_text: str, session_id: str) -> str:
    """Generate goldfish response with memory issues"""
    try:
        # Initialize session memory if not exists
        if session_id not in goldfish_memory:
            goldfish_memory[session_id] = []
        
        session_memory = goldfish_memory[session_id]
        
        # Goldfish forgets - keep only last few exchanges
        if len(session_memory) > GOLDFISH_MAX_MEMORY * 2:  # 2 messages per exchange
            goldfish_memory[session_id] = session_memory[-(GOLDFISH_MAX_MEMORY * 2):]
            session_memory = goldfish_memory[session_id]
        
        # Sometimes goldfish forgets everything (30% chance)
        if random.random() < 0.3:
            goldfish_memory[session_id] = []
            session_memory = []
        
        # Build context with limited memory
        context_lines = []
        for i in range(0, len(session_memory), 2):
            if i + 1 < len(session_memory):
                context_lines.append(session_memory[i])
                context_lines.append(session_memory[i + 1])
        
        context = "\n".join(context_lines[-6:]) if context_lines else ""  # Last 3 exchanges max
        
        # Generate response with forgetful prompts
        forgetful_prompts = [
            "I'm a goldfish with terrible memory. ",
            "Wait, what were we talking about? ",
            "I think I forgot something... ",
            "My memory is like... what was I saying? "
        ]
        
        base_prompt = random.choice(forgetful_prompts)
        prompt = f"{context}\nHuman: {input_text}\nForgetful Goldfish: {base_prompt}"
        
        response = goldfish_pipeline(
            prompt,
            max_length=len(prompt.split()) + 20,
            num_return_sequences=1,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=True,
            temperature=0.9,
            top_p=0.8
        )[0]['generated_text']
        
        # Extract goldfish response
        if "Forgetful Goldfish:" in response:
            goldfish_response = response.split("Forgetful Goldfish:")[-1].strip()
        else:
            goldfish_response = "I forgot what you said... 🐠"
        
        # Clean up response
        goldfish_response = goldfish_response.split('\n')[0]  # Take first line only
        goldfish_response = goldfish_response[:200]  # Limit length
        
        # Add goldfish emojis
        fish_emojis = ["🐠", "🐟", "🎏", "🐡"]
        goldfish_response += f" {random.choice(fish_emojis)}"
        
        # Update memory (ironically)
        goldfish_memory[session_id].extend([
            f"Human: {input_text}",
            f"Goldfish: {goldfish_response}"
        ])
        
        return goldfish_response
        
    except Exception as e:
        logger.error(f"Goldfish response generation failed: {e}")
        return f"I forgot everything! {random.choice(['🐠', '🐟', '🐡'])}"

async def generate_sloth_response(input_text: str):
    """Generate sloth response with slow streaming"""
    try:
        # Generate the complete response first
        prompt = f"Human: {input_text}\nSlow Sloth: I'm very slow so I'll respond slowly..."
        
        response = sloth_pipeline(
            prompt,
            max_length=len(prompt.split()) + 25,
            num_return_sequences=1,
            pad_token_id=tokenizer.eos_token_id,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )[0]['generated_text']
        
        # Extract sloth response
        if "Slow Sloth:" in response:
            sloth_response = response.split("Slow Sloth:")[-1].strip()
        else:
            sloth_response = "I... am... very... slow... 🦥"
        
        # Clean and limit response
        sloth_response = sloth_response.split('\n')[0]
        sloth_response = sloth_response[:150]
        
        # Add sloth emoji
        if "🦥" not in sloth_response:
            sloth_response += " 🦥"
        
        # Stream the response character by character with delays
        for i, char in enumerate(sloth_response):
            yield char
            
            # Variable delays to make it feel more natural
            if char in '.!?':
                # Longer pause after sentences
                await asyncio.sleep(0.8 + random.random() * 0.7)
            elif char == ' ':
                # Medium pause after words
                await asyncio.sleep(0.3 + random.random() * 0.4)
            elif char in ',;':
                # Short pause after punctuation
                await asyncio.sleep(0.4 + random.random() * 0.3)
            else:
                # Regular character delay
                base_delay = 0.1 + random.random() * 0.2
                # Occasionally add extra delays (20% chance)
                if random.random() < 0.2:
                    base_delay += random.random() * 0.5
                await asyncio.sleep(base_delay)
                
    except Exception as e:
        logger.error(f"Sloth response generation failed: {e}")
        error_msg = "S... o... r... r... y... e... r... r... o... r... 🦥"
        for char in error_msg:
            yield char
            await asyncio.sleep(0.2)

# Cleanup old goldfish memories periodically (prevent memory leaks)
@app.on_event("startup")
async def setup_periodic_cleanup():
    async def cleanup_goldfish_memory():
        while True:
            await asyncio.sleep(3600)  # Every hour
            # Remove sessions older than 24 hours (simplified cleanup)
            if len(goldfish_memory) > 100:  # If too many sessions
                # Keep only 50 most recent sessions
                sessions = list(goldfish_memory.keys())
                for session in sessions[:-50]:
                    del goldfish_memory[session]
            logger.info(f"Goldfish memory cleanup: {len(goldfish_memory)} sessions")
    
    asyncio.create_task(cleanup_goldfish_memory())

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)