import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai

load_dotenv()

api_key = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("GOOGLE_API_KEY")
    or os.getenv("OPENAI_API_KEY")
)

if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("models/gemini-2.5-flash")
else:
    model = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Question(BaseModel):
    question: str
    student_class: str  # "6", "7", "8"


cache = {}


def generate_answer(q, student_class):
    try:
        if model is None:
            return "Server is missing a Gemini API key. Add GEMINI_API_KEY in backend/.env."

        cache_key = f"{student_class}:{q}"

        if cache_key in cache:
            print("CACHE HIT")
            return cache[cache_key]

        prompt = f"""
You are a friendly Tamil Nadu school teacher.

Step 1: Classify the question into one of:
- Class 6
- Class 7
- Class 8
- Outside syllabus

Step 2:
- If it matches student's class ({student_class}):
  Explain in Taminglish (Tamil + English mix).
  Do NOT translate scientific words.

  Keep answer SHORT (max 120 words).

  Format:
  Definition:
  Explanation:
  Example:
  Check Question:
  Exam Answer:

- If it is ABOVE student's class:
  Start with:
  "This is above your class, but I will simplify it."

  Then explain in very simple Taminglish (max 100 words).

- If OUTSIDE syllabus:
  Start with:
  "This is outside your syllabus, but I will explain simply."

  Then explain briefly (max 80 words).

IMPORTANT:
- Do NOT show classification
- Only give final answer

Question: {q}
"""

        response = model.generate_content(prompt)
        answer = response.text
        cache[cache_key] = answer

        return answer

    except Exception as e:
        print("Error:", e)
        return "Something went wrong. Try again."


@app.post("/ask")
def ask(q: Question):
    try:
        answer = generate_answer(q.question, q.student_class)
        return {"answer": answer}
    except Exception as e:
        return {"error": str(e)}


@app.get("/")
def home():
    return {"message": "AI Study Buddy Backend Running"}
