import type {
  CausalRule,
  DerivedDriver,
  DivergenceEvent,
  DivergencePattern,
  EngineRunAudit,
  Indicator,
  Opportunity,
  PaginatedResponse,
  Regime,
} from "@/types/api";

export const mockIndicators: Indicator[] = [
  {
    id: 1,
    code: "CORE_PCE_YOY",
    name: "Core PCE YoY",
    category: "inflation",
    description: "Federal Reserve preferred inflation gauge.",
    frequency: "monthly",
    source: "BEA",
    unit: "percent",
    rationale: "Primary policy inflation anchor.",
    confidence_score: "0.96",
    weight: "1.00",
    lag_months: 1,
    lag_notes: "Monthly reporting cadence.",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: 2,
    code: "HY_OAS",
    name: "High Yield OAS",
    category: "credit",
    description: "High-yield spread proxy.",
    frequency: "daily",
    source: "Market data",
    unit: "bps",
    rationale: "Credit stress thermometer.",
    confidence_score: "0.90",
    weight: "0.92",
    lag_months: 0,
    lag_notes: "Real-time.",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: 3,
    code: "ISM_MFG_PMI",
    name: "ISM Manufacturing PMI",
    category: "growth",
    description: "Survey-based activity gauge.",
    frequency: "monthly",
    source: "ISM",
    unit: "index",
    rationale: "Early cycle inflection signal.",
    confidence_score: "0.87",
    weight: "0.84",
    lag_months: 0,
    lag_notes: "Survey-based lead signal.",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

export const mockDrivers: DerivedDriver[] = [
  {
    id: 1,
    code: "GROWTH_MOMENTUM",
    name: "Growth Momentum",
    description: "Composite of PMIs and payrolls.",
    methodology: "Blend of surveys and labor.",
    formula_expression: "blend(ISM_MFG_PMI, ISM_SERVICES_PMI, NFP_3M_AVG)",
    rationale: "Captures broad activity pulse.",
    confidence_score: "0.89",
    weight: "0.93",
    lag_months: 0,
    lag_notes: "Near-contemporaneous.",
    indicators: [3],
    is_active: true,
  },
  {
    id: 2,
    code: "CREDIT_STRESS",
    name: "Credit Stress",
    description: "Spread widening stress measure.",
    methodology: "Blend IG and HY spreads.",
    formula_expression: "weighted_spread(IG_OAS, HY_OAS)",
    rationale: "Financial conditions gauge.",
    confidence_score: "0.93",
    weight: "0.98",
    lag_months: 1,
    lag_notes: "Leads funding deterioration.",
    indicators: [2],
    is_active: true,
  },
];

export const mockRules: CausalRule[] = [
  {
    id: 1,
    code: "RULE_CRD_01",
    name: "High-yield spread widening raises credit stress",
    description: "Direct stress rule.",
    lead_indicator: 2,
    derived_driver: 2,
    condition_expression: "HY_OAS widens materially",
    effect_expression: "Increase CREDIT_STRESS",
    rationale: "Spread widening signals stress.",
    confidence_score: "0.97",
    weight: "1.00",
    lag_months: 0,
    lag_notes: "Immediate.",
    is_active: true,
  },
];

export const mockRegimes: Regime[] = [
  {
    id: 1,
    code: "REG_STAGFLATION",
    name: "Stagflation",
    regime_type: "inflationary_slowdown",
    description: "Sticky inflation with weak growth.",
    rationale: "Supply shock meets demand slowdown.",
    confidence_score: "0.90",
    weight: "0.98",
    lag_months: 1,
    lag_notes: "Confirmed through multi-indicator alignment.",
    primary_indicator: 1,
    is_active: true,
  },
  {
    id: 2,
    code: "REG_GOLDILOCKS",
    name: "Goldilocks Expansion",
    regime_type: "benign_growth",
    description: "Cooling inflation with resilient growth.",
    rationale: "Soft-landing regime.",
    confidence_score: "0.84",
    weight: "0.88",
    lag_months: 1,
    lag_notes: "Requires repeat confirmation.",
    primary_indicator: 1,
    is_active: true,
  },
];

export const mockOpportunities: Opportunity[] = [
  {
    id: 1,
    code: "REG_STAGFLATION_CREDIT_STRESS_DIV_12",
    title: "Inflation hedge and defensives: Credit Stress",
    description: "Defensive rotation supported by persistent inflation and wider spreads.",
    status: "active",
    conviction_score: "78.00",
    direction: "defensive",
    regime: 1,
    divergence_pattern: 1,
    supporting_driver: 2,
    detected_at: new Date().toISOString(),
    explanation_trace: {
      regime: { regime_name: "Stagflation", score: 1.2 },
      driver: { driver_name: "Credit Stress", net_score: 0.88 },
    },
    score_components: {
      regime_component: 46,
      driver_component: 26,
      divergence_component: 6,
    },
    engine_run_audit: 1,
  },
];

export const mockPatterns: DivergencePattern[] = [
  {
    id: 1,
    code: "DIV_12",
    name: "Core Inflation High, Credit Tight",
    description: "Sticky inflation colliding with tighter financing.",
    indicator: 1,
    detection_expression: "CORE_PCE_YOY elevated while HY_OAS widens",
    severity_level: "high",
    rationale: "Late-cycle danger signal.",
    confidence_score: "0.90",
    weight: "0.95",
    lag_months: 1,
    lag_notes: "Escalates hard-landing odds.",
    is_active: true,
  },
];

export const mockDivergenceEvents: DivergenceEvent[] = [
  {
    id: 1,
    code: "DIV_EVT_1_REG_STAGFLATION",
    title: "Macro divergence event",
    summary: "Credit has deteriorated faster than the benign prior path implied.",
    status: "detected",
    divergence_score: "73.00",
    engine_run_audit: 1,
    regime: 1,
    primary_pattern: 1,
    primary_pattern_code: "DIV_12",
    expected_outcomes: {},
    observed_outcomes: {},
    deviation_snapshot: {
      net_divergence_score: 0.73,
      deviations: [
        {
          type: "driver_mismatch",
          message: "Driver CREDIT_STRESS expected 0.25 but observed 0.81.",
        },
      ],
    },
    explanation_trace: {},
    matched_explanations: [
      {
        id: 1,
        pattern: 1,
        pattern_code: "DIV_12",
        pattern_name: "Core Inflation High, Credit Tight",
        rank: 1,
        match_score: "87.00",
        explanation: "Inflation remains sticky while spreads widen.",
        payload: {},
      },
    ],
    created_at: new Date().toISOString(),
  },
];

export const mockAuditRuns: EngineRunAudit[] = [
  {
    id: 1,
    run_type: "macro_inference",
    status: "success",
    started_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    triggered_by: "manual-test",
    regime: 1,
    notes: "Selected regime: Stagflation",
    created_at: new Date().toISOString(),
    payload: {
      summary: {
        selected_regime: "REG_STAGFLATION",
        opportunity_count: 1,
      },
      derived_driver_scores: {
        CREDIT_STRESS: {
          driver_name: "Credit Stress",
          net_score: 0.88,
          explanation_trace: [
            { stage: "derived_driver_base", message: "Credit Stress base score 0.54 derived from spread inputs." },
            { stage: "causal_rule", message: "HY spread widening added 0.34 through RULE_CRD_01." },
          ],
        },
      },
      applied_rules: [
        {
          rule_code: "RULE_CRD_01",
          contribution: 0.34,
        },
      ],
      regime_results: {
        selected_regime: {
          regime_id: 1,
          regime_code: "REG_STAGFLATION",
          regime_name: "Stagflation",
          score: 1.21,
          explanation_trace: [
            { stage: "regime_classification", message: "Stagflation scored 1.21 from weighted driver fit." },
          ],
        },
      },
      opportunities: mockOpportunities,
    },
  },
];

export function paginate<T>(items: T[]): PaginatedResponse<T> {
  return {
    count: items.length,
    next: null,
    previous: null,
    results: items,
  };
}

