from common.services import BaseModelService

from .models import EngineRunAudit
from .runtime import MacroInferenceRuntime


class MacroInferenceService:
    runtime = MacroInferenceRuntime()

    @classmethod
    def execute(cls, validated_data):
        return cls.runtime.execute(**validated_data)


class EngineRunAuditService(BaseModelService):
    queryset = EngineRunAudit.objects.select_related("regime")
