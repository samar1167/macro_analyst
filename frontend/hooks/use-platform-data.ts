"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { DivergenceAnalysisInput, EngineExecutionInput } from "@/types/api";

export function useIndicators() {
  return useQuery({ queryKey: ["indicators"], queryFn: api.listIndicators });
}

export function useDrivers() {
  return useQuery({ queryKey: ["drivers"], queryFn: api.listDrivers });
}

export function useRules() {
  return useQuery({ queryKey: ["rules"], queryFn: api.listRules });
}

export function useRegimes() {
  return useQuery({ queryKey: ["regimes"], queryFn: api.listRegimes });
}

export function useOpportunities() {
  return useQuery({ queryKey: ["opportunities"], queryFn: api.listOpportunities });
}

export function useOpportunity(id: string) {
  return useQuery({ queryKey: ["opportunities", id], queryFn: () => api.getOpportunity(id) });
}

export function useDivergenceEvents() {
  return useQuery({ queryKey: ["divergence-events"], queryFn: api.listDivergenceEvents });
}

export function useAuditRuns() {
  return useQuery({ queryKey: ["audit-runs"], queryFn: api.listAuditRuns });
}

export function useAuditRun(id: string) {
  return useQuery({ queryKey: ["audit-runs", id], queryFn: () => api.getAuditRun(id) });
}

export function useEngineExecution() {
  return useMutation({
    mutationFn: (payload: EngineExecutionInput) => api.executeEngine(payload),
  });
}

export function useDivergenceAnalysis() {
  return useMutation({
    mutationFn: (payload: DivergenceAnalysisInput) => api.analyzeDivergence(payload),
  });
}

