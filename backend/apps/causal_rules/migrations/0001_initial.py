import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("drivers", "0001_initial"),
        ("indicators", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="CausalRule",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("condition_expression", models.TextField()),
                ("effect_expression", models.TextField()),
                ("confidence_score", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("is_active", models.BooleanField(default=True)),
                ("derived_driver", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="causal_rules", to="drivers.deriveddriver")),
                ("lead_indicator", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="causal_rules", to="indicators.indicator")),
            ],
            options={"ordering": ["name"]},
        ),
    ]

