"""
Advanced Fake News Detection Model
Combines multiple detection strategies for robust fake news identification
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
import re
from collections import Counter
import math

class FakeNewsDetector:
    """Comprehensive fake news detector using multiple signals"""
    
    def __init__(self):
        self.emotional_intensity_threshold = 0.6
        self.sensationalism_score_threshold = 0.65
        self.credibility_threshold = 0.5
        
    # ==================== LINGUISTIC ANALYSIS ====================
    
    def analyze_emotional_language(self, text: str) -> float:
        """
        Analyze emotional intensity in text
        Returns score 0-1 where higher = more emotional/sensational
        """
        emotional_words = {
            'shocking': 0.95, 'unbelievable': 0.9, 'amazing': 0.85, 'incredible': 0.9,
            'outrageous': 0.95, 'mind-blowing': 0.95, 'earth-shattering': 0.95,
            'game-changing': 0.8, 'bombshell': 0.95, 'explosive': 0.9,
            'devastating': 0.85, 'horrifying': 0.9, 'terrifying': 0.9,
            'scandalous': 0.85, 'urgent': 0.7, 'exclusive': 0.6,
            'confirmed': 0.4, 'secret': 0.8, 'exposed': 0.85,
            'leaked': 0.8, 'alert': 0.75, 'breaking': 0.6
        }
        
        text_lower = text.lower()
        found_words = []
        scores = []
        
        for word, score in emotional_words.items():
            if word in text_lower:
                count = len(re.findall(r'\b' + word + r'\b', text_lower))
                found_words.extend([word] * count)
                scores.extend([score] * count)
        
        if not scores:
            return 0.0
            
        # Calculate average score and normalize by frequency
        avg_score = np.mean(scores)
        frequency_multiplier = min(len(found_words) / 10, 1.0)  # Cap at 10 words
        
        return min(avg_score * (0.7 + frequency_multiplier * 0.3), 1.0)
    
    def analyze_sensationalism(self, text: str) -> float:
        """
        Detect sensationalist patterns:
        - ALL CAPS words
        - Excessive punctuation
        - Clickbait patterns
        Returns 0-1 score
        """
        sensationalism_score = 0.0
        
        # Check for ALL CAPS words (more than 2 letters)
        caps_words = re.findall(r'\b[A-Z]{3,}\b', text)
        if caps_words:
            sensationalism_score += min(len(caps_words) / 5, 0.3)
        
        # Check for excessive punctuation
        exclamations = text.count('!')
        questions = text.count('?')
        punctuation_intensity = (exclamations + questions) / max(len(text) / 100, 1)
        sensationalism_score += min(punctuation_intensity * 0.3, 0.25)
        
        # Check for clickbait patterns
        clickbait_patterns = [
            r'you won\'t believe',
            r'doctors hate',
            r'this one trick',
            r'click here',
            r'you must see',
            r'shocking revelation',
            r'what happens next'
        ]
        
        clickbait_count = sum(1 for pattern in clickbait_patterns 
                            if re.search(pattern, text.lower()))
        sensationalism_score += min(clickbait_count * 0.15, 0.3)
        
        return min(sensationalism_score, 1.0)
    
    def analyze_propaganda_patterns(self, text: str) -> float:
        """
        Detect propaganda and conspiracy language
        Returns 0-1 score
        """
        propaganda_patterns = {
            r"they don't want you to know": 0.95,
            r"mainstream media won't report": 0.9,
            r"cover-up": 0.85,
            r"conspiracy": 0.8,
            r"exposed": 0.85,
            r"leaked documents": 0.75,
            r"whistleblower": 0.6,
            r"censored": 0.85,
            r"suppressed": 0.85,
            r"hidden truth": 0.9,
            r"wake up": 0.7,
            r"sheep": 0.7,
            r"obviously fake": 0.8,
            r"government conspiracy": 0.85,
            r"deep state": 0.8
        }
        
        scores = []
        for pattern, score in propaganda_patterns.items():
            if re.search(pattern, text.lower()):
                count = len(re.findall(pattern, text.lower()))
                scores.extend([score] * count)
        
        if not scores:
            return 0.0
        
        return min(np.mean(scores), 1.0)
    
    # ==================== STATISTICAL ANALYSIS ====================
    
    def analyze_text_coherence(self, text: str) -> float:
        """
        Analyze logical flow and coherence
        Higher score = better coherence = likely more credible
        Returns 0-1 score (inverted from others)
        """
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        if len(sentences) < 2:
            return 0.5
        
        # Check for transitional words (indicates better structure)
        transitional_words = [
            'however', 'therefore', 'moreover', 'furthermore',
            'additionally', 'consequently', 'meanwhile', 'meanwhile',
            'first', 'second', 'finally', 'in conclusion', 'as a result'
        ]
        
        transitions_found = sum(1 for word in transitional_words 
                              if word in text.lower())
        transition_score = min(transitions_found / 3, 1.0)
        
        # Check average sentence length (too short = click-baity)
        avg_sentence_length = np.mean([len(s.split()) for s in sentences])
        length_score = min(avg_sentence_length / 20, 1.0)  # Optimal around 20 words
        
        # Check for credible sources/citations
        citation_patterns = [
            r'according to',
            r'studies show',
            r'research indicates',
            r'sources say',
            r'data shows',
            r'reports indicate'
        ]
        citations = sum(1 for pattern in citation_patterns 
                       if re.search(pattern, text.lower()))
        citation_score = min(citations / 3, 1.0)
        
        coherence = (transition_score * 0.3 + length_score * 0.4 + citation_score * 0.3)
        return coherence
    
    def analyze_source_credibility(self, source: str, domain: str = None) -> float:
        """
        Score based on source reputation
        Returns 0-1 where 1 = most credible
        """
        credible_sources = [
            'reuters', 'bbc', 'ap news', 'associated press',
            'nytimes', 'new york times', 'theguardian', 'guardian',
            'wsj', 'wall street journal', 'ft', 'financial times',
            'telegraph', 'economist', 'nature', 'science',
            'sciencedaily', 'nasa', 'who', 'un'
        ]
        
        suspicious_domains = [
            'theonion.com', 'babylonbee.com', 'worldnewsdailyreport.com',
            'nationalreport.net', 'newsbiscuit.com', 'thespoof.com',
            'dailysquib.co.uk', 'thepoke.co.uk', 'waterfordwhispersnews.com'
        ]
        
        if domain and domain.lower() in suspicious_domains:
            return 0.1  # Known satire/fake news sites
        
        source_lower = source.lower() if source else ""
        
        # Check against credible sources
        for credible in credible_sources:
            if credible in source_lower:
                return 0.9
        
        # Default neutral score
        return 0.5
    
    # ==================== MAIN DETECTION METHOD ====================
    
    def detect(self, text: str, title: str = "", source: str = "", 
               url: str = "") -> Dict:
        """
        Comprehensive fake news detection
        
        Returns:
        {
            'score': 0-1 (1 = definitely fake, 0 = likely real),
            'confidence': 0-1,
            'components': {
                'emotional': score,
                'sensationalism': score,
                'propaganda': score,
                'coherence': score,
                'source': score
            },
            'risk_level': 'Low' | 'Medium' | 'High',
            'signals': [list of detected issues]
        }
        """
        
        full_text = f"{title} {text}".strip()
        signals = []
        
        # Analyze each component
        emotional_score = self.analyze_emotional_language(full_text)
        sensationalism_score = self.analyze_sensationalism(full_text)
        propaganda_score = self.analyze_propaganda_patterns(full_text)
        coherence_score = self.analyze_text_coherence(full_text)  # Higher is better
        source_score = self.analyze_source_credibility(source, url)  # Higher is better
        
        # Build signal list
        if emotional_score > self.emotional_intensity_threshold:
            signals.append(f"High emotional language detected (score: {emotional_score:.2f})")
        
        if sensationalism_score > self.sensationalism_score_threshold:
            signals.append(f"Sensationalist patterns detected (score: {sensationalism_score:.2f})")
        
        if propaganda_score > 0.6:
            signals.append(f"Propaganda/conspiracy language detected (score: {propaganda_score:.2f})")
        
        if coherence_score < 0.4:
            signals.append(f"Poor text coherence (score: {coherence_score:.2f})")
        
        if source_score < 0.4:
            signals.append(f"Source credibility concerns (score: {source_score:.2f})")
        
        # Calculate final fake news score (weighted combination)
        fake_score = (
            emotional_score * 0.20 +
            sensationalism_score * 0.20 +
            propaganda_score * 0.25 +
            (1 - coherence_score) * 0.15 +  # Invert coherence (lower is worse)
            (1 - source_score) * 0.20  # Invert source (lower credibility = higher fake score)
        )
        
        # Determine risk level
        if fake_score > 0.75:
            risk_level = "High"
        elif fake_score > 0.5:
            risk_level = "Medium"
        else:
            risk_level = "Low"
        
        # Calculate confidence based on signal consistency
        max_signals = 5
        signal_confidence = 1 - (len(signals) / max_signals)
        base_confidence = 0.75
        confidence = base_confidence + signal_confidence * 0.25
        
        return {
            'score': fake_score,
            'confidence': min(confidence, 1.0),
            'components': {
                'emotional': emotional_score,
                'sensationalism': sensationalism_score,
                'propaganda': propaganda_score,
                'coherence': coherence_score,
                'source': source_score
            },
            'risk_level': risk_level,
            'signals': signals,
            'num_signals': len(signals)
        }
