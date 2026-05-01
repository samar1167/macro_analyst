from django.db import models

from apps.indicators.models import Indicator
from common.models import KnowledgeMetadataModel, TimeStampedModel


class Regime(TimeStampedModel, KnowledgeMetadataModel):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    regime_type = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    primary_indicator = models.ForeignKey(
        Indicator,
        related_name="regimes",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"
