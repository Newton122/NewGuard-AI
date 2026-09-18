-- Database schema for Fake News Detection App

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    content TEXT NOT NULL,
    prediction VARCHAR(20) NOT NULL,
    confidence FLOAT NOT NULL,
    model_predictions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles(created_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_prediction ON news_articles(prediction);

CREATE TABLE IF NOT EXISTS n_queens_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    n INTEGER NOT NULL,
    solution_count INTEGER NOT NULL,
    samples JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_n_queens_runs_created_at ON n_queens_runs(created_at);
CREATE INDEX IF NOT EXISTS idx_n_queens_runs_n ON n_queens_runs(n);
