from common.services import BaseModelService

from .models import Opportunity


class OpportunityService(BaseModelService):
    queryset = Opportunity.objects.select_related("regime", "divergence_pattern", "supporting_driver")

