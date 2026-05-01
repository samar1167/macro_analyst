from rest_framework.routers import DefaultRouter

from .views import DerivedDriverViewSet


router = DefaultRouter()
router.register("", DerivedDriverViewSet, basename="derived-driver")

urlpatterns = router.urls

