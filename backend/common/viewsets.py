from rest_framework import status, viewsets
from rest_framework.response import Response


class ServiceModelViewSet(viewsets.ModelViewSet):
    service_class = None

    def get_queryset(self):
        return self.service_class.list()

    def perform_create(self, serializer):
        instance = self.service_class.create(serializer.validated_data)
        serializer.instance = instance

    def perform_update(self, serializer):
        instance = self.service_class.update(self.get_object(), serializer.validated_data)
        serializer.instance = instance

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.service_class.delete(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

