from common.services import BaseModelService

from .models import Regime


class RegimeService(BaseModelService):
    queryset = Regime.objects.select_related("primary_indicator")

