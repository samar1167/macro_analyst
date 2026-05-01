from rest_framework import serializers

from .models import Indicator


class IndicatorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Indicator
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

