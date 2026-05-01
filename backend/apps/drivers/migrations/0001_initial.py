from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("indicators", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="DerivedDriver",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("code", models.CharField(max_length=50, unique=True)),
                ("name", models.CharField(max_length=255)),
                ("description", models.TextField(blank=True)),
                ("methodology", models.TextField(blank=True)),
                ("formula_expression", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
                ("indicators", models.ManyToManyField(blank=True, related_name="derived_drivers", to="indicators.indicator")),
            ],
            options={"ordering": ["name"]},
        ),
    ]

