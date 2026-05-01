"""Opinionated opportunity templates for the macro inference engine.

These are separated from runtime code so strategy framing can evolve without
rewriting the engine itself.
"""

OPPORTUNITY_PLAYBOOKS = {
    "REG_GOLDILOCKS": {
        "title": "Pro-cyclical risk-on rotation",
        "direction": "bullish",
        "drivers": ["GROWTH_MOMENTUM", "RISK_APPETITE", "CREDIT_STRESS"],
    },
    "REG_REFLATION": {
        "title": "Reflation and cyclicals rotation",
        "direction": "bullish",
        "drivers": ["GROWTH_MOMENTUM", "COMMODITY_INFLATION_IMPULSE", "RISK_APPETITE"],
    },
    "REG_STAGFLATION": {
        "title": "Inflation hedge and defensives",
        "direction": "defensive",
        "drivers": ["INFLATION_PERSISTENCE", "COMMODITY_INFLATION_IMPULSE", "USD_LIQUIDITY_TIGHTNESS"],
    },
    "REG_DISINFLATION_SLOWDOWN": {
        "title": "Quality and duration defense",
        "direction": "defensive",
        "drivers": ["RECESSION_PROBABILITY_PROXY", "REAL_RATE_PRESSURE", "CREDIT_STRESS"],
    },
    "REG_HARD_LANDING": {
        "title": "Hard-landing defense",
        "direction": "defensive",
        "drivers": ["RECESSION_PROBABILITY_PROXY", "CREDIT_STRESS", "USD_LIQUIDITY_TIGHTNESS"],
    },
    "REG_OVERHEATING": {
        "title": "Late-cycle inflation protection",
        "direction": "inflation_hedge",
        "drivers": ["LABOR_MARKET_TIGHTNESS", "INFLATION_PERSISTENCE", "POLICY_RESTRICTION"],
    },
}

