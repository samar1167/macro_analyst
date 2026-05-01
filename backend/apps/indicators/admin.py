from django.contrib import admin

from .models import Indicator


@admin.register(Indicator)
class IndicatorAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "category", "frequency", "source", "is_active")
    search_fields = ("code", "name", "category", "source")
    list_filter = ("frequency", "category", "is_active")

