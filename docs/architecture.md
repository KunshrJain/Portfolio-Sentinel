# Distributed Agentic Financial Intelligence Architecture

## 1. Fintech Core
Language: Go
Responsibility: High-velocity data ingestion via WebSockets. Connects to Redis and implements a resilient Pub/Sub pattern for trading ticks and macro events.

## 2. Finance Engine
Language: Python (FastAPI)
Responsibility: Quant engine. Incorporates:
- Risk Parity Asset Allocation
- LSTM Predictive Modeling
- VaR & CVaR Measurements
- NLP Sentiment Synthesis

## 3. Manager Dashboard
Language: React (Vite)
Responsibility: High performance heat map tree-map visualization using Recharts. Provides a scenario simulator for interactive stress testing.
