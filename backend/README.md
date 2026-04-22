# AI Study Buddy Backend

This backend is a small FastAPI service that answers student questions using a Gemini model. It is designed for Tamil Nadu school students and returns short, simple explanations in Taminglish based on the student's class level.

## Features

- FastAPI-based API
- Gemini-powered answer generation
- Class-aware prompt handling for classes 6, 7, and 8
- Simple in-memory response cache
- Environment-based API key loading

## Requirements

- Python 3.10+
- A Gemini API key

## Setup

1. Create and activate a virtual environment.

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
```

2. Install dependencies.

```powershell
pip install -r requirements.txt
```

3. Create your environment file.

```powershell
Copy-Item .env.example .env
```

4. Add your API key to `.env`.

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

The app also checks `GOOGLE_API_KEY` and `OPENAI_API_KEY`, but the current backend is configured to use the Gemini SDK.

## Run the Server

```powershell
uvicorn main:app --reload
```

By default, the API runs at `http://127.0.0.1:8000`.

## API Endpoints

### `GET /`

Health check endpoint.

Example response:

```json
{
  "message": "AI Study Buddy Backend Running"
}
```

### `POST /ask`

Accepts a student question and class level.

Request body:

```json
{
  "question": "What is photosynthesis?",
  "student_class": "7"
}
```

Success response:

```json
{
  "answer": "..."
}
```

## Notes

- Do not commit your real `.env` file.
- The current cache is in memory, so it resets when the server restarts.
- CORS is currently open to all origins.
