import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Ensure a Django admin superuser exists from environment variables."

    def handle(self, *args, **options):
        username = os.getenv("DJANGO_SUPERUSER_USERNAME")
        email = os.getenv("DJANGO_SUPERUSER_EMAIL")
        password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

        if not username or not email or not password:
            self.stdout.write(
                "Skipping admin user creation because DJANGO_SUPERUSER_USERNAME, "
                "DJANGO_SUPERUSER_EMAIL, or DJANGO_SUPERUSER_PASSWORD is missing."
            )
            return

        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_staff": True,
                "is_superuser": True,
            },
        )

        updated = False
        if user.email != email:
            user.email = email
            updated = True
        if not user.is_staff:
            user.is_staff = True
            updated = True
        if not user.is_superuser:
            user.is_superuser = True
            updated = True
        if not user.check_password(password):
            user.set_password(password)
            updated = True

        if updated:
            user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Created admin user '{username}'."))
        elif updated:
            self.stdout.write(self.style.SUCCESS(f"Updated admin user '{username}'."))
        else:
            self.stdout.write(f"Admin user '{username}' already exists and is up to date.")
