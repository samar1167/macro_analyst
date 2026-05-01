from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/indicators/", include("apps.indicators.urls")),
    path("api/drivers/", include("apps.drivers.urls")),
    path("api/causal-rules/", include("apps.causal_rules.urls")),
    path("api/divergence/", include("apps.divergence.urls")),
    path("api/regimes/", include("apps.regimes.urls")),
    path("api/opportunities/", include("apps.opportunities.urls")),
    path("api/engine/", include("apps.engine.urls")),
]

