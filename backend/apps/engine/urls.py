from rest_framework.routers import DefaultRouter

from .views import EngineRunAuditViewSet


router = DefaultRouter()
router.register("runs", EngineRunAuditViewSet, basename="engine-run-audit")

urlpatterns = router.urls

