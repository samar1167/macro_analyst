from common.viewsets import ServiceModelViewSet

from .models import CausalRule
from .serializers import CausalRuleSerializer
from .services import CausalRuleService


class CausalRuleViewSet(ServiceModelViewSet):
    queryset = CausalRule.objects.all()
    serializer_class = CausalRuleSerializer
    service_class = CausalRuleService

