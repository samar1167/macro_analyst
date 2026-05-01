from rest_framework.routers import DefaultRouter

from .views import RegimeViewSet


router = DefaultRouter()
router.register("", RegimeViewSet, basename="regime")

urlpatterns = router.urls

