from common.services import BaseModelService

from .models import DerivedDriver


class DerivedDriverService(BaseModelService):
    queryset = DerivedDriver.objects

