from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class KnowledgeMetadataModel(models.Model):
    rationale = models.TextField(blank=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    weight = models.DecimalField(max_digits=6, decimal_places=2, default=1)
    lag_months = models.IntegerField(null=True, blank=True)
    lag_notes = models.CharField(max_length=255, blank=True)

    class Meta:
        abstract = True
