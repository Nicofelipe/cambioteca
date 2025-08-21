from django.shortcuts import render

from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import Libro
from .serializers import LibroSerializer

class LibroViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LibroSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        qs = Libro.objects.all().order_by('-id_libro')
        q = self.request.query_params.get('query')
        if q:
            qs = qs.filter(Q(titulo__icontains=q) | Q(autor__icontains=q) | Q(genero__icontains=q))
        return qs
