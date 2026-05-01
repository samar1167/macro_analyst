from common.viewsets import ServiceModelViewSet

from .models import Indicator
from .serializers import IndicatorSerializer
from .services import IndicatorService


class IndicatorViewSet(ServiceModelViewSet):
    queryset = Indicator.objects.all()
    serializer_class = IndicatorSerializer
    service_class = IndicatorService

