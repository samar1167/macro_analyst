"""Country fallout overlays downstream of the U.S. regime engine.

These profiles extend the U.S.-centric regime output without replacing it.
The goal is to translate a detected U.S. regime into global transmission
channels and then into country-specific fallout for a downstream economy.
"""

US_REGIME_GLOBAL_CHANNELS = {
    "REG_GOLDILOCKS": {
        "USD_DIRECTION": -0.30,
        "OIL_PRESSURE": -0.25,
        "GLOBAL_GROWTH": 0.70,
        "CREDIT_STRESS": -0.60,
        "RISK_APPETITE": 0.80,
        "US_YIELDS": -0.10,
    },
    "REG_REFLATION": {
        "USD_DIRECTION": -0.20,
        "OIL_PRESSURE": 0.35,
        "GLOBAL_GROWTH": 0.85,
        "CREDIT_STRESS": -0.35,
        "RISK_APPETITE": 0.65,
        "US_YIELDS": 0.20,
    },
    "REG_STAGFLATION": {
        "USD_DIRECTION": 0.45,
        "OIL_PRESSURE": 0.80,
        "GLOBAL_GROWTH": -0.45,
        "CREDIT_STRESS": 0.45,
        "RISK_APPETITE": -0.50,
        "US_YIELDS": 0.30,
    },
    "REG_DISINFLATION_SLOWDOWN": {
        "USD_DIRECTION": 0.20,
        "OIL_PRESSURE": -0.20,
        "GLOBAL_GROWTH": -0.55,
        "CREDIT_STRESS": 0.35,
        "RISK_APPETITE": -0.30,
        "US_YIELDS": -0.25,
    },
    "REG_HARD_LANDING": {
        "USD_DIRECTION": 0.60,
        "OIL_PRESSURE": -0.30,
        "GLOBAL_GROWTH": -0.80,
        "CREDIT_STRESS": 0.90,
        "RISK_APPETITE": -0.80,
        "US_YIELDS": -0.40,
    },
    "REG_OVERHEATING": {
        "USD_DIRECTION": 0.35,
        "OIL_PRESSURE": 0.45,
        "GLOBAL_GROWTH": 0.50,
        "CREDIT_STRESS": 0.15,
        "RISK_APPETITE": 0.15,
        "US_YIELDS": 0.70,
    },
}

COUNTRY_FALLOUT_PROFILES = {
    "INDIA": {
        "label": "India",
        "sensitivities": {
            "USD_DIRECTION": {
                "USD_INR_PRESSURE": 0.95,
                "IMPORTED_INFLATION": 0.70,
                "FII_FLOW_PRESSURE": 0.80,
            },
            "OIL_PRESSURE": {
                "IMPORTED_INFLATION": 0.95,
                "RATE_PRESSURE": 0.55,
                "DOMESTIC_GROWTH_RESILIENCE": -0.45,
            },
            "GLOBAL_GROWTH": {
                "EXPORT_DEMAND": 0.80,
                "DOMESTIC_GROWTH_RESILIENCE": 0.40,
                "FII_FLOW_PRESSURE": 0.25,
            },
            "CREDIT_STRESS": {
                "FII_FLOW_PRESSURE": 0.70,
                "RATE_PRESSURE": 0.20,
                "DOMESTIC_GROWTH_RESILIENCE": -0.35,
            },
            "RISK_APPETITE": {
                "FII_FLOW_PRESSURE": -0.90,
                "DOMESTIC_GROWTH_RESILIENCE": 0.35,
            },
            "US_YIELDS": {
                "RATE_PRESSURE": 0.80,
                "FII_FLOW_PRESSURE": 0.55,
                "USD_INR_PRESSURE": 0.35,
            },
        },
        "impact_labels": {
            "IMPORTED_INFLATION": "Imported Inflation",
            "USD_INR_PRESSURE": "USD/INR Pressure",
            "FII_FLOW_PRESSURE": "FII Flow Pressure",
            "EXPORT_DEMAND": "Export Demand",
            "DOMESTIC_GROWTH_RESILIENCE": "Domestic Growth Resilience",
            "RATE_PRESSURE": "RBI Rate Pressure",
        },
        "sector_map": {
            "positive": {
                "IMPORTED_INFLATION": ["Upstream Energy", "Utilities with pass-through"],
                "USD_INR_PRESSURE": ["IT Services", "Pharma Exporters"],
                "FII_FLOW_PRESSURE": ["Large-cap Defensives", "Domestic Staples"],
                "EXPORT_DEMAND": ["IT Services", "Industrial Exporters"],
                "DOMESTIC_GROWTH_RESILIENCE": ["Private Banks", "Capital Goods", "Autos"],
                "RATE_PRESSURE": ["Large Private Banks", "Insurance"],
            },
            "negative": {
                "IMPORTED_INFLATION": ["Airlines", "Paints", "Consumer Discretionary"],
                "USD_INR_PRESSURE": ["Import-heavy Industrials", "Consumer Electronics"],
                "FII_FLOW_PRESSURE": ["Mid Caps", "High-beta Financials"],
                "EXPORT_DEMAND": ["IT Services", "Auto Ancillaries", "Metals"],
                "DOMESTIC_GROWTH_RESILIENCE": ["Consumer Discretionary", "Real Estate"],
                "RATE_PRESSURE": ["NBFCs", "Real Estate", "Consumer Durables"],
            },
        },
        "opportunity_templates": {
            "positive": [
                "Prefer large private banks and domestic cyclicals when India growth resilience improves.",
                "Rotate toward exporters when INR weakness supports offshore revenue translation.",
            ],
            "negative": [
                "Reduce exposure to import-heavy consumption when imported inflation and INR pressure rise.",
                "Favor large-cap defensives over flow-sensitive mid caps when global risk appetite deteriorates.",
            ],
        },
    }
}
