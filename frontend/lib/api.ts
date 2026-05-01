import {
  mockAuditRuns,
  mockDivergenceEvents,
  mockDrivers,
  mockIndicators,
  mockOpportunities,
  mockPatterns,
  mockRegimes,
  mockRules,
  paginate,
} from "@/lib/mock-data";
import type {
  CausalRule,
  DerivedDriver,
  DivergenceAnalysisInput,
  DivergenceEvent,
  DivergencePattern,
  EngineExecutionInput,
  EngineRunAudit,
  Indicator,
  Opportunity,
  PaginatedResponse,
  Regime,
} from "@/types/api";

const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
const baseProxy = process.env.NEXT_PUBLIC_BACKEND_API_PROXY || "/api/backend";
const backendOrigin = process.env.BACKEND_API_ORIGIN || "http://backend:8000";

async function request<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  if (useMocks && fallback !== undefined) return fallback;

  const target = typeof window === "undefined" ? `${backendOrigin}/api${path}` : `${baseProxy}${path}`;

  try {
    const response = await fetch(target, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

export const api = {
  listIndicators: () => request<PaginatedResponse<Indicator>>("/indicators/", undefined, paginate(mockIndicators)),
  listDrivers: () => request<PaginatedResponse<DerivedDriver>>("/drivers/", undefined, paginate(mockDrivers)),
  listRules: () => request<PaginatedResponse<CausalRule>>("/causal-rules/", undefined, paginate(mockRules)),
  listRegimes: () => request<PaginatedResponse<Regime>>("/regimes/", undefined, paginate(mockRegimes)),
  listOpportunities: () => request<PaginatedResponse<Opportunity>>("/opportunities/", undefined, paginate(mockOpportunities)),
  getOpportunity: (id: string) => request<Opportunity>(`/opportunities/${id}/`, undefined, mockOpportunities[0]),
  listPatterns: () => request<PaginatedResponse<DivergencePattern>>("/divergence/", undefined, paginate(mockPatterns)),
  listDivergenceEvents: () => request<PaginatedResponse<DivergenceEvent>>("/divergence/events/", undefined, paginate(mockDivergenceEvents)),
  getDivergenceEvent: (id: string) => request<DivergenceEvent>(`/divergence/events/${id}/`, undefined, mockDivergenceEvents[0]),
  listAuditRuns: () => request<PaginatedResponse<EngineRunAudit>>("/engine/runs/", undefined, paginate(mockAuditRuns)),
  getAuditRun: (id: string) => request<EngineRunAudit>(`/engine/runs/${id}/`, undefined, mockAuditRuns[0]),
  executeEngine: (payload: EngineExecutionInput) =>
    request<EngineRunAudit>("/engine/runs/execute/", {
      method: "POST",
      body: JSON.stringify(payload),
    }, mockAuditRuns[0]),
  analyzeDivergence: (payload: DivergenceAnalysisInput) =>
    request<{ analysis: Record<string, unknown>; event?: DivergenceEvent }>("/divergence/events/analyze/", {
      method: "POST",
      body: JSON.stringify(payload),
    }, {
      analysis: {
        candidate_explanations: mockDivergenceEvents[0].matched_explanations,
      },
      event: mockDivergenceEvents[0],
    }),
};
