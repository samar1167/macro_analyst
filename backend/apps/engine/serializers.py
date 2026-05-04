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
    simulation_label = serializers.CharField(required=False, allow_blank=True, default="")
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    persist_opportunities = serializers.BooleanField(required=False, default=True)
    indicator_values = serializers.JSONField()
    event_scenario = serializers.JSONField(required=False)

    def to_internal_value(self, data):
        if isinstance(data, dict) and "indicator_values" not in data:
            known_fields = {"run_type", "triggered_by", "simulation_label", "notes", "persist_opportunities", "event_scenario"}
            indicator_values = {
                key: value for key, value in data.items() if key not in known_fields
            }
            metadata = {
                key: value for key, value in data.items() if key in known_fields
            }
            if indicator_values:
                data = {
                    **metadata,
                    "indicator_values": indicator_values,
                }

        internal = super().to_internal_value(data)
        if not internal.get("simulation_label") and internal.get("triggered_by") not in {"", "api"}:
            internal["simulation_label"] = internal["triggered_by"]
        return internal

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

    def validate_event_scenario(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("event_scenario must be an object.")

        scenario_key = value.get("scenario_key")
        severity = value.get("severity", "base")
        horizon = value.get("horizon", "3m")

        if scenario_key is not None and not isinstance(scenario_key, str):
            raise serializers.ValidationError("event_scenario.scenario_key must be a string.")
        if severity not in {"mild", "base", "severe"}:
            raise serializers.ValidationError("event_scenario.severity must be one of mild, base, or severe.")
        if horizon not in {"immediate", "3m", "12m"}:
            raise serializers.ValidationError("event_scenario.horizon must be one of immediate, 3m, or 12m.")
        return value
