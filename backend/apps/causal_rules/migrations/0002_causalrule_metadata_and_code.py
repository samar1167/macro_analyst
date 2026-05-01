from django.db import migrations, models


def populate_rule_codes(apps, schema_editor):
    CausalRule = apps.get_model("causal_rules", "CausalRule")
    for rule in CausalRule.objects.all().order_by("id"):
        if rule.code:
            continue
        rule.code = f"RULE_{rule.id}"
        rule.save(update_fields=["code"])


class Migration(migrations.Migration):
    dependencies = [
        ("causal_rules", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="causalrule",
            name="code",
            field=models.CharField(blank=True, max_length=50, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="causalrule",
            name="lag_months",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="causalrule",
            name="lag_notes",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="causalrule",
            name="rationale",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="causalrule",
            name="weight",
            field=models.DecimalField(decimal_places=2, default=1, max_digits=6),
        ),
        migrations.RunPython(populate_rule_codes, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="causalrule",
            name="code",
            field=models.CharField(max_length=50, unique=True),
        ),
    ]

