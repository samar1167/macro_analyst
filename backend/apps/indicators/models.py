from django.db import models

from common.models import KnowledgeMetadataModel, TimeStampedModel


class Indicator(TimeStampedModel, KnowledgeMetadataModel):
    class Frequency(models.TextChoices):
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"
        MONTHLY = "monthly", "Monthly"
        QUARTERLY = "quarterly", "Quarterly"
        ANNUAL = "annual", "Annual"

    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    frequency = models.CharField(max_length=20, choices=Frequency.choices)
    source = models.CharField(max_length=255)
    unit = models.CharField(max_length=64, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"
