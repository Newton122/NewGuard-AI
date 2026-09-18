from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
import re
import json
import requests
from bs4 import BeautifulSoup
from typing import Optional, List, Dict, Any
from collections import Counter
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
from fake_news_detector import FakeNewsDetector
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import io
import base64

app = FastAPI(
    title="NewsGuard AI - Advanced Fake News Detection",
    description="Multi-signal fake news detection using BERT, linguistic analysis, and source credibility",
    version="2.0.0"
)

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
    key_terms: List[str]
    scraped_content: Optional[str] = ""
    related_articles: List[Dict[str, Any]]

class SearchRequest(BaseModel):
    query: str
    max_results: int = 5

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    source: str
    credibility_score: float

class PDFRequest(BaseModel):
    title: str
    text: str
    source: str = ""
    prediction: str = ""
    confidence: float = 0.0
    risk_level: str = ""
    explanation: List[str] = []
    entities: List[str] = []
    topic: str = ""
    key_terms: List[str] = []

class StatsResponse(BaseModel):
    total_analyses: int
    fake_count: int
    true_count: int
    medium_count: int
    top_topics: List[Dict[str, Any]]
    recent_analyses: List[Dict[str, Any]]
    avg_confidence: float

tokenizer = None
model = None
device = None
detector = FakeNewsDetector()  # Initialize enhanced detector

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
            password="newton",
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
            """, (title, content, prediction, confidence, risk_level, json.dumps(explanation), json.dumps(entities), topic))
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
            topic=topic,
            key_terms=extract_key_terms(text),
            scraped_content=text if url else "",
            related_articles=search_related_articles(text, topic)
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

def extract_key_terms(text: str, max_terms: int = 10) -> List[str]:
    """Extract key terms from text using simple frequency analysis"""
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    stop_words = {
        'the', 'and', 'for', 'with', 'from', 'that', 'this', 'said', 'would', 'could',
        'should', 'have', 'been', 'were', 'was', 'are', 'was', 'has', 'had', 'not',
        'but', 'what', 'all', 'were', 'when', 'there', 'their', 'which', 'about', 'more',
        'other', 'into', 'than', 'them', 'then', 'these', 'some', 'would', 'make', 'like',
        'time', 'just', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some',
        'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come',
        'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our',
        'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
        'give', 'day', 'most', 'us', 'still', 'being', 'every', 'where', 'may', 'need',
        'here', 'help', 'through', 'before', 'found', 'something', 'those', 'between',
        'both', 'same', 'around', 'another', 'while', 'might', 'must', 'much'
    }
    word_freq = Counter(w for w in words if w not in stop_words and len(w) > 4)
    return [word for word, _ in word_freq.most_common(max_terms)]

def search_related_articles(text: str, topic: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """Search for related articles to cross-reference (simulated with trusted sources)"""
    related = []
    trusted_sources = [
        {"name": "Reuters", "url": "https://reuters.com", "credibility": 0.9},
        {"name": "AP News", "url": "https://apnews.com", "credibility": 0.9},
        {"name": "BBC", "url": "https://bbc.com", "credibility": 0.85},
        {"name": "NPR", "url": "https://npr.org", "credibility": 0.85},
        {"name": "The Guardian", "url": "https://theguardian.com", "credibility": 0.8},
        {"name": "CNN", "url": "https://cnn.com", "credibility": 0.7},
        {"name": "NBC News", "url": "https://nbcnews.com", "credibility": 0.75},
        {"name": "Al Jazeera", "url": "https://aljazeera.com", "credibility": 0.75},
    ]
    
    words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
    if not words:
        return related
    
    for source in trusted_sources[:max_results]:
        related.append({
            "title": f"{topic}: Related coverage from {source['name']}",
            "url": source["url"],
            "source": source["name"],
            "credibility_score": source["credibility"],
            "snippet": f"Cross-reference article about {topic.lower()} from {source['name']} for verification."
        })
    
    return related

@app.post("/search")
def search_articles(request: SearchRequest):
    """Search for related articles to cross-reference claims"""
    try:
        related = search_related_articles(request.query, "General", request.max_results)
        return {"results": related}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.post("/pdf")
def generate_pdf(request: PDFRequest):
    """Generate a PDF report of the analysis"""
    try:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        
        story = []
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1a1a2e'),
            spaceAfter=30
        )
        
        story.append(Paragraph("NewsGuard AI - Analysis Report", title_style))
        story.append(Spacer(1, 0.2 * inch))
        
        if request.title:
            story.append(Paragraph(f"<b>Title:</b> {request.title}", styles['Normal']))
        if request.source:
            story.append(Paragraph(f"<b>Source:</b> {request.source}", styles['Normal']))
        story.append(Spacer(1, 0.2 * inch))
        
        if request.prediction:
            risk_color = {
                "High": colors.HexColor('#ef4444'),
                "Medium": colors.HexColor('#f59e0b'),
                "Low": colors.HexColor('#10b981')
            }.get(request.risk_level, colors.black)
            
            story.append(Paragraph(f"<b>Prediction:</b> <font color='{risk_color.hexval()}'>{request.prediction}</font>", styles['Normal']))
            story.append(Paragraph(f"<b>Confidence:</b> {request.confidence * 100:.1f}%", styles['Normal']))
            story.append(Paragraph(f"<b>Risk Level:</b> {request.risk_level}", styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))
        
        if request.key_terms:
            story.append(Paragraph("<b>Key Terms Detected:</b>", styles['Heading3']))
            terms_text = ", ".join(request.key_terms)
            story.append(Paragraph(terms_text, styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))
        
        if request.explanation:
            story.append(Paragraph("<b>Analysis Details:</b>", styles['Heading3']))
            for exp in request.explanation:
                story.append(Paragraph(f"• {exp}", styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))
        
        if request.entities:
            story.append(Paragraph("<b>Entities Mentioned:</b>", styles['Heading3']))
            entities_text = ", ".join(request.entities)
            story.append(Paragraph(entities_text, styles['Normal']))
            story.append(Spacer(1, 0.2 * inch))
        
        if request.topic:
            story.append(Paragraph(f"<b>Topic:</b> {request.topic}", styles['Normal']))
        
        story.append(Spacer(1, 0.5 * inch))
        story.append(Paragraph("<i>Report generated by NewsGuard AI</i>", styles['Italic']))
        
        doc.build(story)
        buffer.seek(0)
        
        return Response(
            content=buffer.getvalue(),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=newsguard-report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@app.get("/stats")
def get_stats():
    """Get usage statistics for dashboard"""
    try:
        conn = get_db_connection()
        if not conn:
            return {
                "total_analyses": 0,
                "fake_count": 0,
                "true_count": 0,
                "medium_count": 0,
                "top_topics": [],
                "recent_analyses": [],
                "avg_confidence": 0.0
            }
        
        cur = conn.cursor()
        
        cur.execute("SELECT COUNT(*) as total FROM predictions")
        total = cur.fetchone()["total"]
        
        cur.execute("SELECT COUNT(*) as fake_count FROM predictions WHERE prediction = 'Likely Fake'")
        fake_count = cur.fetchone()["fake_count"]
        
        cur.execute("SELECT COUNT(*) as true_count FROM predictions WHERE prediction = 'True News'")
        true_count = cur.fetchone()["true_count"]
        
        cur.execute("SELECT COUNT(*) as medium_count FROM predictions WHERE risk_level = 'Medium'")
        medium_count = cur.fetchone()["medium_count"]
        
        cur.execute("SELECT AVG(confidence) as avg_conf FROM predictions")
        avg_conf = cur.fetchone()["avg_conf"] or 0.0
        
        cur.execute("""
            SELECT topic, COUNT(*) as count 
            FROM predictions 
            WHERE topic IS NOT NULL 
            GROUP BY topic 
            ORDER BY count DESC 
            LIMIT 5
        """)
        top_topics = [{"topic": row["topic"], "count": row["count"]} for row in cur.fetchall()]
        
        cur.execute("""
            SELECT title, prediction, confidence, risk_level, topic, created_at
            FROM predictions
            ORDER BY created_at DESC
            LIMIT 10
        """)
        recent = []
        for row in cur.fetchall():
            try:
                recent.append({
                    "title": row["title"],
                    "prediction": row["prediction"],
                    "confidence": row["confidence"],
                    "risk_level": row["risk_level"],
                    "topic": row["topic"],
                    "created_at": row["created_at"].isoformat() if row["created_at"] else ""
                })
            except Exception as row_err:
                print(f"Row error: {row_err}, row={row}")
                raise
        
        cur.close()
        conn.close()
        
        return {
            "total_analyses": total,
            "fake_count": fake_count,
            "true_count": true_count,
            "medium_count": medium_count,
            "top_topics": top_topics,
            "recent_analyses": recent,
            "avg_confidence": round(float(avg_conf), 4) if avg_conf else 0.0
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Stats failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
