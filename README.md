# Memory Based AI CRM

AI-powered CRM using vector database and RAG pipeline to analyze client interactions and generate insights.

## Features

- Semantic search
- Client interaction tracking
- Churn prediction
- Sentiment analysis
- AI-powered insights

## Tech Stack

Frontend:
- Next.js
- TypeScript
- Tailwind CSS

Backend:
- FastAPI

Database:
- PostgreSQL

Vector DB:
- Qdrant / Chroma

AI:
- OpenAI / Ollama

## Setup

Frontend:
cd frontend
npm install
npm run dev

Backend:
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

## Environment Variables

OPENAI_API_KEY=
DATABASE_URL=
QDRANT_URL=
