from common.viewsets import ServiceModelViewSet

from .models import Opportunity
from .serializers import OpportunitySerializer
from .services import OpportunityService


class OpportunityViewSet(ServiceModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    service_class = OpportunityService

