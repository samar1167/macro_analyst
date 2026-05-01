from common.viewsets import ServiceModelViewSet

from .models import DerivedDriver
from .serializers import DerivedDriverSerializer
from .services import DerivedDriverService


class DerivedDriverViewSet(ServiceModelViewSet):
    queryset = DerivedDriver.objects.all()
    serializer_class = DerivedDriverSerializer
    service_class = DerivedDriverService

