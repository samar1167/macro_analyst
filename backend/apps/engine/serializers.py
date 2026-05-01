from rest_framework import serializers

from .models import EngineRunAudit


class EngineRunAuditSerializer(serializers.ModelSerializer):
    class Meta:
        model = EngineRunAudit
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class ExecuteEngineRunSerializer(serializers.Serializer):
    run_type = serializers.CharField(required=False, default="macro_inference")
    triggered_by = serializers.CharField(required=False, allow_blank=True, default="api")
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    persist_opportunities = serializers.BooleanField(required=False, default=True)
    indicator_values = serializers.JSONField()

    def validate_indicator_values(self, value):
        if not isinstance(value, dict) or not value:
            raise serializers.ValidationError("indicator_values must be a non-empty object keyed by indicator code.")

        for indicator_code, payload in value.items():
            if not isinstance(payload, dict):
                raise serializers.ValidationError(f"{indicator_code} must map to an object payload.")
            if not any(field in payload for field in ("signal", "change", "zscore", "value")):
                raise serializers.ValidationError(
                    f"{indicator_code} must include at least one of signal, change, zscore, or value."
                )
        return value
