from rest_framework import serializers

from .models import CausalRule


class CausalRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CausalRule
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

