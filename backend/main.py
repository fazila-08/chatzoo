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

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load base model
MODEL_NAME = "distilgpt2"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(MODEL_NAME)

# Initialize pipelines for each mode
cat_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)
goldfish_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)
sloth_pipeline = pipeline("text-generation", model=model, tokenizer=tokenizer)

# Session memory for goldfish mode (ironically)
goldfish_memory = {}

class ChatRequest(BaseModel):
    message: str
    model: str  # 'cat', 'goldfish', or 'sloth'
    name: Optional[str] = None 

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    user_input = request.message
    model_type = request.model
    
    if model_type == 'cat':
        response = generate_cat_response(user_input)
    elif model_type == 'goldfish':
        response = generate_goldfish_response(user_input, request.session_id)
    elif model_type == 'sloth':
        return StreamingResponse(generate_sloth_response(user_input))
    else:
        raise HTTPException(status_code=400, detail="Invalid model type")
    
    return {"response": response}

def generate_cat_response(input_text):
    # Generate initial response
    prompt = f"User: {input_text}\nCat:"
    response = cat_pipeline(
        prompt,
        max_length=100,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id
    )[0]['generated_text']
    
    # Extract just the cat's response
    cat_response = response.split("Cat:")[1].strip()
    
    # Convert to meows and add cat emojis
    words = cat_response.split()
    meow_response = " ".join(["meow" + random.choice(["", "!", "~", "?"]) for _ in words])
    
    # Add random cat emojis
    cat_emojis = ["😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾"]
    meow_response += " " + random.choice(cat_emojis)
    
    return meow_response

def generate_goldfish_response(input_text, session_id):
    # Goldfish has no memory beyond the current session
    if session_id not in goldfish_memory:
        goldfish_memory[session_id] = []
    
    # Forget everything except maybe the last message
    if len(goldfish_memory[session_id]) > 1:
        goldfish_memory[session_id] = goldfish_memory[session_id][-1:]
    
    # Generate response with very limited context
    context = "\n".join(goldfish_memory[session_id][-3:]) if goldfish_memory[session_id] else ""
    prompt = f"{context}\nUser: {input_text}\nGoldfish:"
    
    response = goldfish_pipeline(
        prompt,
        max_length=150,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id
    )[0]['generated_text']
    
    goldfish_response = response.split("Goldfish:")[1].strip()
    
    # Update memory
    goldfish_memory[session_id].extend([
        f"User: {input_text}",
        f"Goldfish: {goldfish_response}"
    ])
    
    return goldfish_response

async def generate_sloth_response(input_text):
    # First generate the complete response (but we'll stream it slowly)
    prompt = f"User: {input_text}\nSloth:"
    response = sloth_pipeline(
        prompt,
        max_length=100,
        num_return_sequences=1,
        pad_token_id=tokenizer.eos_token_id
    )[0]['generated_text']
    
    sloth_response = response.split("Sloth:")[1].strip()
    
    # Stream the response letter by letter with random delays
    for i, char in enumerate(sloth_response):
        yield char
        # Add random delays (more frequent after a few characters)
        if i > 0 and random.random() < 0.3:
            await asyncio.sleep(0.3 + random.random() * 0.7)