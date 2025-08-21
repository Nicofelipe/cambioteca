from rest_framework import serializers
from .models import Libro

class LibroSerializer(serializers.ModelSerializer):
    owner_nombre = serializers.CharField(source='id_usuario.nombre_usuario', read_only=True)
    class Meta:
        model = Libro
        fields = [
            'id_libro','titulo','autor','isbn','anio_publicacion','estado',
            'editorial','genero','tipo_tapa','owner_nombre'
        ]
