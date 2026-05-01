import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPct(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) return "--";
  return `${value.toFixed(2)}%`;
}

export function formatSigned(value?: number | null, digits = 2) {
  if (value === undefined || value === null || Number.isNaN(value)) return "--";
  return `${value > 0 ? "+" : ""}${value.toFixed(digits)}`;
}

export function formatDate(value?: string | null) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function scoreTone(value?: number | null) {
  if (value === undefined || value === null) return "text-muted-foreground";
  if (value > 0) return "text-positive";
  if (value < 0) return "text-negative";
  return "text-warning";
}

