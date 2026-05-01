from django.db import models

from apps.indicators.models import Indicator
from common.models import KnowledgeMetadataModel, TimeStampedModel


class DerivedDriver(TimeStampedModel, KnowledgeMetadataModel):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    methodology = models.TextField(blank=True)
    formula_expression = models.TextField(blank=True)
    indicators = models.ManyToManyField(Indicator, related_name="derived_drivers", blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"
