import os
import json
import logging
import requests
from pathlib import Path
from typing import List, Dict, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# ============================================================================
# STEP 1: Load Environment & Config
# ============================================================================
env_file = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_file, override=True)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
SITE_URL = os.getenv("SITE_URL", "http://localhost:5173")
SITE_NAME = os.getenv("SITE_NAME", "AgriBot")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="AgriBot API", version="2.1.0")
origins = [
    "http://localhost:5173",
    "https://agribot-ai.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# STEP 2: Models & State
# ============================================================================
class ChatRequest(BaseModel):
    query: str
    image_url: Optional[str] = None
    language: str = "English"

class ChatResponse(BaseModel):
    reply: str
    error: bool = False
    error_type: Optional[str] = None
    cost: Optional[float] = None

conversation_history: List[Dict[str, str]] = []
total_cost = 0.0

# ============================================================================
# STEP 3: Core Logic (The Fix)
# ============================================================================

def get_openrouter_response(user_message: str, image_url: Optional[str] = None) -> tuple:
    global total_cost
    
    if not OPENROUTER_API_KEY:
        return "API Key missing", True, "config_error", None

    system_message = {
        "role": "system",
        "content": (
            "You are AgriBot, an expert Senior Agronomist. "
            "Analyze images for diseases, give dosage for fertilizers/pesticides, "
            "and always use Markdown formatting. Keep advice practical and scannable."
        )
    }
    
    # Build history context
    messages = [system_message]
    for exchange in conversation_history[-5:]:
        messages.append({"role": "user", "content": exchange["user"]})
        messages.append({"role": "assistant", "content": exchange["bot"]})
    
    # Current User Content
    if image_url:
        user_content = [
            {"type": "text", "text": user_message},
            {"type": "image_url", "image_url": {"url": image_url}}
        ]
    else:
        user_content = user_message
        
    messages.append({"role": "user", "content": user_content})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
    }

    # Model Fallback Logic
    models = ["google/gemini-flash-1.5", "meta-llama/llama-3.1-8b-instruct"]
    
    for model in models:
        try:
            payload = {
                "model": model,
                "messages": messages,
                "max_tokens": 1000,
                "temperature": 0.5
            }
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                data=json.dumps(payload),
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                reply = result["choices"][0]["message"]["content"]
                
                # Precise Costing
                tokens = result.get("usage", {}).get("total_tokens", 0)
                msg_cost = tokens * 0.00000015 # Gemini Flash rate
                total_cost += msg_cost
                
                return reply, False, None, msg_cost
            
        except Exception as e:
            logger.error(f"Error with {model}: {e}")
            continue

    return "Server overloaded. Try again.", True, "api_error", 0.0

# ============================================================================
# STEP 4: Endpoints
# ============================================================================

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    user_text = req.query.strip()
    if not user_text:
        raise HTTPException(status_code=400, detail="Empty query")

    # Force Language via System Prompt
    language_prompt = f"\n\nIMPORTANT: Use {req.language} for the entire response."
    
    reply_text, is_error, err_type, cost = get_openrouter_response(
        user_text + language_prompt, 
        req.image_url
    )

    if not is_error:
        conversation_history.append({"user": user_text, "bot": reply_text})
        if len(conversation_history) > 20: conversation_history.pop(0)

    return ChatResponse(reply=reply_text, error=is_error, error_type=err_type, cost=cost)

@app.get("/api/stats")
def get_stats():
    return {
        "total_cost_usd": f"${total_cost:.6f}",
        "session_messages": len(conversation_history)
    }

@app.post("/api/clear-history")
def clear_history():
    global conversation_history
    conversation_history = []
    return {"status": "cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)