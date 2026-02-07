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
    "https://agribottt.netlify.app",
    "https://agribot-6osxtg018-vivang-mishras-projects.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "You are 'AgriBot Pro', a world-class Senior Agronomist and Plant Pathologist. "
        "Your goal is to provide scientific, accurate, and highly detailed farming advice. "
        
        "1. IMAGE ANALYSIS: When an image is provided, perform a deep visual inspection. "
        "Identify the crop type, detect specific pests (insects/fungus/bacteria), and recognize nutrient deficiencies (like Nitrogen or Zinc lack). "
        "Explain the 'Symptoms' you see in the image (e.g., yellow spots, wilted edges, powdery residue). "

        "2. DETAILED SOLUTIONS: For any problem, provide a three-tier solution: "
        "   - Cultural/Preventive: Natural ways to stop it from spreading. "
        "   - Organic/Biological: Natural fertilizers or bio-pesticides. "
        "   - Chemical: Specific pesticide/fertilizer names with exact dosage (e.g., 2ml per Liter) and application method. "

        "3. FARMING QUERIES: If asked about farming techniques (like Irrigation, Soil health, or Crop rotation), "
        "provide deep technical insights including ideal pH levels, temperature requirements, and modern methods like Drip Irrigation. "

        "4. FORMATTING: Always use Markdown. Use **Bold Headings**, > Blockquotes for warnings, "
        "and tables if comparing multiple solutions. Keep the tone helpful and professional. "
        "Response Language: Always reply in the language requested by the user."
        )
    }
    
    # Build history context
    messages = [system_message]
    for exchange in conversation_history[-5:]:
        messages.append({"role": "user", "content": exchange["user"]})
        messages.append({"role": "assistant", "content": exchange["bot"]})
    
    # Current User Content
    if image_url and image_url.startswith("data:image"):
        user_content = [
            {"type": "text", "text": user_message},
            {
                "type": "image_url", 
                "image_url": {"url": image_url} # Removed 'detail:low' as some models bug out on it
            }
        ]
    else:
        user_content = user_message
        
    messages.append({"role": "user", "content": user_content})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://agribot-6osxtg018-vivang-mishras-projects.vercel.app",
        "X-Title": SITE_NAME,
    }

    # Model Fallback Logic
    models = ["google/gemini-2.0-flash-001", "google/gemini-flash-1.5-8b", "openai/gpt-4o-mini", "anthropic/claude-3-haiku", "meta-llama/llama-3.1-8b-instruct"]
    
    for model in models:
        try:
            payload = {
                "model": model,
                "messages": messages + [{"role": "user", "content": user_content}],
                "max_tokens": 1000,
                "temperature": 0.4
            }
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=45
            )
            
            if response.status_code == 200:
                result = response.json()
                if "choices" in result:
                    reply = result["choices"][0]["message"]["content"]
                    tokens = result.get("usage", {}).get("total_tokens", 0)
                    msg_cost = tokens * 0.00000015
                    total_cost += msg_cost
                    return reply, False, None, msg_cost
            # LOG THE ACTUAL ERROR TO RENDER CONSOLE
            logger.error(f"Model {model} failed with status {response.status_code}: {response.text}")

        except Exception as e:
            logger.error(f"Error with {model}: {e}")
            continue

    return "Server overloaded or API Key exhausted. Check Render Logs.", True, "api_error", 0.0

# ============================================================================
# STEP 4: Endpoints (Final Clean Version)
# ============================================================================

@app.post("/api/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # original_query ko save karenge history ke liye
    original_query = req.query.strip()
    
    # Logic for Image-only query
    if not original_query and req.image_url:
        processed_query = "Please analyze this image in detail and identify any problems."
    elif not original_query:
        raise HTTPException(status_code=400, detail="Empty query")
    else:
        processed_query = original_query

    # AI Instructions (history mein save nahi karenge)
    prompt_modifier = ""
    if req.image_url:
        prompt_modifier = "\n[Instruction: Perform a deep visual inspection of this plant image.]"

    language_prompt = f"\n\nIMPORTANT: Respond entirely and strictly in {req.language}."
    
    # AI ko bhejne wali final string
    final_query_for_ai = processed_query + prompt_modifier + language_prompt
    
    reply_text, is_error, err_type, cost = get_openrouter_response(
        final_query_for_ai, 
        req.image_url
    )

    if not is_error:
        # History mein sirf original text save karo taaki context clean rahe
        conversation_history.append({
            "user": original_query if original_query else "Sent an image", 
            "bot": reply_text
        })
        if len(conversation_history) > 20: 
            conversation_history.pop(0)

    return ChatResponse(reply=reply_text, error=is_error, error_type=err_type, cost=cost)

# Isse stats endpoint bhi zinda rahega
@app.get("/api/stats")
def get_stats():
    return {
        "total_cost_usd": f"${total_cost:.6f}",
        "session_messages": len(conversation_history)
    }