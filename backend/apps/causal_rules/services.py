from common.services import BaseModelService

from .models import CausalRule


class CausalRuleService(BaseModelService):
    queryset = CausalRule.objects.select_related("lead_indicator", "derived_driver")

