import django.db.models.deletion
from django.db import migrations, models


def populate_opportunity_codes(apps, schema_editor):
    Opportunity = apps.get_model("opportunities", "Opportunity")
    for opportunity in Opportunity.objects.all().order_by("id"):
        if opportunity.code:
            continue
        opportunity.code = f"OPP_{opportunity.id}"
        opportunity.save(update_fields=["code"])


class Migration(migrations.Migration):
    dependencies = [
        ("engine", "0001_initial"),
        ("opportunities", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="opportunity",
            name="code",
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="opportunity",
            name="direction",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="opportunity",
            name="engine_run_audit",
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="generated_opportunities", to="engine.enginerunaudit"),
        ),
        migrations.AddField(
            model_name="opportunity",
            name="explanation_trace",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="opportunity",
            name="score_components",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.RunPython(populate_opportunity_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="opportunity",
            name="code",
            field=models.CharField(max_length=100, unique=True),
        ),
    ]

