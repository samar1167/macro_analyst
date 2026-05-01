from django.core.management.base import BaseCommand
from django.db import transaction

from apps.causal_rules.models import CausalRule
from apps.divergence.models import DivergencePattern
from apps.drivers.models import DerivedDriver
from apps.indicators.models import Indicator
from apps.regimes.models import Regime
from seed_data.generated_macro_knowledge import (
    CAUSAL_RULES,
    DERIVED_DRIVERS,
    DIVERGENCE_PATTERNS,
    INDICATORS,
    REGIMES,
)


class Command(BaseCommand):
    help = "Generate and seed a prototype macro knowledge base."

    @transaction.atomic
    def handle(self, *args, **options):
        indicator_map = self._seed_indicators()
        driver_map = self._seed_derived_drivers(indicator_map)
        self._seed_causal_rules(indicator_map, driver_map)
        self._seed_divergence_patterns(indicator_map)
        self._seed_regimes(indicator_map)
        self.stdout.write(self.style.SUCCESS("Prototype macro knowledge seeded successfully."))

    def _seed_indicators(self):
        indicators = {}
        for payload in INDICATORS:
            defaults = payload.copy()
            code = defaults.pop("code")
            indicator, _ = Indicator.objects.update_or_create(code=code, defaults=defaults)
            indicators[code] = indicator
        self.stdout.write(f"Seeded {len(indicators)} indicators.")
        return indicators

    def _seed_derived_drivers(self, indicator_map):
        drivers = {}
        for payload in DERIVED_DRIVERS:
            defaults = payload.copy()
            indicator_codes = defaults.pop("indicator_codes", [])
            code = defaults.pop("code")
            driver, _ = DerivedDriver.objects.update_or_create(code=code, defaults=defaults)
            driver.indicators.set([indicator_map[indicator_code] for indicator_code in indicator_codes])
            drivers[code] = driver
        self.stdout.write(f"Seeded {len(drivers)} derived drivers.")
        return drivers

    def _seed_causal_rules(self, indicator_map, driver_map):
        count = 0
        for payload in CAUSAL_RULES:
            defaults = payload.copy()
            code = defaults.pop("code")
            lead_indicator_code = defaults.pop("lead_indicator_code")
            derived_driver_code = defaults.pop("derived_driver_code", None)
            defaults["lead_indicator"] = indicator_map[lead_indicator_code]
            defaults["derived_driver"] = driver_map[derived_driver_code] if derived_driver_code else None
            CausalRule.objects.update_or_create(code=code, defaults=defaults)
            count += 1
        self.stdout.write(f"Seeded {count} causal rules.")

    def _seed_divergence_patterns(self, indicator_map):
        count = 0
        for payload in DIVERGENCE_PATTERNS:
            defaults = payload.copy()
            code = defaults.pop("code")
            indicator_code = defaults.pop("indicator_code")
            defaults["indicator"] = indicator_map[indicator_code]
            DivergencePattern.objects.update_or_create(code=code, defaults=defaults)
            count += 1
        self.stdout.write(f"Seeded {count} divergence patterns.")

    def _seed_regimes(self, indicator_map):
        count = 0
        for payload in REGIMES:
            defaults = payload.copy()
            code = defaults.pop("code")
            primary_indicator_code = defaults.pop("primary_indicator_code", None)
            defaults["primary_indicator"] = indicator_map[primary_indicator_code] if primary_indicator_code else None
            Regime.objects.update_or_create(code=code, defaults=defaults)
            count += 1
        self.stdout.write(f"Seeded {count} regimes.")

