import numpy as np
from sklearn.neural_network import MLPRegressor

def train_and_predict_alpha(historical_data, lookback=10):
    if len(historical_data) < lookback + 1:
        return 0.0
    X, y = [], []
    for i in range(len(historical_data) - lookback):
        X.append(historical_data[i:i+lookback])
        y.append(historical_data[i+lookback])
    model = MLPRegressor(hidden_layer_sizes=(16, 8), max_iter=200, random_state=42)
    model.fit(np.array(X), np.array(y))
    recent = np.array(historical_data[-lookback:]).reshape(1, -1)
    prediction = model.predict(recent)[0]
    return float((prediction - historical_data[-1]) / historical_data[-1])

def calculate_var_cvar(returns, conf_level=0.95):
    if len(returns) == 0:
        return 0.0, 0.0
    var = np.percentile(returns, (1 - conf_level) * 100)
    cvar = returns[returns <= var].mean()
    if np.isnan(cvar):
        cvar = var
    return float(var), float(cvar)
