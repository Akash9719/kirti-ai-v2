from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models import LeadRequest, LeadResponse
from sheets import save_to_google_sheets

from config import settings
from models import (
    ChatRequest,
    ChatResponse,
    HealthResponse
)

app = FastAPI(

    title=settings.APP_NAME,

    version="2.0.0",

    description="Kirti AI Backend API"
)

# -----------------------
# CORS
# -----------------------

app.add_middleware(

    CORSMiddleware,

    allow_origins=settings.ALLOWED_ORIGINS,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

# -----------------------
# Home
# -----------------------

@app.get("/")

def home():

    return {

        "message": "Kirti AI Backend Running",

        "version": "2.0.0"
    }

# -----------------------
# Health
# -----------------------

@app.get(
    "/health",
    response_model=HealthResponse
)

def health():

    return {

        "status": "healthy"
    }

# -----------------------
# Chat
# -----------------------

from chatbot import generate_response
@app.post(
    "/chat",
    response_model=ChatResponse
)

def chat(request: ChatRequest):

    reply = generate_response(

        request.session_id,

        request.message

    )

    return {

        "reply": reply
    }
