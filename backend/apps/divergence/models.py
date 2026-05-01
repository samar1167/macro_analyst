from django.db import models

from apps.indicators.models import Indicator
from common.models import KnowledgeMetadataModel, TimeStampedModel


class DivergencePattern(TimeStampedModel, KnowledgeMetadataModel):
    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    indicator = models.ForeignKey(
        Indicator,
        related_name="divergence_patterns",
        on_delete=models.PROTECT,
    )
    detection_expression = models.TextField()
    severity_level = models.CharField(max_length=20, choices=Severity.choices, default=Severity.MEDIUM)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class DivergenceEvent(TimeStampedModel):
    class Status(models.TextChoices):
        DETECTED = "detected", "Detected"
        REVIEWED = "reviewed", "Reviewed"
        RESOLVED = "resolved", "Resolved"

    code = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    summary = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DETECTED)
    divergence_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    engine_run_audit = models.ForeignKey(
        "engine.EngineRunAudit",
        related_name="divergence_events",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    regime = models.ForeignKey(
        "regimes.Regime",
        related_name="divergence_events",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    primary_pattern = models.ForeignKey(
        "divergence.DivergencePattern",
        related_name="primary_divergence_events",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    expected_outcomes = models.JSONField(default=dict, blank=True)
    observed_outcomes = models.JSONField(default=dict, blank=True)
    deviation_snapshot = models.JSONField(default=dict, blank=True)
    explanation_trace = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.code


class DivergenceEventExplanation(TimeStampedModel):
    divergence_event = models.ForeignKey(
        DivergenceEvent,
        related_name="matched_explanations",
        on_delete=models.CASCADE,
    )
    pattern = models.ForeignKey(
        DivergencePattern,
        related_name="event_explanations",
        on_delete=models.PROTECT,
    )
    rank = models.PositiveIntegerField()
    match_score = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    explanation = models.TextField(blank=True)
    payload = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["rank", "-match_score"]
        unique_together = ("divergence_event", "pattern")

    def __str__(self):
        return f"{self.divergence_event.code} - {self.pattern.code}"
