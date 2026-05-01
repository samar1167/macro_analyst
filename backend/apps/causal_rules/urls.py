from rest_framework.routers import DefaultRouter

from .views import CausalRuleViewSet


router = DefaultRouter()
router.register("", CausalRuleViewSet, basename="causal-rule")

urlpatterns = router.urls

