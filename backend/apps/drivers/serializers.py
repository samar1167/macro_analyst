from rest_framework import serializers

from .models import DerivedDriver


class DerivedDriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = DerivedDriver
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

