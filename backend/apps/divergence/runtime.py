from __future__ import annotations

from typing import Any

from django.db import transaction

from apps.divergence.models import DivergenceEvent, DivergenceEventExplanation, DivergencePattern
from apps.engine.models import EngineRunAudit
from apps.engine.runtime import ExpressionHeuristics, IndicatorSignalNormalizer, clamp, decimal_to_float
from apps.regimes.models import Regime


class ExpectedOutcomeBuilder:
    @staticmethod
    def from_audit(audit: EngineRunAudit) -> dict[str, Any]:
        payload = audit.payload or {}
        regime_results = payload.get("regime_results", {})
        selected_regime = regime_results.get("selected_regime")

        driver_scores = payload.get("derived_driver_scores", {})
        normalized_drivers = {
            code: {
                "driver_code": code,
                "net_score": values.get("net_score", 0.0),
                "direction": "positive" if values.get("net_score", 0.0) >= 0 else "negative",
                "driver_name": values.get("driver_name", code),
            }
            for code, values in driver_scores.items()
        }

        opportunities = payload.get("opportunities", [])
        normalized_opportunities = {
            opportunity["code"]: {
                "code": opportunity["code"],
                "direction": opportunity.get("direction", ""),
                "conviction_score": opportunity.get("conviction_score", 0.0),
                "title": opportunity.get("title", ""),
            }
            for opportunity in opportunities
            if opportunity.get("code")
        }

        return {
            "audit_id": audit.id,
            "selected_regime": selected_regime,
            "driver_scores": normalized_drivers,
            "opportunities": normalized_opportunities,
            "input_snapshot": payload.get("input_snapshot", {}),
            "summary": payload.get("summary", {}),
        }


class OutcomeDeviationDetector:
    DRIVER_THRESHOLD = 0.45
    REGIME_THRESHOLD = 0.35
    OPPORTUNITY_THRESHOLD = 0.40
    INDICATOR_THRESHOLD = 0.50

    def detect(self, expected: dict[str, Any], observed: dict[str, Any]) -> dict[str, Any]:
        deviations = []

        expected_regime = expected.get("selected_regime") or {}
        observed_regime = observed.get("observed_regime") or {}
        if expected_regime and observed_regime:
            regime_mismatch = expected_regime.get("regime_code") != observed_regime.get("code")
            regime_score = float(observed_regime.get("score", 0.0) or 0.0)
            if regime_mismatch or abs(regime_score - float(expected_regime.get("score", 0.0) or 0.0)) >= self.REGIME_THRESHOLD:
                deviations.append(
                    {
                        "type": "regime_mismatch",
                        "severity": 0.95 if regime_mismatch else 0.65,
                        "expected": expected_regime,
                        "observed": observed_regime,
                        "keys": [expected_regime.get("regime_code"), observed_regime.get("code")],
                        "message": (
                            f"Expected regime {expected_regime.get('regime_name')} "
                            f"but observed regime {observed_regime.get('code')}."
                        ),
                    }
                )

        expected_drivers = expected.get("driver_scores", {})
        observed_drivers = observed.get("observed_driver_scores", {})
        for driver_code, expected_driver in expected_drivers.items():
            observed_driver = observed_drivers.get(driver_code)
            if not observed_driver:
                continue
            expected_score = float(expected_driver.get("net_score", 0.0) or 0.0)
            observed_signal = self._extract_signal(observed_driver)
            delta = observed_signal - expected_score
            if abs(delta) < self.DRIVER_THRESHOLD:
                continue
            deviations.append(
                {
                    "type": "driver_mismatch",
                    "severity": min(1.0, abs(delta)),
                    "expected": expected_driver,
                    "observed": {**observed_driver, "signal": observed_signal},
                    "keys": [driver_code],
                    "message": (
                        f"Driver {driver_code} expected {expected_score:.2f} "
                        f"but observed {observed_signal:.2f}."
                    ),
                }
            )

        expected_opportunities = expected.get("opportunities", {})
        observed_opportunities = observed.get("observed_opportunity_outcomes", {})
        for opportunity_code, expected_opportunity in expected_opportunities.items():
            observed_opportunity = observed_opportunities.get(opportunity_code)
            if not observed_opportunity:
                continue
            realized_signal = self._extract_signal(observed_opportunity)
            direction = expected_opportunity.get("direction", "")
            expected_sign = 1.0 if direction in ("bullish", "inflation_hedge") else -1.0 if direction == "defensive" else 0.0
            disagreement = realized_signal * expected_sign
            if expected_sign == 0.0 or disagreement > -self.OPPORTUNITY_THRESHOLD:
                continue
            deviations.append(
                {
                    "type": "opportunity_underperformance",
                    "severity": min(1.0, abs(disagreement)),
                    "expected": expected_opportunity,
                    "observed": {**observed_opportunity, "signal": realized_signal},
                    "keys": [opportunity_code],
                    "message": (
                        f"Opportunity {opportunity_code} moved against expected {direction} "
                        f"bias with realized signal {realized_signal:.2f}."
                    ),
                }
            )

        expected_indicators = expected.get("input_snapshot", {})
        observed_indicators = observed.get("observed_indicator_values", {})
        for indicator_code, observed_indicator in observed_indicators.items():
            expected_indicator = expected_indicators.get(indicator_code)
            if not expected_indicator:
                continue
            expected_signal = float(expected_indicator.get("signal", 0.0) or 0.0)
            observed_signal = self._extract_signal(observed_indicator)
            delta = observed_signal - expected_signal
            if abs(delta) < self.INDICATOR_THRESHOLD:
                continue
            deviations.append(
                {
                    "type": "indicator_reversal",
                    "severity": min(1.0, abs(delta)),
                    "expected": expected_indicator,
                    "observed": {**observed_indicator, "signal": observed_signal},
                    "keys": [indicator_code],
                    "message": (
                        f"Indicator {indicator_code} expected signal {expected_signal:.2f} "
                        f"but observed {observed_signal:.2f}."
                    ),
                }
            )

        ranked = sorted(deviations, key=lambda item: item["severity"], reverse=True)
        net_score = sum(item["severity"] for item in ranked) / len(ranked) if ranked else 0.0
        return {
            "deviations": ranked,
            "net_divergence_score": round(clamp(net_score, 0.0, 1.0), 4),
        }

    @staticmethod
    def _extract_signal(payload: dict[str, Any]) -> float:
        normalized = IndicatorSignalNormalizer.normalize({"payload": payload})
        return normalized["payload"].signal


class DivergencePatternMatcher:
    SEVERITY_MULTIPLIER = {
        DivergencePattern.Severity.LOW: 0.75,
        DivergencePattern.Severity.MEDIUM: 1.0,
        DivergencePattern.Severity.HIGH: 1.25,
    }

    def rank_candidates(
        self,
        *,
        patterns: list[DivergencePattern],
        deviation_results: dict[str, Any],
        observed_outcomes: dict[str, Any],
        expected_outcomes: dict[str, Any],
    ) -> list[dict[str, Any]]:
        observed_indicators = IndicatorSignalNormalizer.normalize(observed_outcomes.get("observed_indicator_values", {}))
        expected_indicators = expected_outcomes.get("input_snapshot", {})
        selected_regime = (expected_outcomes.get("selected_regime") or {}).get("regime_code")

        candidates = []
        for pattern in patterns:
            observation = observed_indicators.get(pattern.indicator.code)
            observed_signal = observation.signal if observation else 0.0
            expected_signal = float((expected_indicators.get(pattern.indicator.code) or {}).get("signal", 0.0) or 0.0)
            delta = observed_signal - expected_signal

            activation_score = max(
                0.0,
                abs(delta) * 0.65 + max(0.0, observed_signal * ExpressionHeuristics.expected_signal_direction(pattern.detection_expression)) * 0.35,
            )
            overlap_score = self._deviation_overlap_score(pattern, deviation_results["deviations"])
            regime_bonus = self._regime_bonus(pattern.code, selected_regime)

            match_score = clamp(
                activation_score
                * decimal_to_float(pattern.confidence_score, 1.0)
                * decimal_to_float(pattern.weight, 1.0)
                * self.SEVERITY_MULTIPLIER[pattern.severity_level]
                + overlap_score
                + regime_bonus,
                0.0,
                3.0,
            )
            if match_score <= 0.15:
                continue

            explanation = (
                f"{pattern.name} is relevant because {pattern.indicator.code} deviated from "
                f"expected signal {expected_signal:.2f} to observed {observed_signal:.2f}, "
                f"while the pattern rationale suggests: {pattern.rationale or pattern.description}"
            )
            candidates.append(
                {
                    "pattern_id": pattern.id,
                    "pattern_code": pattern.code,
                    "pattern_name": pattern.name,
                    "match_score": round(match_score, 4),
                    "severity_level": pattern.severity_level,
                    "indicator_code": pattern.indicator.code,
                    "explanation": explanation,
                    "payload": {
                        "observed_signal": round(observed_signal, 4),
                        "expected_signal": round(expected_signal, 4),
                        "delta": round(delta, 4),
                        "activation_score": round(activation_score, 4),
                        "overlap_score": round(overlap_score, 4),
                        "regime_bonus": round(regime_bonus, 4),
                    },
                }
            )

        candidates.sort(key=lambda item: item["match_score"], reverse=True)
        for rank, candidate in enumerate(candidates, start=1):
            candidate["rank"] = rank
        return candidates

    @staticmethod
    def _deviation_overlap_score(pattern: DivergencePattern, deviations: list[dict[str, Any]]) -> float:
        overlap = 0.0
        for deviation in deviations:
            if pattern.indicator.code in deviation.get("keys", []):
                overlap += 0.45 * deviation["severity"]
            elif pattern.indicator.code in deviation.get("message", ""):
                overlap += 0.25 * deviation["severity"]
        return min(overlap, 0.9)

    @staticmethod
    def _regime_bonus(pattern_code: str, selected_regime_code: str | None) -> float:
        if not selected_regime_code:
            return 0.0
        bonuses = {
            "REG_STAGFLATION": {"DIV_06": 0.20, "DIV_10": 0.15, "DIV_12": 0.15},
            "REG_HARD_LANDING": {"DIV_04": 0.12, "DIV_05": 0.20, "DIV_12": 0.10},
            "REG_GOLDILOCKS": {"DIV_03": 0.08, "DIV_05": -0.10, "DIV_12": -0.12},
        }
        return bonuses.get(selected_regime_code, {}).get(pattern_code, 0.0)


class DivergenceExplanationService:
    def __init__(self):
        self.expected_builder = ExpectedOutcomeBuilder()
        self.deviation_detector = OutcomeDeviationDetector()
        self.pattern_matcher = DivergencePatternMatcher()

    @transaction.atomic
    def analyze(
        self,
        *,
        engine_run_audit: EngineRunAudit | None,
        expected_outcomes: dict[str, Any],
        observed_outcomes: dict[str, Any],
        persist: bool,
        notes: str = "",
    ) -> dict[str, Any]:
        if engine_run_audit:
            expected = self.expected_builder.from_audit(engine_run_audit)
            if expected_outcomes:
                expected.update(expected_outcomes)
        else:
            expected = expected_outcomes

        deviation_results = self.deviation_detector.detect(expected, observed_outcomes)
        patterns = list(DivergencePattern.objects.filter(is_active=True).select_related("indicator"))
        candidates = self.pattern_matcher.rank_candidates(
            patterns=patterns,
            deviation_results=deviation_results,
            observed_outcomes=observed_outcomes,
            expected_outcomes=expected,
        )

        selected_regime = expected.get("selected_regime") or {}
        result = {
            "expected_outcomes": expected,
            "observed_outcomes": observed_outcomes,
            "deviation_results": deviation_results,
            "candidate_explanations": candidates,
            "notes": notes,
        }

        if not persist:
            return result

        primary_pattern = candidates[0] if candidates else None
        event_code = (
            f"DIV_EVT_{engine_run_audit.id}_{selected_regime.get('regime_code', 'UNSCOPED')}"
            if engine_run_audit
            else f"DIV_EVT_MANUAL_{selected_regime.get('regime_code', 'UNSCOPED')}"
        )
        event, _ = DivergenceEvent.objects.update_or_create(
            code=event_code,
            defaults={
                "title": "Macro divergence event",
                "summary": self._build_summary(deviation_results, candidates),
                "divergence_score": deviation_results["net_divergence_score"] * 100.0,
                "engine_run_audit": engine_run_audit,
                "regime_id": selected_regime.get("regime_id"),
                "primary_pattern_id": primary_pattern["pattern_id"] if primary_pattern else None,
                "expected_outcomes": expected,
                "observed_outcomes": observed_outcomes,
                "deviation_snapshot": deviation_results,
                "explanation_trace": {
                    "candidate_explanations": candidates,
                    "notes": notes,
                },
            },
        )
        event.matched_explanations.all().delete()

        explanation_records = []
        for candidate in candidates[:10]:
            explanation = DivergenceEventExplanation.objects.create(
                divergence_event=event,
                pattern_id=candidate["pattern_id"],
                rank=candidate["rank"],
                match_score=candidate["match_score"] * 100.0,
                explanation=candidate["explanation"],
                payload=candidate["payload"],
            )
            explanation_records.append(explanation.id)

        result["event_id"] = event.id
        result["event_code"] = event.code
        result["stored_explanation_ids"] = explanation_records

        if engine_run_audit:
            payload = engine_run_audit.payload or {}
            payload["divergence_analysis"] = {
                "event_id": event.id,
                "event_code": event.code,
                "net_divergence_score": deviation_results["net_divergence_score"],
                "top_candidate_patterns": [candidate["pattern_code"] for candidate in candidates[:5]],
            }
            engine_run_audit.payload = payload
            engine_run_audit.save(update_fields=["payload", "updated_at"])
        return result

    @staticmethod
    def _build_summary(deviation_results: dict[str, Any], candidates: list[dict[str, Any]]) -> str:
        top_deviation = deviation_results["deviations"][0]["message"] if deviation_results["deviations"] else "No significant deviations."
        top_explanation = candidates[0]["pattern_name"] if candidates else "No matching divergence patterns."
        return f"{top_deviation} Top candidate explanation: {top_explanation}."
