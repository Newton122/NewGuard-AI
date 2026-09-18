# NewGuard-AI

Fake news detection web app: a FastAPI backend (BERT model + linguistic heuristics + source credibility) and a Next.js frontend.

## Models used

Each article is scored by three signals, which are combined into one credibility score:

| Signal | Model / method | Weight |
|--------|----------------|--------|
| Deep learning | [`Pulk17/Fake-News-Detection`](https://huggingface.co/Pulk17/Fake-News-Detection): a `bert-base-uncased` model (BERT, 12 layers) fine-tuned for real/fake news classification, run with PyTorch + Hugging Face Transformers | 70% |
| Source credibility | Rule-based check of the source name and URL domain against lists of trusted outlets and known satire/fake sites | 15% |
| Linguistic heuristics | Rule-based scoring of emotional and sensational wording, conspiracy phrases, excessive caps and exclamation marks | 15% |

- **Combined score ≥ 0.6:** "True News"; below that, the article is flagged as likely fake.
- **Risk level:** Low (≥ 0.7), Medium (0.4–0.7), High (< 0.4).

The app also extracts named entities, the topic and key terms for display.

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
