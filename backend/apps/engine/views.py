from rest_framework.decorators import action
from rest_framework.response import Response

from common.viewsets import ServiceModelViewSet

from .models import EngineRunAudit
from .serializers import EngineRunAuditSerializer, ExecuteEngineRunSerializer
from .services import EngineRunAuditService, MacroInferenceService


class EngineRunAuditViewSet(ServiceModelViewSet):
    queryset = EngineRunAudit.objects.all()
    serializer_class = EngineRunAuditSerializer
    service_class = EngineRunAuditService

    @action(detail=False, methods=["post"], url_path="execute")
    def execute(self, request):
        serializer = ExecuteEngineRunSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        audit = MacroInferenceService.execute(serializer.validated_data)
        response_serializer = self.get_serializer(audit)
        return Response(response_serializer.data)
