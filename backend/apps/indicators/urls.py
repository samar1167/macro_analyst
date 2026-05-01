from rest_framework.routers import DefaultRouter

from .views import IndicatorViewSet


router = DefaultRouter()
router.register("", IndicatorViewSet, basename="indicator")

urlpatterns = router.urls

