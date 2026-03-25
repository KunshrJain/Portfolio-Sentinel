import random
from textblob import TextBlob

def get_sentiment_score(symbol):
    mock_tweets = [
        f"{symbol} is showing great profit margins in the Indian markets.",
        f"FIIs are heavily selling {symbol} today.",
        f"Neutral stance on {symbol} ahead of RBI policy limits.",
        f"Waiting for {symbol}'s Q3 earnings report.",
        f"Retail is buying the dip on {symbol} heavily!"
    ]
    tweets = random.sample(mock_tweets, 3)
    polarity = sum(TextBlob(t).sentiment.polarity for t in tweets)
    return float(polarity / len(tweets))
