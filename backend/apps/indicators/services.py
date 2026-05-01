from common.services import BaseModelService

from .models import Indicator


class IndicatorService(BaseModelService):
    queryset = Indicator.objects

