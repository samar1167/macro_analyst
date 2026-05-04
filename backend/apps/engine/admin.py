from django.contrib import admin

from .models import EngineRunAudit


@admin.register(EngineRunAudit)
class EngineRunAuditAdmin(admin.ModelAdmin):
    list_display = ("simulation_label", "run_type", "status", "started_at", "completed_at", "regime")
    search_fields = ("simulation_label", "run_type", "status", "triggered_by")
    list_filter = ("status",)
