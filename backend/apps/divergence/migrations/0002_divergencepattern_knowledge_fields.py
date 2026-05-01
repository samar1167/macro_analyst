from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("divergence", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="divergencepattern",
            name="confidence_score",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AddField(
            model_name="divergencepattern",
            name="lag_months",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="divergencepattern",
            name="lag_notes",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="divergencepattern",
            name="rationale",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="divergencepattern",
            name="weight",
            field=models.DecimalField(decimal_places=2, default=1, max_digits=6),
        ),
    ]

