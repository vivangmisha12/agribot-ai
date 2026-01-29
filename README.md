# 🌾 LLM-AgriBot - AI-Powered Agricultural Assistant (v2.1)

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%201.5%20Flash-orange.svg)](https://openrouter.ai/)

AgriBot AI is a professional, high-precision agricultural assistant. It is powered by **Google Gemini 1.5 Flash** via OpenRouter and features an automatic **Model Fallback** system to ensure 99.9% uptime. Built with a FastAPI backend and a modern React frontend.

![AgriBot Demo](https://via.placeholder.com/800x400/2E7D32/FFFFFF?text=AgriBot+AI+v2.1+Demo)

## ✨ Features

### 🤖 AI Capabilities
- **Gemini 1.5 Flash**: Primary model for high-speed image analysis and farming advice.
- **Model Fallback Logic**: Automatically switches to backup models (like Llama-3.1) if the primary API fails or credits are exhausted.
- **Native Multilingual**: Responds directly in Hindi, Marathi, Punjabi, Telugu, and 100+ other languages.
- **Vision Analysis**: Identify crop diseases, pests, and nutrient deficiencies from photos.
- **Contextual Memory**: Maintains conversation history for follow-up questions.

### 🎨 User Experience
- **Modern React UI**: Clean, intuitive interface designed for mobile and desktop.
- **Language Selector**: Dedicated dropdown for farmers to choose their native language.
- **Smart Validation**: Integrated **SweetAlert2** for compact and user-friendly error popups.
- **Real-time Interaction**: Instant AI responses with markdown support (bold, lists, etc.).

### 🔧 Technical Features
- **Client-Side Size Check**: Prevents uploads > 10MB to save bandwidth and prevent server timeouts.
- **FastAPI Backend**: Asynchronous request handling for superior performance.
- **Security**: API keys and site configurations managed via environment variables (.env).

## 📁 Project Structure

```text
LLM-AGRIBOT/
├── backend/                # FastAPI Application
│   ├── main.py             # AI Logic & Fallback Switching
│   ├── .env                # Secret API Keys
│   └── requirements.txt    # Optimized dependencies
├── src/                    # React Frontend (JS)
│   ├── components/         # ChatBox & Navbar
│   ├── App.js              # State logic & 10MB Validation
│   └── style.css           # Agricultural Theme CSS
└── README.md               # Documentation
```

## 🚀 Installation & Setup

### 1. Backend Setup
```text
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Configure .env:
```env
OPENROUTER_API_KEY=your_api_key_here
SITE_URL=http://localhost:5173
SITE_NAME=AgriBot
```
```
Start Server: uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```text
# In the root directory
npm install
npm run dev
```
## 📡 API Documentation
#### 💬 Chat Endpoint (With Fallback)
##### POST /api/chat
```JSON
{
  "query": "How to grow organic potatoes?",
  "image_url": "data:image/jpeg;base64,...",
  "language": "Hindi"
}
```
#### 🟢 System Health
##### GET /health
```JSON
{
  "status": "ok",
  "primary_model": "google/gemini-flash-1.5",
  "fallback": "active"
}
```
## 🛡️ Validation System
- Selection: User picks an image.
- Size Check: JavaScript validates if file.size <= 10MB.
- Smart Alert: If invalid, a compact SweetAlert2 popup triggers.
- Processing: Valid images are converted to Base64 for the AI.

## 🛠️ Tech Stack
- AI: Gemini 1.5 Flash (via OpenRouter)
- Backend: FastAPI (Python)
- Frontend: React.js (JavaScript)
- Alerts: SweetAlert2
- Styling: CSS3 Custom Agriculture Theme

## 📜 License
```This project is licensed under the MIT License.```

Made with ❤️ for Farmers Worldwide 🌾



