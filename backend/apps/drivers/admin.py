from django.contrib import admin

from .models import DerivedDriver


@admin.register(DerivedDriver)
class DerivedDriverAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "is_active")
    search_fields = ("code", "name")
    filter_horizontal = ("indicators",)

