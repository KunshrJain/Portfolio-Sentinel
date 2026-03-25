import random
from textblob import TextBlob

def get_sentiment_score(symbol):
    mock_tweets = [
        f"{symbol} is showing great potential.",
        f"Bearish momentum for {symbol} right now.",
        f"Neutral stance on {symbol} overall.",
        f"Waiting for {symbol} earnings next week.",
        f"Buying the dip on {symbol}!"
    ]
    tweets = random.sample(mock_tweets, 3)
    polarity = sum(TextBlob(t).sentiment.polarity for t in tweets)
    return float(polarity / len(tweets))
