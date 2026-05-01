import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("indicators", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="DivergencePattern",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("code", models.CharField(max_length=50, unique=True)),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("detection_expression", models.TextField()),
                ("severity_level", models.CharField(choices=[("low", "Low"), ("medium", "Medium"), ("high", "High")], default="medium", max_length=20)),
                ("is_active", models.BooleanField(default=True)),
                ("indicator", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="divergence_patterns", to="indicators.indicator")),
            ],
            options={"ordering": ["name"]},
        ),
    ]

