from django.contrib import admin

from .models import CausalRule


@admin.register(CausalRule)
class CausalRuleAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "lead_indicator", "derived_driver", "confidence_score", "is_active")
    search_fields = ("code", "name")
    list_filter = ("is_active",)
