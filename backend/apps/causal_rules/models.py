from django.db import models

from apps.drivers.models import DerivedDriver
from apps.indicators.models import Indicator
from common.models import KnowledgeMetadataModel, TimeStampedModel


class CausalRule(TimeStampedModel, KnowledgeMetadataModel):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    lead_indicator = models.ForeignKey(
        Indicator,
        related_name="causal_rules",
        on_delete=models.PROTECT,
    )
    derived_driver = models.ForeignKey(
        DerivedDriver,
        related_name="causal_rules",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
    )
    condition_expression = models.TextField()
    effect_expression = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
