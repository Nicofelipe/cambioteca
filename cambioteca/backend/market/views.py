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

def home(request):
    # Últimos agregados
    latest_books_qs = (
        Libro.objects.order_by("-id_libro")[:10]
        .prefetch_related(
            Prefetch("imagenlibro_set", queryset=ImagenLibro.objects.order_by("id_imagen"))
        )
    )

    # Populares (placeholder): usa tu métrica real cuando esté lista
    popular_books_qs = Libro.objects.order_by("-id_libro")[:8]

    context = {
        "latest_books": latest_books_qs,
        "popular_books": popular_books_qs,
    }
    return render(request, "home.html", context)