import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("divergence", "0001_initial"),
        ("drivers", "0001_initial"),
        ("regimes", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Opportunity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("new", "New"), ("review", "Review"), ("active", "Active"), ("closed", "Closed")], default="new", max_length=20)),
                ("conviction_score", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("detected_at", models.DateTimeField(blank=True, null=True)),
                ("divergence_pattern", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="opportunities", to="divergence.divergencepattern")),
                ("regime", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="opportunities", to="regimes.regime")),
                ("supporting_driver", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="opportunities", to="drivers.deriveddriver")),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]

