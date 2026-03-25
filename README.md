# Portfolio-Sentinel: Autonomous Portfolio Sentinel

I (Kunsh) designed and architected this full-stack, "Agentic" Financial Intelligence System. My goal was to provide a real-time, crash-resilient command center that bridges the gap between raw market data and sophisticated capital allocation strategies.

## 1. The Fintech Core (Data & Concurrency)
I engineered a high-velocity data harvester in Go (Golang) that pulls real-time WebSocket data (e.g., Binance trades). To ensure zero-latency price updates, I integrated a Redis caching layer and implemented an event-driven Pub/Sub architecture for immediate price drop alerts.

## 2. The Finance Engine (Quantitative Logic)
I built a Python Engine (using FastAPI) to continuously execute quantitative logic. I implemented a dynamic Risk-Parity allocation algorithm alongside an LSTM-based neural network model (via Scikit-Learn) to predict short-term Alpha. I also calculated real-time VaR and CVaR risk metrics to map conditional worst-case scenarios.

## 3. The Fund Manager Interface (Decision Support)
For the frontend, I developed a highly responsive React application utilizing Vite. I replaced traditional charts with "Heat Maps of Opportunity" utilizing dynamic Treemaps. I also implemented a Scenario Simulator to test interest rate shocks continuously in real-time.

## 4. The "Edge" Feature (The 2026 Factor)
To synthesize market reception, I integrated an NLP module that actively scrapes and synthetically analyzes "FinTwit" signals and earnings data using TextBlob, generating a unified sentiment consensus score for the portfolio.

### Running Locally

```bash
docker-compose up -d

# Frontend
cd frontend
npm install
npm run dev

# Finance Engine
cd finance-engine
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload

# Fintech Core
cd fintech-core
go run main.go
```
