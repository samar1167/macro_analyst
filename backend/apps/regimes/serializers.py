from rest_framework import serializers

from .models import Regime


class RegimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Regime
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

