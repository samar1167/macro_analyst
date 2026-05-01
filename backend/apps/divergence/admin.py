from django.contrib import admin

from .models import DivergenceEvent, DivergenceEventExplanation, DivergencePattern


@admin.register(DivergencePattern)
class DivergencePatternAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "indicator", "severity_level", "is_active")
    search_fields = ("code", "name")
    list_filter = ("severity_level", "is_active")


class DivergenceEventExplanationInline(admin.TabularInline):
    model = DivergenceEventExplanation
    extra = 0
    readonly_fields = ("pattern", "rank", "match_score", "explanation", "payload")


@admin.register(DivergenceEvent)
class DivergenceEventAdmin(admin.ModelAdmin):
    list_display = ("code", "status", "divergence_score", "regime", "primary_pattern", "created_at")
    search_fields = ("code", "title", "summary")
    list_filter = ("status",)
    inlines = [DivergenceEventExplanationInline]
