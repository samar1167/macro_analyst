import { create } from "zustand";

type ScenarioIndicatorInput = {
  signal?: number;
  value?: number;
  confidence?: number;
  change?: number;
  zscore?: number;
  notes?: string;
};

type ScenarioStore = {
  label: string;
  notes: string;
  persistOpportunities: boolean;
  indicatorValues: Record<string, ScenarioIndicatorInput>;
  setScenarioMeta: (payload: Partial<Pick<ScenarioStore, "label" | "notes" | "persistOpportunities">>) => void;
  setIndicatorValue: (code: string, payload: ScenarioIndicatorInput) => void;
  resetScenario: () => void;
};

const initialIndicatorValues: Record<string, ScenarioIndicatorInput> = {
  CORE_PCE_YOY: { signal: 0.7, value: 2.9, confidence: 0.95 },
  UNEMP_RATE: { signal: 0.3, value: 4.2, confidence: 0.9 },
  ISM_MFG_PMI: { signal: -0.5, value: 48.1, confidence: 0.9 },
  HY_OAS: { signal: 0.8, value: 425, confidence: 0.95 },
  DXY: { signal: 0.35, value: 105.1, confidence: 0.86 },
};

export const useScenarioStore = create<ScenarioStore>((set) => ({
  label: "Base Stress Case",
  notes: "Scenario editing workspace for macro simulation.",
  persistOpportunities: true,
  indicatorValues: initialIndicatorValues,
  setScenarioMeta: (payload) => set((state) => ({ ...state, ...payload })),
  setIndicatorValue: (code, payload) =>
    set((state) => ({
      indicatorValues: {
        ...state.indicatorValues,
        [code]: payload,
      },
    })),
  resetScenario: () =>
    set({
      label: "Base Stress Case",
      notes: "Scenario editing workspace for macro simulation.",
      persistOpportunities: true,
      indicatorValues: initialIndicatorValues,
    }),
}));

