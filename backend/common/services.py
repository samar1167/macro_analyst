class BaseModelService:
    queryset = None

    @classmethod
    def list(cls):
        return cls.queryset.all()

    @classmethod
    def retrieve(cls, instance):
        return instance

    @classmethod
    def create(cls, validated_data):
        model = cls.queryset.model
        many_to_many_data = cls._extract_many_to_many_data(model, validated_data)
        instance = cls.queryset.create(**validated_data)
        cls._set_many_to_many_fields(instance, many_to_many_data)
        return instance

    @classmethod
    def update(cls, instance, validated_data):
        many_to_many_data = cls._extract_many_to_many_data(instance.__class__, validated_data)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        cls._set_many_to_many_fields(instance, many_to_many_data)
        return instance

    @classmethod
    def delete(cls, instance):
        instance.delete()

    @staticmethod
    def _extract_many_to_many_data(model, validated_data):
        many_to_many_data = {}
        many_to_many_fields = {field.name for field in model._meta.many_to_many}
        for field_name in many_to_many_fields:
            if field_name in validated_data:
                many_to_many_data[field_name] = validated_data.pop(field_name)
        return many_to_many_data

    @staticmethod
    def _set_many_to_many_fields(instance, many_to_many_data):
        for field_name, value in many_to_many_data.items():
            getattr(instance, field_name).set(value)
