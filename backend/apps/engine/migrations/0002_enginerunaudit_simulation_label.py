from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("engine", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="enginerunaudit",
            name="simulation_label",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
