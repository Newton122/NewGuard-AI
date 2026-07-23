from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
import re
import requests
from bs4 import BeautifulSoup
from typing import Optional, List, Dict
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

app = FastAPI(title="Fake News Detection API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsRequest(BaseModel):
    text: str
    title: Optional[str] = ""
    source: Optional[str] = ""
    url: Optional[str] = ""

class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    risk_level: str
    bert_score: float
    source_score: float
    heuristic_score: float
    explanation: List[str]
    model_predictions: Dict[str, str]
    entities: List[str]
    topic: str

tokenizer = None
model = None
device = None

FAKE_DOMAINS = [
    "theonion.com", "babylonbee.com", "worldnewsdailyreport.com",
    "nationalreport.net", "newsbiscuit.com", "thespoof.com",
    "dailysquib.co.uk", "thepoke.co.uk", "waterfordwhispersnews.com"
]

EMOTIONAL_WORDS = [
    "shocking", "unbelievable", "amazing", "incredible", "outrageous",
    "mind-blowing", "earth-shattering", "game-changing", "bombshell",
    "explosive", "devastating", "horrifying", "terrifying", "scandalous",
    "breaking", "urgent", "exclusive", "confirmed", "secret"
]

RISKY_PHRASES = [
    "they don't want you to know", "mainstream media won't report",
    "cover-up", "conspiracy", "exposed", "leaked documents",
    "whistleblower", "censored", "suppressed", "hidden truth"
]

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="news_detection",
            user="newton",
            password="",
            cursor_factory=RealDictCursor
        )
        return conn
    except Exception as e:
        print(f"DB connection failed: {e}")
        return None

def init_db():
    try:
        conn = get_db_connection()
        if conn:
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS predictions (
                    id SERIAL PRIMARY KEY,
                    title TEXT,
                    content TEXT NOT NULL,
                    prediction VARCHAR(20) NOT NULL,
                    confidence FLOAT NOT NULL,
                    risk_level VARCHAR(20) NOT NULL,
                    explanation JSONB NOT NULL,
                    entities JSONB NOT NULL,
                    topic VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
            cur.close()
            conn.close()
            print("Database initialized")
    except Exception as e:
        print(f"DB init failed: {e}")

def save_prediction(title: str, content: str, prediction: str, confidence: float,
                   risk_level: str, explanation: List[str], entities: List[str], topic: str):
    try:
        conn = get_db_connection()
        if conn:
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO predictions (title, content, prediction, confidence, risk_level, explanation, entities, topic)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (title, content, prediction, confidence, risk_level, explanation, entities, topic))
            conn.commit()
            cur.close()
            conn.close()
    except Exception as e:
        print(f"Failed to save prediction: {e}")

def scrape_url(url: str) -> str:
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        text = soup.get_text(separator=' ', strip=True)
        text = re.sub(r'\s+', ' ', text)
        return text[:5000]
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")

def analyze_heuristics(text: str) -> Dict:
    explanations = []
    caps_ratio = 0.0
    emotional_count = 0
    risky_count = 0
    exclamation_count = 0
    
    words = text.split()
    if len(words) > 0:
        caps_words = [w for w in words if w.isupper() and len(w) > 1]
        caps_ratio = len(caps_words) / len(words)
        if caps_ratio > 0.1:
            explanations.append(f"Excessive capitalization detected ({caps_ratio:.1%} of words)")
    
    text_lower = text.lower()
    for word in EMOTIONAL_WORDS:
        if word in text_lower:
            emotional_count += text_lower.count(word)
    if emotional_count > 0:
        explanations.append(f"Emotional/sensational language detected ({emotional_count} instances)")
    
    for phrase in RISKY_PHRASES:
        if phrase in text_lower:
            risky_count += 1
    if risky_count > 0:
        explanations.append(f"Misinformation patterns detected ({risky_count} flagged phrases)")
    
    exclamation_count = text.count('!')
    if exclamation_count > 3:
        explanations.append(f"Excessive punctuation ({exclamation_count} exclamation marks)")
    
    risk_score = min(1.0, (caps_ratio * 2 + emotional_count * 0.05 + risky_count * 0.1 + exclamation_count * 0.02))
    
    return {
        "risk_score": round(risk_score, 3),
        "explanations": explanations
    }

def extract_entities_and_topic(text: str) -> tuple:
    entities = []
    topic = "General"
    
    # Simple named entity extraction
    capitalized = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
    entities = list(set([c for c in capitalized if len(c) > 2 and c.lower() not in ['the', 'and', 'for', 'with', 'from', 'that', 'this', 'said', 'would', 'could', 'should']]))[:10]
    
    # Simple topic detection
    text_lower = text.lower()
    topics = {
        'Politics': ['president', 'congress', 'senate', 'election', 'vote', 'democrat', 'republican', 'government', 'policy', 'law'],
        'Technology': ['tech', 'ai', 'software', 'computer', 'internet', 'data', 'digital', 'robot', 'app', 'cyber'],
        'Health': ['health', 'medical', 'doctor', 'hospital', 'drug', 'vaccine', 'disease', 'covid', 'virus', 'treatment'],
        'Business': ['company', 'stock', 'market', 'economic', 'trade', 'profit', 'revenue', 'ceo', 'investment', 'bank'],
        'Sports': ['game', 'team', 'player', 'score', 'win', 'championship', 'league', 'match', 'tournament', 'coach'],
        'Science': ['research', 'study', 'scientist', 'experiment', 'discovery', 'space', 'nasa', 'climate', 'energy']
    }
    
    for topic_name, keywords in topics.items():
        if any(keyword in text_lower for keyword in keywords):
            topic = topic_name
            break
    
    return entities, topic

def check_source_credibility(source: str, url: str = "") -> Dict:
    score = 0.5
    explanations = []
    
    if url:
        try:
            from urllib.parse import urlparse
            domain = urlparse(url).netloc.lower()
            if domain in FAKE_DOMAINS:
                score = 0.1
                explanations.append(f"Source domain '{domain}' is known for fake/satire content")
            elif domain.endswith('.gov') or domain.endswith('.edu'):
                score = 0.9
                explanations.append(f"Source domain '{domain}' is a credible government/educational source")
            elif domain.endswith('.org'):
                score = 0.7
                explanations.append(f"Source domain '{domain}' is an organization")
            else:
                score = 0.5
        except:
            pass
    
    if source:
        source_lower = source.lower()
        credible_sources = ['reuters', 'associated press', 'ap', 'bbc', 'npr', 'washington post', 'new york times', 'guardian', 'al jazeera', 'cnn', 'fox news', 'nbc', 'cbs', 'abc']
        fake_indicators = ['blog', 'forum', 'reddit', 'twitter', 'facebook', 'youtube', 'conspiracy', 'truth']
        
        for credible in credible_sources:
            if credible in source_lower:
                score = max(score, 0.8)
                explanations.append(f"Source '{source}' appears to be a credible news organization")
                break
        
        for indicator in fake_indicators:
            if indicator in source_lower:
                score = min(score, 0.3)
                explanations.append(f"Source '{source}' has lower credibility indicators")
                break
    
    return {
        "score": round(score, 3),
        "explanations": explanations
    }

def get_risk_level(combined_score: float) -> str:
    if combined_score >= 0.7:
        return "Low"
    elif combined_score >= 0.4:
        return "Medium"
    else:
        return "High"

@app.on_event("startup")
def load_model():
    global tokenizer, model, device
    
    model_name = "Pulk17/Fake-News-Detection"
    
    print(f"Loading model: {model_name}")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    model = model.to(device)
    model.eval()
    
    init_db()
    
    print("Model loaded!")

@app.get("/")
def health_check():
    return {"status": "ok", "models_loaded": model is not None}

@app.get("/history")
def get_history(limit: int = 20):
    try:
        conn = get_db_connection()
        if not conn:
            return {"history": []}
        cur = conn.cursor()
        cur.execute("""
            SELECT title, prediction, confidence, risk_level, topic, created_at
            FROM predictions
            ORDER BY created_at DESC
            LIMIT %s
        """, (limit,))
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return {"history": rows}
    except Exception as e:
        return {"history": [], "error": str(e)}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: NewsRequest):
    text = request.text.strip()
    url = request.url.strip()
    
    if not text and not url:
        raise HTTPException(status_code=400, detail="Text or URL is required")
    
    if tokenizer is None or model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Scrape URL if provided
    if url and not text:
        text = scrape_url(url)
    
    text = text[:5000]
    if len(text) > 1024:
        text = text[:1024]
    
    try:
        # BERT prediction
        inputs = tokenizer(
            text,
            truncation=True,
            max_length=512,
            return_tensors="pt",
            padding=True
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1)
            pred_idx = torch.argmax(probs, dim=-1).item()
            bert_confidence = probs[0][pred_idx].item()
        
        bert_prediction = "Fake News" if pred_idx == 0 else "True News"
        bert_score = bert_confidence if bert_prediction == "True News" else (1 - bert_confidence)
        
        # Heuristic analysis
        heuristic = analyze_heuristics(text)
        heuristic_score = 1 - heuristic["risk_score"]
        
        # Source credibility
        source_result = check_source_credibility(request.source, request.url or url)
        source_score = source_result["score"]
        
        # Entities and topic
        entities, topic = extract_entities_and_topic(text)
        
        # Multi-signal scoring: 70% BERT, 15% source, 15% heuristics
        combined_score = (bert_score * 0.7) + (source_score * 0.15) + (heuristic_score * 0.15)
        
        if combined_score >= 0.6:
            prediction = "True News"
        else:
            prediction = "Likely Fake"
        
        confidence = round(combined_score, 4)
        risk_level = get_risk_level(combined_score)
        
        explanations = []
        if bert_prediction == "Fake News":
            explanations.append("BERT model detected fake news patterns")
        else:
            explanations.append("BERT model detected real news patterns")
        explanations.extend(heuristic["explanations"])
        explanations.extend(source_result["explanations"])
        
        if not explanations:
            explanations.append("No strong risk signals detected")
        
        model_predictions = {
            "bert": bert_prediction,
            "heuristics": "Suspicious" if heuristic["risk_score"] > 0.5 else "Normal"
        }
        
        # Save to database
        save_prediction(
            title=request.title,
            content=text,
            prediction=prediction,
            confidence=confidence,
            risk_level=risk_level,
            explanation=explanations,
            entities=entities,
            topic=topic
        )
        
        return PredictionResponse(
            prediction=prediction,
            confidence=confidence,
            risk_level=risk_level,
            bert_score=round(bert_score, 4),
            source_score=round(source_score, 4),
            heuristic_score=round(heuristic_score, 4),
            explanation=explanations,
            model_predictions=model_predictions,
            entities=entities,
            topic=topic
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
