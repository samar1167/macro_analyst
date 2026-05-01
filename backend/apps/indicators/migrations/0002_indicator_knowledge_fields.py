from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("indicators", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="indicator",
            name="confidence_score",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=5),
        ),
        migrations.AddField(
            model_name="indicator",
            name="lag_months",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="indicator",
            name="lag_notes",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="indicator",
            name="rationale",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="indicator",
            name="weight",
            field=models.DecimalField(decimal_places=2, default=1, max_digits=6),
        ),
    ]

