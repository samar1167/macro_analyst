"""Scenario shock templates that map event narratives to indicator adjustments.

The engine remains indicator-first. These templates provide an upstream
translation layer so users can express a situation like a war, tariff shock,
or banking stress event and let the backend infer the corresponding indicator
moves before regime classification runs.
"""

SHOCK_HORIZON_MULTIPLIERS = {
    "immediate": {
        "CORE_PCE_YOY": 0.45,
        "UNEMP_RATE": 0.20,
        "ISM_MFG_PMI": 0.85,
        "HY_OAS": 1.00,
        "DXY": 1.00,
    },
    "3m": {
        "CORE_PCE_YOY": 0.85,
        "UNEMP_RATE": 0.65,
        "ISM_MFG_PMI": 1.00,
        "HY_OAS": 0.90,
        "DXY": 0.80,
    },
    "12m": {
        "CORE_PCE_YOY": 0.65,
        "UNEMP_RATE": 1.00,
        "ISM_MFG_PMI": 0.75,
        "HY_OAS": 0.70,
        "DXY": 0.55,
    },
}

SHOCK_SCENARIOS = {
    "new-war": {
        "label": "New War / Geopolitical Conflict",
        "description": "Models a new war shock through energy, trade, risk sentiment, and liquidity channels.",
        "channels": [
            "Commodity and energy price shock",
            "Risk-off sentiment and tighter financial conditions",
            "Supply-chain or shipping disruption",
            "Stronger dollar as a safe-haven impulse",
        ],
        "severity_impacts": {
            "mild": {
                "CORE_PCE_YOY": {"signal_delta": 0.20, "value_delta": 0.15},
                "UNEMP_RATE": {"signal_delta": 0.05, "value_delta": 0.05},
                "ISM_MFG_PMI": {"signal_delta": -0.20, "value_delta": -0.80},
                "HY_OAS": {"signal_delta": 0.25, "value_delta": 25.0},
                "DXY": {"signal_delta": 0.20, "value_delta": 1.20},
            },
            "base": {
                "CORE_PCE_YOY": {"signal_delta": 0.45, "value_delta": 0.35},
                "UNEMP_RATE": {"signal_delta": 0.15, "value_delta": 0.10},
                "ISM_MFG_PMI": {"signal_delta": -0.45, "value_delta": -2.00},
                "HY_OAS": {"signal_delta": 0.55, "value_delta": 60.0},
                "DXY": {"signal_delta": 0.40, "value_delta": 2.40},
            },
            "severe": {
                "CORE_PCE_YOY": {"signal_delta": 0.75, "value_delta": 0.60},
                "UNEMP_RATE": {"signal_delta": 0.35, "value_delta": 0.25},
                "ISM_MFG_PMI": {"signal_delta": -0.80, "value_delta": -4.00},
                "HY_OAS": {"signal_delta": 0.85, "value_delta": 120.0},
                "DXY": {"signal_delta": 0.65, "value_delta": 4.25},
            },
        },
    },
    "tariff-escalation": {
        "label": "Tariff Escalation",
        "description": "Models tariffs through import-price inflation, weaker trade activity, and modest stress tightening.",
        "channels": [
            "Import-price inflation and margin pressure",
            "Supply-chain disruption and weaker manufacturing confidence",
            "Mild risk-off tightening in credit and FX",
        ],
        "severity_impacts": {
            "mild": {
                "CORE_PCE_YOY": {"signal_delta": 0.15, "value_delta": 0.10},
                "UNEMP_RATE": {"signal_delta": 0.00, "value_delta": 0.00},
                "ISM_MFG_PMI": {"signal_delta": -0.15, "value_delta": -0.60},
                "HY_OAS": {"signal_delta": 0.10, "value_delta": 10.0},
                "DXY": {"signal_delta": 0.10, "value_delta": 0.80},
            },
            "base": {
                "CORE_PCE_YOY": {"signal_delta": 0.35, "value_delta": 0.25},
                "UNEMP_RATE": {"signal_delta": 0.10, "value_delta": 0.05},
                "ISM_MFG_PMI": {"signal_delta": -0.35, "value_delta": -1.50},
                "HY_OAS": {"signal_delta": 0.25, "value_delta": 30.0},
                "DXY": {"signal_delta": 0.20, "value_delta": 1.50},
            },
            "severe": {
                "CORE_PCE_YOY": {"signal_delta": 0.55, "value_delta": 0.45},
                "UNEMP_RATE": {"signal_delta": 0.25, "value_delta": 0.20},
                "ISM_MFG_PMI": {"signal_delta": -0.55, "value_delta": -3.00},
                "HY_OAS": {"signal_delta": 0.45, "value_delta": 55.0},
                "DXY": {"signal_delta": 0.35, "value_delta": 2.80},
            },
        },
    },
    "banking-stress": {
        "label": "Banking Stress Event",
        "description": "Models funding and credit disruption through spreads, growth stress, and defensive dollar strength.",
        "channels": [
            "Credit tightening and wider risk spreads",
            "Weaker business confidence and slower activity",
            "Risk-off bid into the dollar and defensives",
        ],
        "severity_impacts": {
            "mild": {
                "CORE_PCE_YOY": {"signal_delta": -0.05, "value_delta": -0.05},
                "UNEMP_RATE": {"signal_delta": 0.10, "value_delta": 0.05},
                "ISM_MFG_PMI": {"signal_delta": -0.20, "value_delta": -1.00},
                "HY_OAS": {"signal_delta": 0.35, "value_delta": 35.0},
                "DXY": {"signal_delta": 0.15, "value_delta": 1.00},
            },
            "base": {
                "CORE_PCE_YOY": {"signal_delta": -0.10, "value_delta": -0.10},
                "UNEMP_RATE": {"signal_delta": 0.25, "value_delta": 0.15},
                "ISM_MFG_PMI": {"signal_delta": -0.45, "value_delta": -2.40},
                "HY_OAS": {"signal_delta": 0.70, "value_delta": 90.0},
                "DXY": {"signal_delta": 0.30, "value_delta": 2.10},
            },
            "severe": {
                "CORE_PCE_YOY": {"signal_delta": -0.20, "value_delta": -0.20},
                "UNEMP_RATE": {"signal_delta": 0.45, "value_delta": 0.35},
                "ISM_MFG_PMI": {"signal_delta": -0.75, "value_delta": -4.50},
                "HY_OAS": {"signal_delta": 1.00, "value_delta": 160.0},
                "DXY": {"signal_delta": 0.45, "value_delta": 3.40},
            },
        },
    },
}
