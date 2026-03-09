import requests
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from dotenv import load_dotenv

_env_file = Path(__file__).resolve().parent / ".env"
load_dotenv(_env_file)
load_dotenv()  # fallback: load .env from current working directory

app = FastAPI()
_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
allow_origins = [o.strip() for o in _cors_origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables!")

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.1-8b-instant"

# Structured prompts — scalable and clean. Add new tasks here.
TASK_PROMPTS = {
    "summarize": "Summarize the following lecture notes clearly and concisely:\n\n{}",
    "rewrite": "Rewrite the following text to sound clear and academic:\n\n{}",
    "flashcards": "Create flashcards (Q&A format) from the following notes:\n\n{}",
    "quiz": "Generate 5 quiz questions from the following material:\n\n{}",
    "bullets": "Convert the following text into structured bullet points:\n\n{}",
}

# Max tokens per task (Groq supports up to model limit)
TASK_MAX_TOKENS = {
    "summarize": 500,
    "rewrite": 800,
    "flashcards": 1024,
    "quiz": 1024,
    "bullets": 600,
}


class TextRequest(BaseModel):
    text: str
    task: str


@app.get("/")
def root():
    """Health check / API info."""
    return {"app": "EzeAssist", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    """Health check for deployment."""
    return {"status": "ok"}


def get_prompt(task: str, text: str) -> str:
    template = TASK_PROMPTS.get(task)
    if not template:
        raise ValueError(
            f"Unknown task: {task}. Valid tasks: {list(TASK_PROMPTS.keys())}"
        )
    return template.format(text.strip())


@app.get("/tasks")
async def list_tasks():
    """Return available tasks for the frontend."""
    return {"tasks": list(TASK_PROMPTS.keys())}


@app.post("/process")
async def process_text(request: TextRequest):
    try:
        prompt = get_prompt(request.task, request.text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    max_tokens = TASK_MAX_TOKENS.get(request.task, 512)

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.3,
    }

    try:
        response = requests.post(
            GROQ_URL, headers=headers, json=payload, timeout=90
        )
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(
            status_code=500, detail=f"Request failed: {str(e)}"
        )

    data = response.json()
    try:
        result = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
    except (IndexError, KeyError, TypeError, AttributeError):
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected Groq API response format: {data}",
        )

    if not result:
        raise HTTPException(
            status_code=500, detail="Empty response from model"
        )

    return {"result": result}
