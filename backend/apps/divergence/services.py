from common.services import BaseModelService

from .models import DivergenceEvent, DivergencePattern
from .runtime import DivergenceExplanationService


class DivergenceAnalyzerService:
    runtime = DivergenceExplanationService()

    @classmethod
    def analyze(cls, **kwargs):
        return cls.runtime.analyze(**kwargs)


class DivergencePatternService(BaseModelService):
    queryset = DivergencePattern.objects.select_related("indicator")


class DivergenceEventService(BaseModelService):
    queryset = DivergenceEvent.objects.select_related("engine_run_audit", "regime", "primary_pattern")
