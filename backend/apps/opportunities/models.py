from django.db import models

from apps.divergence.models import DivergencePattern
from apps.drivers.models import DerivedDriver
from apps.engine.models import EngineRunAudit
from apps.regimes.models import Regime
from common.models import TimeStampedModel


class Opportunity(TimeStampedModel):
    class Status(models.TextChoices):
        NEW = "new", "New"
        REVIEW = "review", "Review"
        ACTIVE = "active", "Active"
        CLOSED = "closed", "Closed"

    code = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    conviction_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    direction = models.CharField(max_length=32, blank=True)
    regime = models.ForeignKey(
        Regime,
        related_name="opportunities",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    divergence_pattern = models.ForeignKey(
        DivergencePattern,
        related_name="opportunities",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    supporting_driver = models.ForeignKey(
        DerivedDriver,
        related_name="opportunities",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    detected_at = models.DateTimeField(null=True, blank=True)
    explanation_trace = models.JSONField(default=dict, blank=True)
    score_components = models.JSONField(default=dict, blank=True)
    engine_run_audit = models.ForeignKey(
        EngineRunAudit,
        related_name="generated_opportunities",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title
