export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Indicator {
  id: number;
  code: string;
  name: string;
  category: string;
  description: string;
  frequency: string;
  source: string;
  unit: string;
  rationale: string;
  confidence_score: string;
  weight: string;
  lag_months: number | null;
  lag_notes: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DerivedDriver {
  id: number;
  code: string;
  name: string;
  description: string;
  methodology: string;
  formula_expression: string;
  rationale: string;
  confidence_score: string;
  weight: string;
  lag_months: number | null;
  lag_notes: string;
  indicators: number[];
  is_active: boolean;
}

export interface CausalRule {
  id: number;
  code: string;
  name: string;
  description: string;
  lead_indicator: number;
  derived_driver: number | null;
  condition_expression: string;
  effect_expression: string;
  rationale: string;
  confidence_score: string;
  weight: string;
  lag_months: number | null;
  lag_notes: string;
  is_active: boolean;
}

export interface Regime {
  id: number;
  code: string;
  name: string;
  regime_type: string;
  description: string;
  rationale: string;
  confidence_score: string;
  weight: string;
  lag_months: number | null;
  lag_notes: string;
  primary_indicator: number | null;
  is_active: boolean;
}

export interface Opportunity {
  id: number;
  code: string;
  title: string;
  description: string;
  status: string;
  conviction_score: string;
  direction: string;
  regime: number | null;
  divergence_pattern: number | null;
  supporting_driver: number | null;
  detected_at: string | null;
  explanation_trace: Record<string, unknown>;
  score_components: Record<string, number>;
  engine_run_audit: number | null;
}

export interface DivergencePattern {
  id: number;
  code: string;
  name: string;
  description: string;
  indicator: number;
  detection_expression: string;
  severity_level: string;
  rationale: string;
  confidence_score: string;
  weight: string;
  lag_months: number | null;
  lag_notes: string;
  is_active: boolean;
}

export interface DivergenceEventExplanation {
  id: number;
  pattern: number;
  pattern_code: string;
  pattern_name: string;
  rank: number;
  match_score: string;
  explanation: string;
  payload: Record<string, unknown>;
}

export interface DivergenceEvent {
  id: number;
  code: string;
  title: string;
  summary: string;
  status: string;
  divergence_score: string;
  engine_run_audit: number | null;
  regime: number | null;
  primary_pattern: number | null;
  primary_pattern_code?: string;
  expected_outcomes: Record<string, unknown>;
  observed_outcomes: Record<string, unknown>;
  deviation_snapshot: Record<string, unknown>;
  explanation_trace: Record<string, unknown>;
  matched_explanations: DivergenceEventExplanation[];
  created_at: string;
}

export interface EngineRunAudit {
  id: number;
  run_type: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  triggered_by: string;
  regime: number | null;
  payload: Record<string, any>;
  notes: string;
  created_at: string;
}

export interface EngineExecutionInput {
  run_type?: string;
  triggered_by?: string;
  notes?: string;
  persist_opportunities?: boolean;
  event_scenario?: {
    scenario_key?: string;
    severity?: "mild" | "base" | "severe";
    horizon?: "immediate" | "3m" | "12m";
    confidence?: number;
  };
  indicator_values: Record<string, {
    signal?: number;
    value?: number;
    confidence?: number;
    change?: number;
    zscore?: number;
    notes?: string;
  }>;
}

export interface DivergenceAnalysisInput {
  engine_run_audit_id?: number;
  expected_outcomes?: Record<string, unknown>;
  observed_outcomes: Record<string, unknown>;
  persist?: boolean;
  notes?: string;
}
