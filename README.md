# Portfolio-Sentinel: Autonomous Portfolio Sentinel

## 1. The Fintech Core (Data & Concurrency)
High-Velocity Ingestion: Go (Golang) data harvester pulling real-time WebSocket data from mock sources/Polygon.io.
Infrastructure: Redis caching layer handling high-frequency price updates.
Event-Driven Architecture: Pub/Sub model for immediate event triggers.

## 2. The Finance Engine (Quantitative Logic)
Dynamic Asset Allocation: Python Risk-Parity algorithm.
Predictive Modeling: LSTM neural network for short-term Alpha.
Risk Metrics: Real-time VaR and CVaR calculations.

## 3. The Fund Manager Interface (Decision Support)
Actionable Dashboard: React frontend with Heat Maps of Opportunity.
Scenario Simulator: Monte Carlo simulation engine ("What-if").
Compliance Ledger: SQL/PostgreSQL audit trail for every dynamic decision.

## 4. The "Edge" Feature (The 2026 Factor)
Sentiment Synthesis: NLP module analyzing FinTwit and earnings signals.

### Running Locally

```bash
docker-compose up -d

# Frontend
cd frontend
npm install
npm run dev

# Finance Engine
cd finance-engine
pip install -r requirements.txt
uvicorn main:app --reload

# Fintech Core
cd fintech-core
go run main.go
```
