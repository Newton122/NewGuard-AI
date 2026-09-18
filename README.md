# NewGuard-AI

Fake news detection web app: a FastAPI backend (BERT model + linguistic heuristics + source credibility) and a Next.js frontend.

## Requirements
- Python 3.10+
- Node.js 20+
- PostgreSQL (database `news_detection`)

## Run locally

**Backend**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```
The model (`Pulk17/Fake-News-Detection`) downloads from Hugging Face on first start.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:3000. Set `NEXT_PUBLIC_API_URL` if the backend is not on `http://localhost:8000`.

## API
- `POST /predict` — analyze an article (`text`, `title`, `source`, `url`)
- `GET /history` — past analyses
- `GET /stats` — aggregate statistics
- `POST /pdf` — export a report as PDF
- `POST /search` — related articles
