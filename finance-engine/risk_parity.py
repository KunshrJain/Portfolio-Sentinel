import numpy as np
import pandas as pd

def compute_risk_parity_weights(cov_matrix):
    inv_volatility = 1.0 / np.sqrt(np.diag(cov_matrix))
    weights = inv_volatility / np.sum(inv_volatility)
    return weights

def get_allocation(df):
    returns = df.pct_change().dropna()
    cov_matrix = returns.cov().values
    weights = compute_risk_parity_weights(cov_matrix)
    return dict(zip(df.columns, weights))
