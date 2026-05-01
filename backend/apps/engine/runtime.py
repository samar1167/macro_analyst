from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

from django.db import transaction
from django.utils import timezone

from apps.causal_rules.models import CausalRule
from apps.divergence.models import DivergencePattern
from apps.drivers.models import DerivedDriver
from apps.engine.config.industry_playbooks import INDUSTRY_PLAYBOOKS
from apps.engine.config.opportunity_playbooks import OPPORTUNITY_PLAYBOOKS
from apps.engine.config.regime_profiles import REGIME_DRIVER_PROFILES
from apps.engine.models import EngineRunAudit
from apps.opportunities.models import Opportunity
from apps.regimes.models import Regime


def clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def decimal_to_float(value: Any, default: float = 0.0) -> float:
    if value is None:
        return default
    return float(value)


@dataclass
class IndicatorObservation:
    code: str
    value: float | None
    signal: float
    confidence: float
    change: float | None
    zscore: float | None
    notes: str


class ExpressionHeuristics:
    POSITIVE_KEYWORDS = (
        "rising",
        "rise",
        "higher",
        "high",
        "elevated",
        "strong",
        "stronger",
        "above",
        "widen",
        "widens",
        "widening",
        "breaks above",
        "compression",
        "tightens",
        "appreciating",
        "accelerat",
        "sticky",
        "expansionary",
    )
    NEGATIVE_KEYWORDS = (
        "falling",
        "falls",
        "lower",
        "low",
        "below",
        "weak",
        "weaker",
        "soft",
        "soften",
        "cooling",
        "decline",
        "contractionary",
        "decelerat",
        "drags",
        "down",
    )

    @classmethod
    def expected_signal_direction(cls, text: str) -> int:
        lowered = text.lower()
        positive_hits = sum(1 for keyword in cls.POSITIVE_KEYWORDS if keyword in lowered)
        negative_hits = sum(1 for keyword in cls.NEGATIVE_KEYWORDS if keyword in lowered)
        if positive_hits > negative_hits:
            return 1
        if negative_hits > positive_hits:
            return -1
        return 1

    @staticmethod
    def effect_direction(text: str) -> float:
        lowered = text.lower()
        if "decrease" in lowered or "reduce" in lowered:
            return -1.0
        if "maintain or slightly increase" in lowered:
            return 0.50
        if "slightly increase" in lowered:
            return 0.40
        if "increase" in lowered or "raise" in lowered or "improve" in lowered:
            return 1.0
        return 0.0

    @staticmethod
    def lag_multiplier(lag_months: int | None) -> float:
        if lag_months is None:
            return 1.0
        return max(0.35, 1.0 - (lag_months / 18.0))


class IndicatorSignalNormalizer:
    @classmethod
    def normalize(cls, indicator_payloads: dict[str, dict[str, Any]]) -> dict[str, IndicatorObservation]:
        normalized = {}
        for code, payload in indicator_payloads.items():
            signal = cls._derive_signal(payload)
            confidence = clamp(float(payload.get("confidence", 1.0)), 0.0, 1.0)
            normalized[code] = IndicatorObservation(
                code=code,
                value=payload.get("value"),
                signal=signal,
                confidence=confidence,
                change=payload.get("change"),
                zscore=payload.get("zscore"),
                notes=payload.get("notes", ""),
            )
        return normalized

    @staticmethod
    def _derive_signal(payload: dict[str, Any]) -> float:
        if payload.get("signal") is not None:
            return clamp(float(payload["signal"]), -1.0, 1.0)
        if payload.get("zscore") is not None:
            return clamp(math.tanh(float(payload["zscore"]) / 2.0), -1.0, 1.0)
        if payload.get("change") is not None:
            return clamp(math.tanh(float(payload["change"])), -1.0, 1.0)
        return 0.0


class DerivedDriverComputationEngine:
    def compute(
        self,
        drivers: list[DerivedDriver],
        observations: dict[str, IndicatorObservation],
    ) -> dict[str, dict[str, Any]]:
        results = {}
        for driver in drivers:
            contributions = []
            total_weight = 0.0
            weighted_signal_sum = 0.0

            for indicator in driver.indicators.all():
                observation = observations.get(indicator.code)
                if not observation:
                    continue
                indicator_weight = decimal_to_float(indicator.weight, 1.0)
                contribution_weight = indicator_weight * observation.confidence
                weighted_signal = observation.signal * contribution_weight
                weighted_signal_sum += weighted_signal
                total_weight += contribution_weight
                contributions.append(
                    {
                        "indicator_code": indicator.code,
                        "indicator_name": indicator.name,
                        "signal": round(observation.signal, 4),
                        "weight": round(contribution_weight, 4),
                        "weighted_signal": round(weighted_signal, 4),
                        "notes": observation.notes,
                    }
                )

            raw_score = weighted_signal_sum / total_weight if total_weight else 0.0
            confidence_multiplier = decimal_to_float(driver.confidence_score, 1.0)
            weight_multiplier = decimal_to_float(driver.weight, 1.0)
            base_score = clamp(raw_score * confidence_multiplier * weight_multiplier, -1.5, 1.5)

            results[driver.code] = {
                "driver_id": driver.id,
                "driver_code": driver.code,
                "driver_name": driver.name,
                "base_score": round(base_score, 4),
                "propagated_score": 0.0,
                "net_score": round(base_score, 4),
                "contributions": contributions,
                "explanation_trace": [
                    {
                        "stage": "derived_driver_base",
                        "message": (
                            f"{driver.name} base score {base_score:.2f} derived from "
                            f"{len(contributions)} linked indicators."
                        ),
                    }
                ],
            }
        return results


class WeightedCausalPropagationEngine:
    def propagate(
        self,
        rules: list[CausalRule],
        observations: dict[str, IndicatorObservation],
        driver_results: dict[str, dict[str, Any]],
    ) -> list[dict[str, Any]]:
        applied_rules = []
        for rule in rules:
            if not rule.derived_driver_id or rule.derived_driver.code not in driver_results:
                continue

            observation = observations.get(rule.lead_indicator.code)
            if not observation:
                continue

            expected_direction = ExpressionHeuristics.expected_signal_direction(rule.condition_expression)
            activation_strength = max(0.0, observation.signal * expected_direction)
            effect_direction = ExpressionHeuristics.effect_direction(rule.effect_expression)
            lag_multiplier = ExpressionHeuristics.lag_multiplier(rule.lag_months)
            contribution = (
                effect_direction
                * activation_strength
                * decimal_to_float(rule.weight, 1.0)
                * decimal_to_float(rule.confidence_score, 1.0)
                * lag_multiplier
                * observation.confidence
            )
            if abs(contribution) < 0.0001:
                continue

            driver_result = driver_results[rule.derived_driver.code]
            driver_result["propagated_score"] = round(driver_result["propagated_score"] + contribution, 4)
            driver_result["net_score"] = round(
                clamp(driver_result["base_score"] + driver_result["propagated_score"], -2.0, 2.0),
                4,
            )
            trace = {
                "stage": "causal_rule",
                "rule_code": rule.code,
                "message": (
                    f"{rule.name} contributed {contribution:.2f} to {rule.derived_driver.name} "
                    f"from lead indicator {rule.lead_indicator.code}."
                ),
            }
            driver_result["explanation_trace"].append(trace)
            applied_rules.append(
                {
                    "rule_code": rule.code,
                    "rule_name": rule.name,
                    "driver_code": rule.derived_driver.code,
                    "lead_indicator_code": rule.lead_indicator.code,
                    "activation_strength": round(activation_strength, 4),
                    "effect_direction": effect_direction,
                    "lag_multiplier": round(lag_multiplier, 4),
                    "contribution": round(contribution, 4),
                }
            )
        return applied_rules


class DivergenceScoringEngine:
    SEVERITY_MULTIPLIERS = {
        DivergencePattern.Severity.LOW: 0.75,
        DivergencePattern.Severity.MEDIUM: 1.0,
        DivergencePattern.Severity.HIGH: 1.25,
    }

    def score(
        self,
        patterns: list[DivergencePattern],
        observations: dict[str, IndicatorObservation],
    ) -> dict[str, dict[str, Any]]:
        results = {}
        for pattern in patterns:
            observation = observations.get(pattern.indicator.code)
            if not observation:
                continue

            expected_direction = ExpressionHeuristics.expected_signal_direction(pattern.detection_expression)
            activation_strength = max(0.0, observation.signal * expected_direction)
            score = (
                activation_strength
                * decimal_to_float(pattern.weight, 1.0)
                * decimal_to_float(pattern.confidence_score, 1.0)
                * self.SEVERITY_MULTIPLIERS[pattern.severity_level]
                * observation.confidence
            )
            if score <= 0:
                continue

            results[pattern.code] = {
                "pattern_id": pattern.id,
                "pattern_code": pattern.code,
                "pattern_name": pattern.name,
                "score": round(clamp(score, 0.0, 2.0), 4),
                "severity_level": pattern.severity_level,
                "indicator_code": pattern.indicator.code,
                "explanation_trace": [
                    {
                        "stage": "divergence_detection",
                        "message": (
                            f"{pattern.name} activated with score {score:.2f} based on "
                            f"{pattern.indicator.code} signal {observation.signal:.2f}."
                        ),
                    }
                ],
            }
        return results


class RegimeClassificationEngine:
    def classify(
        self,
        regimes: list[Regime],
        observations: dict[str, IndicatorObservation],
        driver_results: dict[str, dict[str, Any]],
        divergence_results: dict[str, dict[str, Any]],
    ) -> dict[str, Any]:
        ranked = []
        for regime in regimes:
            profile = REGIME_DRIVER_PROFILES.get(regime.code, {})
            driver_profile = profile.get("drivers", {})
            divergence_boosts = profile.get("divergence_boosts", {})

            driver_contributions = []
            denominator = 0.0
            raw_score = 0.0
            for driver_code, desired_direction in driver_profile.items():
                driver_result = driver_results.get(driver_code)
                if not driver_result:
                    continue
                weight = abs(desired_direction)
                contribution = driver_result["net_score"] * desired_direction
                raw_score += contribution
                denominator += weight
                driver_contributions.append(
                    {
                        "driver_code": driver_code,
                        "driver_name": driver_result["driver_name"],
                        "net_score": driver_result["net_score"],
                        "desired_direction": desired_direction,
                        "contribution": round(contribution, 4),
                    }
                )

            driver_fit = raw_score / denominator if denominator else 0.0
            divergence_adjustment = 0.0
            divergence_details = []
            for pattern_code, multiplier in divergence_boosts.items():
                divergence_result = divergence_results.get(pattern_code)
                if not divergence_result:
                    continue
                adjustment = divergence_result["score"] * multiplier
                divergence_adjustment += adjustment
                divergence_details.append(
                    {
                        "pattern_code": pattern_code,
                        "pattern_name": divergence_result["pattern_name"],
                        "score": divergence_result["score"],
                        "multiplier": multiplier,
                        "adjustment": round(adjustment, 4),
                    }
                )

            primary_indicator_signal = 0.0
            if regime.primary_indicator_id and regime.primary_indicator.code in observations:
                primary_indicator_signal = observations[regime.primary_indicator.code].signal * 0.15

            final_score = clamp(
                (driver_fit + divergence_adjustment + primary_indicator_signal)
                * decimal_to_float(regime.weight, 1.0)
                * decimal_to_float(regime.confidence_score, 1.0),
                -2.0,
                2.0,
            )
            ranked.append(
                {
                    "regime_id": regime.id,
                    "regime_code": regime.code,
                    "regime_name": regime.name,
                    "regime_type": regime.regime_type,
                    "score": round(final_score, 4),
                    "driver_fit": round(driver_fit, 4),
                    "divergence_adjustment": round(divergence_adjustment, 4),
                    "primary_indicator_signal": round(primary_indicator_signal, 4),
                    "driver_contributions": driver_contributions,
                    "divergence_details": divergence_details,
                    "explanation_trace": [
                        {
                            "stage": "regime_classification",
                            "message": (
                                f"{regime.name} scored {final_score:.2f} from weighted driver fit "
                                f"and divergence adjustments."
                            ),
                        }
                    ],
                }
            )

        ranked.sort(key=lambda item: item["score"], reverse=True)
        selected = ranked[0] if ranked else None
        return {
            "selected_regime": selected,
            "ranked_regimes": ranked,
        }


class OpportunityScoringEngine:
    def generate(
        self,
        *,
        audit: EngineRunAudit,
        regime_results: dict[str, Any],
        driver_results: dict[str, dict[str, Any]],
        divergence_results: dict[str, dict[str, Any]],
        persist: bool,
    ) -> list[dict[str, Any]]:
        selected_regime = regime_results.get("selected_regime")
        if not selected_regime:
            return []

        playbook = OPPORTUNITY_PLAYBOOKS.get(selected_regime["regime_code"], {})
        driver_codes = playbook.get("drivers", [])
        ranked_divergences = sorted(
            divergence_results.values(),
            key=lambda item: item["score"],
            reverse=True,
        )
        top_divergence = ranked_divergences[0] if ranked_divergences and ranked_divergences[0]["score"] >= 0.25 else None

        opportunities = []
        for driver_code in driver_codes:
            driver_result = driver_results.get(driver_code)
            if not driver_result:
                continue
            if abs(driver_result["net_score"]) < 0.20:
                continue

            conviction = clamp(
                (max(selected_regime["score"], 0.0) * 55.0)
                + (abs(driver_result["net_score"]) * 30.0)
                + ((top_divergence["score"] * 15.0) if top_divergence else 0.0),
                0.0,
                100.0,
            )
            status = Opportunity.Status.NEW
            if conviction >= 70:
                status = Opportunity.Status.ACTIVE
            elif conviction >= 45:
                status = Opportunity.Status.REVIEW

            code = f"{selected_regime['regime_code']}_{driver_code}_{top_divergence['pattern_code'] if top_divergence else 'BASE'}"
            description = (
                f"{playbook.get('title', 'Macro opportunity')} generated from regime "
                f"{selected_regime['regime_name']} (score {selected_regime['score']:.2f}) "
                f"with supporting driver {driver_result['driver_name']} "
                f"(net score {driver_result['net_score']:.2f})."
            )
            payload = {
                "code": code,
                "title": f"{playbook.get('title', 'Macro opportunity')}: {driver_result['driver_name']}",
                "description": description,
                "status": status,
                "conviction_score": round(conviction, 2),
                "direction": playbook.get("direction", ""),
                "supporting_driver_id": driver_result["driver_id"],
                "regime_id": selected_regime["regime_id"],
                "divergence_pattern_id": top_divergence["pattern_id"] if top_divergence else None,
                "explanation_trace": {
                    "regime": selected_regime,
                    "driver": driver_result,
                    "divergence": top_divergence,
                },
                "score_components": {
                    "regime_component": round(max(selected_regime["score"], 0.0) * 55.0, 2),
                    "driver_component": round(abs(driver_result["net_score"]) * 30.0, 2),
                    "divergence_component": round((top_divergence["score"] * 15.0), 2) if top_divergence else 0.0,
                },
            }
            opportunities.append(payload)

            if not persist:
                continue

            defaults = {
                "title": payload["title"],
                "description": payload["description"],
                "status": payload["status"],
                "conviction_score": payload["conviction_score"],
                "direction": payload["direction"],
                "supporting_driver_id": payload["supporting_driver_id"],
                "regime_id": payload["regime_id"],
                "divergence_pattern_id": payload["divergence_pattern_id"],
                "detected_at": timezone.now(),
                "explanation_trace": payload["explanation_trace"],
                "score_components": payload["score_components"],
                "engine_run_audit": audit,
            }
            opportunity, _ = Opportunity.objects.update_or_create(code=code, defaults=defaults)
            payload["opportunity_id"] = opportunity.id

        return opportunities


class SimulationNarrativeBuilder:
    @staticmethod
    def _dedupe(items: list[str]) -> list[str]:
        seen = set()
        result = []
        for item in items:
            if item in seen:
                continue
            seen.add(item)
            result.append(item)
        return result

    def build(
        self,
        *,
        regime_results: dict[str, Any],
        driver_results: dict[str, dict[str, Any]],
        opportunities: list[dict[str, Any]],
    ) -> dict[str, Any]:
        selected_regime = regime_results.get("selected_regime")
        if not selected_regime:
            return {
                "regime_detected": None,
                "key_drivers_identified": [],
                "industry_effects_mapped": {
                    "outperformers": [],
                    "underperformers": [],
                    "transmission_channels": [],
                },
                "opportunities_generated": [],
                "reasoning_chain": [],
            }

        top_driver_contributions = sorted(
            selected_regime.get("driver_contributions", []),
            key=lambda item: abs(item["contribution"]),
            reverse=True,
        )[:3]

        key_drivers = []
        for contribution in top_driver_contributions:
            driver_result = driver_results.get(contribution["driver_code"], {})
            key_drivers.append(
                {
                    "driver_code": contribution["driver_code"],
                    "driver_name": contribution["driver_name"],
                    "net_score": contribution["net_score"],
                    "desired_direction": contribution["desired_direction"],
                    "contribution": contribution["contribution"],
                    "explanation_trace": driver_result.get("explanation_trace", []),
                }
            )

        playbook = INDUSTRY_PLAYBOOKS.get(selected_regime["regime_code"], {})
        outperformers = list(playbook.get("outperformers", []))
        underperformers = list(playbook.get("underperformers", []))
        channels = list(playbook.get("channels", []))
        driver_overrides = playbook.get("driver_overrides", {})

        driver_industry_links = []
        for driver in key_drivers:
            override = driver_overrides.get(driver["driver_code"], {})
            outperformers.extend(override.get("outperformers", []))
            underperformers.extend(override.get("underperformers", []))
            channels.extend(override.get("channels", []))
            driver_industry_links.append(
                {
                    "driver_code": driver["driver_code"],
                    "driver_name": driver["driver_name"],
                    "outperformers": override.get("outperformers", []),
                    "underperformers": override.get("underperformers", []),
                    "channels": override.get("channels", []),
                }
            )

        industry_effects = {
            "outperformers": self._dedupe(outperformers),
            "underperformers": self._dedupe(underperformers),
            "transmission_channels": self._dedupe(channels),
            "driver_links": driver_industry_links,
        }

        opportunity_summaries = []
        for opportunity in opportunities:
            supporting_driver_code = opportunity["explanation_trace"]["driver"]["driver_code"]
            supporting_driver_name = opportunity["explanation_trace"]["driver"]["driver_name"]
            driver_link = next(
                (
                    link
                    for link in driver_industry_links
                    if link["driver_code"] == supporting_driver_code
                ),
                None,
            )
            beneficiary_industries = self._dedupe(
                (driver_link.get("outperformers", []) if driver_link else [])
                + industry_effects["outperformers"][:4]
            )[:6]
            explanation = (
                f"{opportunity['title']} fits a {selected_regime['regime_name']} setup because "
                f"{supporting_driver_name.lower()} is reinforcing the regime signal."
            )
            if driver_link and driver_link.get("channels"):
                explanation = f"{explanation} {driver_link['channels'][0]}"
            if beneficiary_industries:
                explanation = (
                    f"{explanation} Industries most likely to benefit include "
                    f"{', '.join(beneficiary_industries[:3])}."
                )

            opportunity_summaries.append(
                {
                    "code": opportunity["code"],
                    "title": opportunity["title"],
                    "direction": opportunity["direction"],
                    "status": opportunity["status"],
                    "conviction_score": opportunity["conviction_score"],
                    "supporting_driver": supporting_driver_name,
                    "brief_explanation": explanation,
                    "beneficiary_industries": beneficiary_industries,
                }
            )

        reasoning_chain = [
            {
                "stage": "regime_detected",
                "message": (
                    f"{selected_regime['regime_name']} selected with score "
                    f"{selected_regime['score']:.2f}."
                ),
            }
        ]
        reasoning_chain.extend(
            {
                "stage": "key_driver_identified",
                "message": (
                    f"{driver['driver_name']} contributed {driver['contribution']:.2f} "
                    f"with net score {driver['net_score']:.2f}."
                ),
            }
            for driver in key_drivers
        )
        reasoning_chain.append(
            {
                "stage": "industry_effects_mapped",
                "message": (
                    f"Likely outperformers: {', '.join(industry_effects['outperformers'][:5]) or 'none'}. "
                    f"Likely underperformers: {', '.join(industry_effects['underperformers'][:5]) or 'none'}."
                ),
            }
        )
        reasoning_chain.append(
            {
                "stage": "opportunities_generated",
                "message": (
                    f"Generated {len(opportunity_summaries)} opportunity ideas from the "
                    f"{selected_regime['regime_name']} setup."
                ),
            }
        )

        return {
            "regime_detected": {
                "regime_code": selected_regime["regime_code"],
                "regime_name": selected_regime["regime_name"],
                "score": selected_regime["score"],
                "regime_type": selected_regime["regime_type"],
                "summary": selected_regime["explanation_trace"][0]["message"]
                if selected_regime.get("explanation_trace")
                else "",
            },
            "key_drivers_identified": key_drivers,
            "industry_effects_mapped": industry_effects,
            "opportunities_generated": opportunity_summaries,
            "reasoning_chain": reasoning_chain,
        }


class MacroInferenceRuntime:
    def __init__(self):
        self.driver_engine = DerivedDriverComputationEngine()
        self.rule_engine = WeightedCausalPropagationEngine()
        self.divergence_engine = DivergenceScoringEngine()
        self.regime_engine = RegimeClassificationEngine()
        self.opportunity_engine = OpportunityScoringEngine()
        self.narrative_builder = SimulationNarrativeBuilder()

    @transaction.atomic
    def execute(
        self,
        *,
        indicator_values: dict[str, dict[str, Any]],
        run_type: str,
        triggered_by: str,
        persist_opportunities: bool,
        notes: str = "",
    ) -> EngineRunAudit:
        audit = EngineRunAudit.objects.create(
            run_type=run_type,
            status=EngineRunAudit.Status.RUNNING,
            started_at=timezone.now(),
            triggered_by=triggered_by,
            payload={
                "input_snapshot": indicator_values,
                "notes": notes,
            },
            notes=notes,
        )

        try:
            observations = IndicatorSignalNormalizer.normalize(indicator_values)
            drivers = list(DerivedDriver.objects.filter(is_active=True).prefetch_related("indicators"))
            rules = list(
                CausalRule.objects.filter(is_active=True)
                .select_related("lead_indicator", "derived_driver")
            )
            divergences = list(
                DivergencePattern.objects.filter(is_active=True).select_related("indicator")
            )
            regimes = list(
                Regime.objects.filter(is_active=True).select_related("primary_indicator")
            )

            driver_results = self.driver_engine.compute(drivers, observations)
            applied_rules = self.rule_engine.propagate(rules, observations, driver_results)
            divergence_results = self.divergence_engine.score(divergences, observations)
            regime_results = self.regime_engine.classify(
                regimes,
                observations,
                driver_results,
                divergence_results,
            )
            opportunities = self.opportunity_engine.generate(
                audit=audit,
                regime_results=regime_results,
                driver_results=driver_results,
                divergence_results=divergence_results,
                persist=persist_opportunities,
            )
            simulation_story = self.narrative_builder.build(
                regime_results=regime_results,
                driver_results=driver_results,
                opportunities=opportunities,
            )

            selected_regime = regime_results.get("selected_regime")
            audit.regime_id = selected_regime["regime_id"] if selected_regime else None
            audit.status = EngineRunAudit.Status.SUCCESS
            audit.completed_at = timezone.now()
            audit.notes = (
                f"Selected regime: {selected_regime['regime_name']}" if selected_regime else "No regime selected."
            )
            audit.payload = {
                "input_snapshot": {
                    code: {
                        "value": observation.value,
                        "signal": round(observation.signal, 4),
                        "confidence": round(observation.confidence, 4),
                        "change": observation.change,
                        "zscore": observation.zscore,
                        "notes": observation.notes,
                    }
                    for code, observation in observations.items()
                },
                "derived_driver_scores": driver_results,
                "applied_rules": applied_rules,
                "divergence_scores": divergence_results,
                "regime_results": regime_results,
                "simulation_story": simulation_story,
                "opportunities": opportunities,
                "summary": {
                    "selected_regime": selected_regime["regime_code"] if selected_regime else None,
                    "top_drivers": [
                        item["driver_code"]
                        for item in sorted(
                            driver_results.values(),
                            key=lambda driver: abs(driver["net_score"]),
                            reverse=True,
                        )[:5]
                    ],
                    "rule_count": len(applied_rules),
                    "divergence_count": len(divergence_results),
                    "opportunity_count": len(opportunities),
                },
            }
            audit.save()
        except Exception as exc:
            audit.status = EngineRunAudit.Status.FAILED
            audit.completed_at = timezone.now()
            audit.notes = str(exc)
            audit.payload = {
                **audit.payload,
                "error": str(exc),
            }
            audit.save()
            raise

        return audit
