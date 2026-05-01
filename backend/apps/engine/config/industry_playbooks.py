"""Industry mapping templates keyed by regime and reinforced by driver.

These mappings are intentionally qualitative. The engine uses them to
translate a selected macro regime and its strongest supporting drivers into a
human-readable industry impact layer for scenario analysis.
"""

INDUSTRY_PLAYBOOKS = {
    "REG_GOLDILOCKS": {
        "outperformers": [
            "Semiconductors",
            "Software",
            "Consumer Discretionary",
            "Industrials",
            "Financials",
        ],
        "underperformers": [
            "Utilities",
            "Consumer Staples",
            "Long-duration Defensives",
        ],
        "channels": [
            "Improving growth and easing inflation favor cyclical demand.",
            "Contained credit stress supports risk appetite and valuation expansion.",
        ],
        "driver_overrides": {
            "GROWTH_MOMENTUM": {
                "outperformers": ["Industrials", "Transport", "Consumer Discretionary"],
                "channels": ["Firmer activity broadens earnings sensitivity beyond defensives."],
            },
            "RISK_APPETITE": {
                "outperformers": ["High-beta Technology", "Small Caps", "Consumer Internet"],
                "channels": ["Willingness to take risk lifts higher-beta industry groups."],
            },
            "CREDIT_STRESS": {
                "outperformers": ["Large-cap Quality", "Defensive Software"],
                "underperformers": ["Lower-quality Credit", "Regional Banks"],
                "channels": ["Any residual spread pressure caps weaker balance-sheet beneficiaries."],
            },
        },
    },
    "REG_REFLATION": {
        "outperformers": [
            "Industrials",
            "Materials",
            "Energy",
            "Financials",
            "Small Caps",
        ],
        "underperformers": [
            "Bond Proxies",
            "Utilities",
            "Rate-sensitive Growth",
        ],
        "channels": [
            "Growth re-acceleration lifts cyclical earnings and operating leverage.",
            "Commodity-linked groups benefit from stronger nominal activity.",
        ],
        "driver_overrides": {
            "COMMODITY_INFLATION_IMPULSE": {
                "outperformers": ["Energy", "Metals & Mining", "Chemicals"],
                "channels": ["Commodity impulse improves pricing power in resource-heavy industries."],
            },
            "GROWTH_MOMENTUM": {
                "outperformers": ["Machinery", "Transportation", "Capital Goods"],
                "channels": ["Capex-sensitive groups tend to respond first to reflation."],
            },
            "RISK_APPETITE": {
                "outperformers": ["Small Caps", "Autos", "Leisure"],
                "channels": ["Broadening confidence supports more cyclically exposed equity groups."],
            },
        },
    },
    "REG_STAGFLATION": {
        "outperformers": [
            "Energy",
            "Materials",
            "Utilities",
            "Consumer Staples",
            "Defense-oriented Healthcare",
        ],
        "underperformers": [
            "Consumer Discretionary",
            "Industrials",
            "Long-duration Growth",
            "Rate-sensitive Real Estate",
        ],
        "channels": [
            "Sticky inflation and weaker growth squeeze margins for low pricing-power businesses.",
            "Commodity and defensive groups hold up better under cost pressure and slower demand.",
        ],
        "driver_overrides": {
            "INFLATION_PERSISTENCE": {
                "outperformers": ["Staples with Pricing Power", "Energy Services"],
                "channels": ["Persistent inflation rewards businesses able to pass through costs."],
            },
            "COMMODITY_INFLATION_IMPULSE": {
                "outperformers": ["Oil & Gas", "Metals & Mining", "Fertilizers"],
                "channels": ["Higher commodity intensity creates relative winners among producers."],
            },
            "USD_LIQUIDITY_TIGHTNESS": {
                "outperformers": ["Domestic Defensives", "Large-cap Healthcare"],
                "underperformers": ["Emerging-market Cyclicals", "Global Industrials"],
                "channels": ["Dollar strength and tighter liquidity pressure globally exposed cyclicals."],
            },
        },
    },
    "REG_DISINFLATION_SLOWDOWN": {
        "outperformers": [
            "Quality Technology",
            "Healthcare",
            "Utilities",
            "Consumer Staples",
            "Large-cap Defensives",
        ],
        "underperformers": [
            "Small Caps",
            "Deep Cyclicals",
            "Lower-quality Financials",
        ],
        "channels": [
            "Cooling inflation helps duration, but slowing growth reduces appetite for lower-quality cyclicals.",
            "Defensive earnings and balance-sheet quality become more valuable.",
        ],
        "driver_overrides": {
            "RECESSION_PROBABILITY_PROXY": {
                "outperformers": ["Managed Care", "Staples", "Discount Retail"],
                "underperformers": ["Autos", "Housing-linked Industrials", "Travel"],
                "channels": ["Rising recession odds pressure demand-sensitive industries first."],
            },
            "REAL_RATE_PRESSURE": {
                "outperformers": ["Mega-cap Growth", "Software"],
                "channels": ["If inflation fades faster than nominal yields, duration can stabilize."],
            },
            "CREDIT_STRESS": {
                "outperformers": ["Large-cap Pharma", "Utilities"],
                "underperformers": ["Regional Banks", "Lower-quality Credit", "Homebuilders"],
                "channels": ["Spreads widening into softer growth hurts credit-sensitive groups."],
            },
        },
    },
    "REG_HARD_LANDING": {
        "outperformers": [
            "Utilities",
            "Consumer Staples",
            "Healthcare",
            "High-quality Software",
            "Treasury-sensitive Defensives",
        ],
        "underperformers": [
            "Banks",
            "Consumer Discretionary",
            "Industrials",
            "Transports",
            "Real Estate",
            "Small Caps",
        ],
        "channels": [
            "Credit stress and recession risk weigh on cyclical demand and balance-sheet sensitivity.",
            "Defensive sectors and high-quality balance sheets tend to outperform.",
        ],
        "driver_overrides": {
            "RECESSION_PROBABILITY_PROXY": {
                "outperformers": ["Managed Care", "Discount Retail", "Staples"],
                "underperformers": ["Retail", "Autos", "Hotels & Leisure"],
                "channels": ["Demand destruction hits discretionary end-markets quickly."],
            },
            "CREDIT_STRESS": {
                "outperformers": ["Utilities", "Large-cap Pharma", "Cash-generative Software"],
                "underperformers": ["Regional Banks", "Homebuilders", "Lower-quality Industrials"],
                "channels": ["Wider spreads increase refinancing risk and restrict credit formation."],
            },
            "USD_LIQUIDITY_TIGHTNESS": {
                "outperformers": ["Domestic Utilities", "Staples", "U.S.-centric Healthcare"],
                "underperformers": ["Multinationals", "Emerging-market Exposures"],
                "channels": ["A stronger dollar tightens financial conditions and pressures external demand."],
            },
        },
    },
    "REG_OVERHEATING": {
        "outperformers": [
            "Energy",
            "Materials",
            "Banks",
            "Value Cyclicals",
        ],
        "underperformers": [
            "Long-duration Technology",
            "Utilities",
            "Rate-sensitive Real Estate",
            "Highly Levered Growth",
        ],
        "channels": [
            "Tight labor and sticky inflation raise the risk of further policy tightening.",
            "Inflation beneficiaries can work early, but valuation-sensitive duration trades suffer.",
        ],
        "driver_overrides": {
            "LABOR_MARKET_TIGHTNESS": {
                "outperformers": ["Staffing-light Software", "Asset-light Platforms"],
                "underperformers": ["Labor-intensive Consumer Services", "Restaurants"],
                "channels": ["Wage pressure compresses margins where labor intensity is high."],
            },
            "INFLATION_PERSISTENCE": {
                "outperformers": ["Energy", "Commodity-linked Industrials"],
                "channels": ["Persistent inflation supports nominal revenue for real-asset-heavy industries."],
            },
            "POLICY_RESTRICTION": {
                "outperformers": ["Banks", "Short-duration Value"],
                "underperformers": ["Homebuilders", "REITs", "Long-duration Software"],
                "channels": ["Tighter policy disproportionately hurts rate-sensitive industry groups."],
            },
        },
    },
}
