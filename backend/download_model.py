from transformers import AutoModelForCausalLM, AutoTokenizer
import os

MODEL_DIR = "../models/distilgpt2"
os.makedirs(MODEL_DIR, exist_ok=True)

print("Downloading DistilGPT-2 model...")
model = AutoModelForCausalLM.from_pretrained("distilgpt2", cache_dir=MODEL_DIR)
tokenizer = AutoTokenizer.from_pretrained("distilgpt2", cache_dir=MODEL_DIR)

print(f"Model saved to: {os.path.abspath(MODEL_DIR)}")
