"""Mapping from regime definitions to driver/difference signatures.

The seeded regimes are qualitative, so this layer translates them into
weighted scoring profiles that the engine can evaluate consistently.
"""

REGIME_DRIVER_PROFILES = {
    "REG_GOLDILOCKS": {
        "drivers": {
            "GROWTH_MOMENTUM": 1.00,
            "INFLATION_MOMENTUM": -0.75,
            "INFLATION_PERSISTENCE": -0.90,
            "CREDIT_STRESS": -0.80,
            "RISK_APPETITE": 0.80,
            "REAL_RATE_PRESSURE": -0.35,
        },
        "divergence_boosts": {
            "DIV_03": 0.15,
            "DIV_12": -0.30,
            "DIV_05": -0.25,
        },
    },
    "REG_REFLATION": {
        "drivers": {
            "GROWTH_MOMENTUM": 0.95,
            "COMMODITY_INFLATION_IMPULSE": 0.75,
            "RISK_APPETITE": 0.70,
            "POLICY_RESTRICTION": -0.20,
            "REAL_RATE_PRESSURE": -0.15,
        },
        "divergence_boosts": {
            "DIV_03": 0.10,
            "DIV_06": -0.15,
        },
    },
    "REG_STAGFLATION": {
        "drivers": {
            "INFLATION_PERSISTENCE": 1.00,
            "COMMODITY_INFLATION_IMPULSE": 0.90,
            "GROWTH_MOMENTUM": -0.70,
            "CREDIT_STRESS": 0.45,
            "USD_LIQUIDITY_TIGHTNESS": 0.40,
        },
        "divergence_boosts": {
            "DIV_06": 0.30,
            "DIV_10": 0.25,
            "DIV_12": 0.20,
        },
    },
    "REG_DISINFLATION_SLOWDOWN": {
        "drivers": {
            "INFLATION_MOMENTUM": -0.90,
            "GROWTH_MOMENTUM": -0.80,
            "RECESSION_PROBABILITY_PROXY": 0.65,
            "REAL_RATE_PRESSURE": 0.45,
            "CREDIT_STRESS": 0.35,
        },
        "divergence_boosts": {
            "DIV_11": 0.20,
            "DIV_09": 0.10,
        },
    },
    "REG_HARD_LANDING": {
        "drivers": {
            "RECESSION_PROBABILITY_PROXY": 1.00,
            "CREDIT_STRESS": 0.95,
            "USD_LIQUIDITY_TIGHTNESS": 0.70,
            "GROWTH_MOMENTUM": -0.90,
            "RISK_APPETITE": -0.75,
        },
        "divergence_boosts": {
            "DIV_04": 0.20,
            "DIV_05": 0.35,
            "DIV_12": 0.25,
        },
    },
    "REG_OVERHEATING": {
        "drivers": {
            "LABOR_MARKET_TIGHTNESS": 0.95,
            "INFLATION_PERSISTENCE": 0.90,
            "POLICY_RESTRICTION": 0.70,
            "GROWTH_MOMENTUM": 0.55,
            "RISK_APPETITE": 0.35,
        },
        "divergence_boosts": {
            "DIV_01": 0.20,
            "DIV_07": 0.15,
            "DIV_12": 0.10,
        },
    },
}

