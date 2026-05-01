import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("divergence", "0002_divergencepattern_knowledge_fields"),
        ("engine", "0001_initial"),
        ("regimes", "0002_regime_knowledge_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="DivergenceEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("code", models.CharField(max_length=100, unique=True)),
                ("title", models.CharField(max_length=255)),
                ("summary", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("detected", "Detected"), ("reviewed", "Reviewed"), ("resolved", "Resolved")], default="detected", max_length=20)),
                ("divergence_score", models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ("expected_outcomes", models.JSONField(blank=True, default=dict)),
                ("observed_outcomes", models.JSONField(blank=True, default=dict)),
                ("deviation_snapshot", models.JSONField(blank=True, default=dict)),
                ("explanation_trace", models.JSONField(blank=True, default=dict)),
                ("engine_run_audit", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="divergence_events", to="engine.enginerunaudit")),
                ("primary_pattern", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="primary_divergence_events", to="divergence.divergencepattern")),
                ("regime", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="divergence_events", to="regimes.regime")),
            ],
            options={"ordering": ["-created_at"]},
        ),
        migrations.CreateModel(
            name="DivergenceEventExplanation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("rank", models.PositiveIntegerField()),
                ("match_score", models.DecimalField(decimal_places=2, default=0, max_digits=6)),
                ("explanation", models.TextField(blank=True)),
                ("payload", models.JSONField(blank=True, default=dict)),
                ("divergence_event", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="matched_explanations", to="divergence.divergenceevent")),
                ("pattern", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="event_explanations", to="divergence.divergencepattern")),
            ],
            options={"ordering": ["rank", "-match_score"], "unique_together": {("divergence_event", "pattern")}},
        ),
    ]
