from rest_framework.decorators import action
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from apps.engine.models import EngineRunAudit
from common.viewsets import ServiceModelViewSet

from .models import DivergenceEvent, DivergencePattern
from .serializers import AnalyzeDivergenceSerializer, DivergenceEventSerializer, DivergencePatternSerializer
from .services import DivergenceAnalyzerService, DivergenceEventService, DivergencePatternService


class DivergencePatternViewSet(ServiceModelViewSet):
    queryset = DivergencePattern.objects.all()
    serializer_class = DivergencePatternSerializer
    service_class = DivergencePatternService


class DivergenceEventViewSet(ServiceModelViewSet):
    queryset = DivergenceEvent.objects.all()
    serializer_class = DivergenceEventSerializer
    service_class = DivergenceEventService

    @action(detail=False, methods=["post"], url_path="analyze")
    def analyze(self, request):
        serializer = AnalyzeDivergenceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        engine_run_audit = None
        engine_run_audit_id = serializer.validated_data.get("engine_run_audit_id")
        if engine_run_audit_id:
            engine_run_audit = get_object_or_404(EngineRunAudit, id=engine_run_audit_id)

        result = DivergenceAnalyzerService.analyze(
            engine_run_audit=engine_run_audit,
            expected_outcomes=serializer.validated_data.get("expected_outcomes", {}),
            observed_outcomes=serializer.validated_data["observed_outcomes"],
            persist=serializer.validated_data.get("persist", True),
            notes=serializer.validated_data.get("notes", ""),
        )

        if result.get("event_id"):
            event = get_object_or_404(DivergenceEvent, id=result["event_id"])
            response_serializer = self.get_serializer(event)
            return Response(
                {
                    "event": response_serializer.data,
                    "analysis": result,
                }
            )
        return Response(result)
