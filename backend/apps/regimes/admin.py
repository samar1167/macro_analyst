from django.contrib import admin

from .models import Regime


@admin.register(Regime)
class RegimeAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "regime_type", "primary_indicator", "is_active")
    search_fields = ("code", "name", "regime_type")
    list_filter = ("regime_type", "is_active")

