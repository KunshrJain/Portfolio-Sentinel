import asyncio
import json
import logging
import pandas as pd
import redis.asyncio as redis
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from risk_parity import get_allocation
from lstm_predictor import train_and_predict_alpha, calculate_var_cvar
from nlp_sentiment import get_sentiment_score

logging.basicConfig(level=logging.INFO)

class FinanceData:
    history = {"BTCUSDT": [], "ETHUSDT": [], "SOLUSDT": [], "XRPUSDT": []}

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

async def redis_listener():
    pubsub = redis_client.pubsub()
    await pubsub.subscribe("prices:realtime")
    try:
        async for message in pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    sym = data.get("symbol")
                    price = data.get("price")
                    if sym in FinanceData.history:
                        FinanceData.history[sym].append(price)
                        if len(FinanceData.history[sym]) > 100:
                            FinanceData.history[sym].pop(0)
                        logging.info(f"Updated {sym} price: {price}")
                except Exception as e:
                    logging.error(f"Error parsing message: {e}")
    except asyncio.CancelledError:
        pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(redis_listener())
    yield
    task.cancel()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/portfolio")
async def get_portfolio():
    min_len = 1000
    for sym, prices in FinanceData.history.items():
        if len(prices) > 0 and len(prices) < min_len:
            min_len = len(prices)
            
    if min_len < 20:
        return {"metrics": {}, "status": "Warming up... need more data ticks"}
        
    df_data = {}
    for sym, prices in FinanceData.history.items():
        df_data[sym] = prices[-min_len:]
        
    df = pd.DataFrame(df_data)
    alloc = get_allocation(df)
    
    metrics = {}
    for sym in df.columns:
        prices = df[sym].values
        alpha = train_and_predict_alpha(prices)
        returns = df[sym].pct_change().dropna().values
        var, cvar = calculate_var_cvar(returns)
        sentiment = get_sentiment_score(sym)
        metrics[sym] = {
            "allocation": float(alloc[sym]),
            "alpha": float(alpha),
            "var": float(var),
            "cvar": float(cvar),
            "sentiment": float(sentiment),
            "latest_price": float(prices[-1])
        }
    return {"metrics": metrics, "status": "Active"}
