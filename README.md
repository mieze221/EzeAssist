# EzeAssist

AI-powered study tools: summarize notes, rewrite for clarity, generate flashcards, quiz questions, and bullet points. Full-stack (React + FastAPI + Groq).

## Live demo

Add your deployed frontend URL here after you deploy (e.g. `https://ezeassist.vercel.app`).

## Deploy (live website)

Deploy backend first, then frontend, then connect them.

**1. Deploy backend** (Railway or Render)

- **Railway:** Sign in at [railway.app](https://railway.app), New Project → Deploy from GitHub → select your repo. Set **Root Directory** to `backend`. Add variable `GROQ_API_KEY`. After deploy, add variable `CORS_ORIGINS` = `https://your-frontend-url.vercel.app` (you’ll get the frontend URL in step 2). Copy the public backend URL (e.g. `https://your-app.railway.app`).
- **Render:** Sign in at [render.com](https://render.com), New → Web Service → connect repo. Set **Root Directory** to `backend`, build command `pip install -r requirements.txt`, start command `uvicorn main:app --host 0.0.0.0 --port $PORT`. Add env vars `GROQ_API_KEY` and `CORS_ORIGINS` (same as above). Copy the service URL.

**2. Deploy frontend** (Vercel)

- Sign in at [vercel.com](https://vercel.com), Import your GitHub repo. Set **Root Directory** to `frontend`. Add environment variable `REACT_APP_API_URL` = your backend URL from step 1 (e.g. `https://your-app.railway.app`). Deploy.
- Copy your frontend URL (e.g. `https://ezeassist.vercel.app`).

**3. Connect backend to frontend**

- In Railway/Render, set or update `CORS_ORIGINS` to include your Vercel URL, e.g. `https://ezeassist.vercel.app`. Redeploy the backend if needed.
- Put your frontend URL in the **Live demo** section at the top of this README.

## Features

- **Study Tools** — Paste notes or text and get:
  - Summaries
  - Rewrites for clarity
  - Flashcards (Q&A)
  - Quiz questions
  - Bullet-point outlines

## Tech stack

- **Backend:** Python, FastAPI, [Groq](https://groq.com) API (Llama)
- **Frontend:** React
- **API:** REST

## Setup

### Backend

1. Go to the backend folder and use a virtual environment (recommended):

   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file (copy from example):

   ```bash
   cp .env.example .env
   ```

4. Add your Groq API key to `.env`:

   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

   Get a key at [Groq Console](https://console.groq.com).

5. (Optional) For production, set allowed frontend origins (comma-separated):

   ```
   CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
   ```

6. Run the server:

   ```bash
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

   API docs: http://127.0.0.1:8000/docs

### Frontend

1. From the project root:

   ```bash
   cd frontend
   npm install
   npm start
   ```

2. Open http://localhost:3000. The app uses the backend at `http://127.0.0.1:8000` by default.

3. **Production / deployment:** Set the backend URL via environment variable. In Vercel/Netlify, add:
   - `REACT_APP_API_URL=https://your-backend.railway.app` (or your deployed backend URL)
   Builds will then call that API instead of localhost.

## Project layout

- `backend/` — FastAPI app (`main.py`), `.env`, `requirements.txt`
- `frontend/` — React app (Create React App), `public/logo.png`, `src/App.js` + `App.css`

## Notes

- Study tools require the backend to be running and a valid `GROQ_API_KEY` in backend `.env`.
- For a live demo, deploy frontend and backend separately and set `REACT_APP_API_URL` and `CORS_ORIGINS` as above.
