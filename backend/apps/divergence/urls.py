from rest_framework.routers import DefaultRouter

from .views import DivergenceEventViewSet, DivergencePatternViewSet


router = DefaultRouter()
router.register("events", DivergenceEventViewSet, basename="divergence-event")
router.register("", DivergencePatternViewSet, basename="divergence-pattern")

urlpatterns = router.urls
