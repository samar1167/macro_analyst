from rest_framework import serializers

from .models import DivergenceEvent, DivergenceEventExplanation, DivergencePattern


class DivergencePatternSerializer(serializers.ModelSerializer):
    class Meta:
        model = DivergencePattern
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class DivergenceEventExplanationSerializer(serializers.ModelSerializer):
    pattern_code = serializers.CharField(source="pattern.code", read_only=True)
    pattern_name = serializers.CharField(source="pattern.name", read_only=True)

    class Meta:
        model = DivergenceEventExplanation
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class DivergenceEventSerializer(serializers.ModelSerializer):
    matched_explanations = DivergenceEventExplanationSerializer(many=True, read_only=True)
    primary_pattern_code = serializers.CharField(source="primary_pattern.code", read_only=True)

    class Meta:
        model = DivergenceEvent
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class AnalyzeDivergenceSerializer(serializers.Serializer):
    engine_run_audit_id = serializers.IntegerField(required=False)
    expected_outcomes = serializers.JSONField(required=False, default=dict)
    observed_outcomes = serializers.JSONField()
    persist = serializers.BooleanField(required=False, default=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")

    def validate(self, attrs):
        if not attrs.get("engine_run_audit_id") and not attrs.get("expected_outcomes"):
            raise serializers.ValidationError(
                "Provide either engine_run_audit_id or expected_outcomes for comparison."
            )

        observed = attrs.get("observed_outcomes") or {}
        if not isinstance(observed, dict):
            raise serializers.ValidationError("observed_outcomes must be an object.")
        return attrs
