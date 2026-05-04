from django.db import models

from apps.regimes.models import Regime
from common.models import TimeStampedModel


class EngineRunAudit(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        RUNNING = "running", "Running"
        SUCCESS = "success", "Success"
        FAILED = "failed", "Failed"

    run_type = models.CharField(max_length=120)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    triggered_by = models.CharField(max_length=255, blank=True)
    simulation_label = models.CharField(max_length=255, blank=True)
    regime = models.ForeignKey(
        Regime,
        related_name="engine_run_audits",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    payload = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        if self.simulation_label:
            return f"{self.simulation_label} - {self.status}"
        return f"{self.run_type} - {self.status}"
