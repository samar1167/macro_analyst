#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:8000/api/engine/runs/execute/}"
CURL_OPTS=()

if [[ "${1:-}" == "--proxy" ]]; then
  API_URL="http://localhost:3000/api/backend/engine/runs/execute/"
  shift
fi

if [[ $# -gt 0 ]]; then
  API_URL="$1"
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required but not installed." >&2
  exit 1
fi

run_scenario() {
  local name="$1"
  local payload="$2"
  local tmp_body
  local status

  tmp_body="$(mktemp)"
  status="$(
    curl -sS "${CURL_OPTS[@]}" \
      -o "$tmp_body" \
      -w "%{http_code}" \
      -H "Content-Type: application/json" \
      -X POST "$API_URL" \
      --data "$payload"
  )"

  echo
  echo "=== $name ==="

  if [[ "$status" != "200" ]]; then
    echo "HTTP $status"
    cat "$tmp_body"
    rm -f "$tmp_body"
    return 1
  fi

  jq -r '
    [
      "status: \(.status)",
      "selected_regime: \(.payload.summary.selected_regime // "n/a")",
      "selected_regime_name: \(.payload.regime_results.selected_regime.regime_name // "n/a")",
      "rule_count: \(.payload.summary.rule_count // 0)",
      "divergence_count: \(.payload.summary.divergence_count // 0)",
      "opportunity_count: \(.payload.summary.opportunity_count // 0)",
      "top_drivers: \((.payload.summary.top_drivers // []) | join(", "))"
    ] | .[]
  ' "$tmp_body"

  echo "top_rules:"
  jq -r '
    (.payload.applied_rules // [])[:3]
    | if length == 0 then
        ["  - none"]
      else
        map("  - \(.rule_code): \(.driver_code) <= \(.lead_indicator_code) (\(.contribution))")
      end
    | .[]
  ' "$tmp_body"

  rm -f "$tmp_body"
}

SCENARIOS=(
  "Base Stress Case|{\"triggered_by\":\"base-stress-case\",\"persist_opportunities\":false,\"indicator_values\":{\"CORE_PCE_YOY\":{\"signal\":0.7,\"value\":2.9,\"confidence\":0.95},\"UNEMP_RATE\":{\"signal\":0.3,\"value\":4.2,\"confidence\":0.9},\"ISM_MFG_PMI\":{\"signal\":-0.5,\"value\":48.1,\"confidence\":0.9},\"HY_OAS\":{\"signal\":0.8,\"value\":425,\"confidence\":0.95},\"DXY\":{\"signal\":0.35,\"value\":105.1,\"confidence\":0.86}}}"
  "Hard Landing|{\"triggered_by\":\"hard-landing\",\"persist_opportunities\":false,\"indicator_values\":{\"CORE_PCE_YOY\":{\"signal\":-0.4,\"value\":2.4,\"confidence\":0.95},\"UNEMP_RATE\":{\"signal\":0.8,\"value\":5.4,\"confidence\":0.9},\"ISM_MFG_PMI\":{\"signal\":-0.9,\"value\":45.0,\"confidence\":0.9},\"HY_OAS\":{\"signal\":1.0,\"value\":550,\"confidence\":0.95},\"DXY\":{\"signal\":0.7,\"value\":107.0,\"confidence\":0.86}}}"
  "Stagflation|{\"triggered_by\":\"stagflation\",\"persist_opportunities\":false,\"indicator_values\":{\"CORE_PCE_YOY\":{\"signal\":0.9,\"value\":3.6,\"confidence\":0.95},\"UNEMP_RATE\":{\"signal\":0.2,\"value\":4.5,\"confidence\":0.9},\"ISM_MFG_PMI\":{\"signal\":-0.7,\"value\":47.0,\"confidence\":0.9},\"HY_OAS\":{\"signal\":0.6,\"value\":470,\"confidence\":0.95},\"DXY\":{\"signal\":0.5,\"value\":106.2,\"confidence\":0.86}}}"
  "Goldilocks|{\"triggered_by\":\"goldilocks\",\"persist_opportunities\":false,\"indicator_values\":{\"CORE_PCE_YOY\":{\"signal\":-0.7,\"value\":2.2,\"confidence\":0.95},\"UNEMP_RATE\":{\"signal\":0.0,\"value\":4.1,\"confidence\":0.9},\"ISM_MFG_PMI\":{\"signal\":0.6,\"value\":52.5,\"confidence\":0.9},\"HY_OAS\":{\"signal\":-0.7,\"value\":330,\"confidence\":0.95},\"DXY\":{\"signal\":-0.2,\"value\":101.8,\"confidence\":0.86}}}"
  "Reflation|{\"triggered_by\":\"reflation\",\"persist_opportunities\":false,\"indicator_values\":{\"CORE_PCE_YOY\":{\"signal\":0.3,\"value\":2.8,\"confidence\":0.95},\"UNEMP_RATE\":{\"signal\":-0.2,\"value\":4.0,\"confidence\":0.9},\"ISM_MFG_PMI\":{\"signal\":0.9,\"value\":54.0,\"confidence\":0.9},\"HY_OAS\":{\"signal\":-0.5,\"value\":350,\"confidence\":0.95},\"DXY\":{\"signal\":-0.3,\"value\":101.5,\"confidence\":0.86}}}"
  "Disinflation Slowdown|{\"triggered_by\":\"disinflation-slowdown\",\"persist_opportunities\":false,\"indicator_values\":{\"CORE_PCE_YOY\":{\"signal\":-0.9,\"value\":2.0,\"confidence\":0.95},\"UNEMP_RATE\":{\"signal\":0.5,\"value\":4.8,\"confidence\":0.9},\"ISM_MFG_PMI\":{\"signal\":-0.6,\"value\":47.8,\"confidence\":0.9},\"HY_OAS\":{\"signal\":0.3,\"value\":430,\"confidence\":0.95},\"DXY\":{\"signal\":0.2,\"value\":104.0,\"confidence\":0.86}}}"
  "Overheating|{\"triggered_by\":\"overheating\",\"persist_opportunities\":false,\"indicator_values\":{\"CORE_PCE_YOY\":{\"signal\":0.8,\"value\":3.4,\"confidence\":0.95},\"UNEMP_RATE\":{\"signal\":-0.7,\"value\":3.6,\"confidence\":0.9},\"ISM_MFG_PMI\":{\"signal\":0.5,\"value\":53.0,\"confidence\":0.9},\"HY_OAS\":{\"signal\":-0.3,\"value\":340,\"confidence\":0.95},\"DXY\":{\"signal\":0.1,\"value\":103.5,\"confidence\":0.86}}}"
)

echo "Testing $((${#SCENARIOS[@]})) scenarios against: $API_URL"

for entry in "${SCENARIOS[@]}"; do
  name="${entry%%|*}"
  payload="${entry#*|}"
  run_scenario "$name" "$payload"
done
