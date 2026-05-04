import { create } from "zustand";

type ScenarioIndicatorInput = {
  signal?: number;
  value?: number;
  confidence?: number;
  change?: number;
  zscore?: number;
  notes?: string;
};

export type ScenarioPreset = {
  key: string;
  label: string;
  notes: string;
  indicatorValues: Record<string, ScenarioIndicatorInput>;
};

export const eventScenarioPresets = [
  {
    key: "none",
    label: "No Shock Overlay",
    description: "Run the macro engine from your raw indicator inputs only.",
  },
  {
    key: "new-war",
    label: "New War / Geopolitical Conflict",
    description: "Energy, shipping, risk-off, and dollar-tightening shock.",
  },
  {
    key: "tariff-escalation",
    label: "Tariff Escalation",
    description: "Import-price inflation and trade-growth slowdown shock.",
  },
  {
    key: "banking-stress",
    label: "Banking Stress Event",
    description: "Credit tightening and confidence shock through spreads and funding stress.",
  },
  {
    key: "ceasefire-energy-relief",
    label: "Ceasefire / Energy Relief",
    description: "Lower energy risk premium, easier credit, firmer growth confidence, and a softer dollar.",
  },
  {
    key: "productivity-boom",
    label: "Productivity / AI Upside Shock",
    description: "Better growth, improving investment sentiment, and lower inflation persistence.",
  },
  {
    key: "policy-easing-tailwind",
    label: "Policy Easing / Liquidity Tailwind",
    description: "Easier financial conditions, narrower spreads, and improved growth expectations.",
  },
] as const;

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

export const scenarioPresets: ScenarioPreset[] = [
  {
    key: "base-stress-case",
    label: "Base Stress Case",
    notes: "Scenario editing workspace for macro simulation.",
    indicatorValues: initialIndicatorValues,
  },
  {
    key: "hard-landing",
    label: "Hard Landing",
    notes: "Rising unemployment, deep manufacturing weakness, and acute credit stress.",
    indicatorValues: {
      CORE_PCE_YOY: { signal: -0.4, value: 2.4, confidence: 0.95 },
      UNEMP_RATE: { signal: 0.8, value: 5.4, confidence: 0.9 },
      ISM_MFG_PMI: { signal: -0.9, value: 45.0, confidence: 0.9 },
      HY_OAS: { signal: 1.0, value: 550, confidence: 0.95 },
      DXY: { signal: 0.7, value: 107.0, confidence: 0.86 },
    },
  },
  {
    key: "stagflation",
    label: "Stagflation",
    notes: "Sticky inflation, softer growth, and tighter external conditions.",
    indicatorValues: {
      CORE_PCE_YOY: { signal: 0.9, value: 3.6, confidence: 0.95 },
      UNEMP_RATE: { signal: 0.2, value: 4.5, confidence: 0.9 },
      ISM_MFG_PMI: { signal: -0.7, value: 47.0, confidence: 0.9 },
      HY_OAS: { signal: 0.6, value: 470, confidence: 0.95 },
      DXY: { signal: 0.5, value: 106.2, confidence: 0.86 },
    },
  },
  {
    key: "goldilocks",
    label: "Goldilocks",
    notes: "Cooling inflation, stable labor, stronger manufacturing, and easy credit.",
    indicatorValues: {
      CORE_PCE_YOY: { signal: -0.7, value: 2.2, confidence: 0.95 },
      UNEMP_RATE: { signal: 0.0, value: 4.1, confidence: 0.9 },
      ISM_MFG_PMI: { signal: 0.6, value: 52.5, confidence: 0.9 },
      HY_OAS: { signal: -0.7, value: 330, confidence: 0.95 },
      DXY: { signal: -0.2, value: 101.8, confidence: 0.86 },
    },
  },
  {
    key: "reflation",
    label: "Reflation",
    notes: "Re-accelerating growth with manageable inflation and healthier risk appetite.",
    indicatorValues: {
      CORE_PCE_YOY: { signal: 0.3, value: 2.8, confidence: 0.95 },
      UNEMP_RATE: { signal: -0.2, value: 4.0, confidence: 0.9 },
      ISM_MFG_PMI: { signal: 0.9, value: 54.0, confidence: 0.9 },
      HY_OAS: { signal: -0.5, value: 350, confidence: 0.95 },
      DXY: { signal: -0.3, value: 101.5, confidence: 0.86 },
    },
  },
  {
    key: "disinflation-slowdown",
    label: "Disinflation Slowdown",
    notes: "Cooling inflation meets a softer growth backdrop and moderate stress.",
    indicatorValues: {
      CORE_PCE_YOY: { signal: -0.9, value: 2.0, confidence: 0.95 },
      UNEMP_RATE: { signal: 0.5, value: 4.8, confidence: 0.9 },
      ISM_MFG_PMI: { signal: -0.6, value: 47.8, confidence: 0.9 },
      HY_OAS: { signal: 0.3, value: 430, confidence: 0.95 },
      DXY: { signal: 0.2, value: 104.0, confidence: 0.86 },
    },
  },
  {
    key: "overheating",
    label: "Overheating",
    notes: "Hot inflation, very tight labor, and above-trend growth with policy pressure.",
    indicatorValues: {
      CORE_PCE_YOY: { signal: 0.8, value: 3.4, confidence: 0.95 },
      UNEMP_RATE: { signal: -0.7, value: 3.6, confidence: 0.9 },
      ISM_MFG_PMI: { signal: 0.5, value: 53.0, confidence: 0.9 },
      HY_OAS: { signal: -0.3, value: 340, confidence: 0.95 },
      DXY: { signal: 0.1, value: 103.5, confidence: 0.86 },
    },
  },
];

export const useScenarioStore = create<ScenarioStore>((set) => ({
  label: "Base Stress Case",
  notes: "Scenario editing workspace for macro simulation.",
  persistOpportunities: false,
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
      persistOpportunities: false,
      indicatorValues: initialIndicatorValues,
    }),
}));
