from django.contrib import admin

from .models import Opportunity


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "direction", "status", "conviction_score", "regime", "detected_at")
    search_fields = ("code", "title", "status")
    list_filter = ("status",)
