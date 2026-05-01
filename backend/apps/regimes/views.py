from common.viewsets import ServiceModelViewSet

from .models import Regime
from .serializers import RegimeSerializer
from .services import RegimeService


class RegimeViewSet(ServiceModelViewSet):
    queryset = Regime.objects.all()
    serializer_class = RegimeSerializer
    service_class = RegimeService

