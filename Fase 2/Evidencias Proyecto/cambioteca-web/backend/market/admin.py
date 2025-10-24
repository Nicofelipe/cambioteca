# market/admin.py
from django.contrib import admin
from .models import Libro, ImagenLibro, Intercambio, Mensaje, Favorito, Clasificacion, Conversacion, ConversacionParticipante, ConversacionMensaje, LibroSolicitudesVistas

# ---- Inlines ----
class ImagenLibroInline(admin.TabularInline):
    model = ImagenLibro
    fk_name = "id_libro"
    extra = 0
    fields = ("url_imagen", "descripcion", "orden", "is_portada")
    show_change_link = True


class MensajeInline(admin.TabularInline):
    model = Mensaje
    fk_name = "id_intercambio"
    extra = 0
    fields = ("mensaje", "fecha_envio", "id_usuario_emisor", "id_usuario_receptor")
    raw_id_fields = ("id_usuario_emisor", "id_usuario_receptor")
    ordering = ("-fecha_envio",)


@admin.register(Libro)
class LibroAdmin(admin.ModelAdmin):
    list_display = (
        "id_libro", "titulo", "autor", "genero_nombre", "estado",
        "id_usuario", "disponible", "fecha_subida",
    )
    search_fields = (
        "titulo", "autor", "isbn", "editorial",
        # si hay FK a Genero:
        "id_genero__nombre",
    )
    list_filter = (
        "estado", "tipo_tapa", "editorial", "anio_publicacion", "disponible",
        # si hay FK a Genero:
        "id_genero",
    )
    date_hierarchy = "fecha_subida"
    ordering = ("-fecha_subida", "-id_libro")
    list_per_page = 50
    raw_id_fields = ("id_usuario",)
    list_select_related = ("id_usuario",)
    inlines = [ImagenLibroInline]

    @admin.display(description="Género")
    def genero_nombre(self, obj):
        """
        Soporta ambos esquemas:
        - Nuevo: obj.id_genero (FK) -> obj.id_genero.nombre
        - Viejo: obj.genero (CharField)
        """
        # Nuevo esquema (FK)
        if hasattr(obj, "id_genero") and getattr(obj, "id_genero", None):
            try:
                return getattr(obj.id_genero, "nombre", None)
            except Exception:
                pass
        # Esquema anterior (CharField)
        if hasattr(obj, "genero"):
            return getattr(obj, "genero", None)
        return None


@admin.register(ImagenLibro)
class ImagenLibroAdmin(admin.ModelAdmin):
    list_display = (
        "id_imagen", "id_libro", "orden", "is_portada",
        "descripcion", "url_imagen", "created_at",
    )
    list_filter = ("is_portada",)
    search_fields = ("descripcion", "url_imagen", "id_libro__titulo")
    raw_id_fields = ("id_libro",)
    ordering = ("-created_at", "-id_imagen")


@admin.register(Intercambio)
class IntercambioAdmin(admin.ModelAdmin):
    list_display = (
        "id_intercambio", "id_usuario_solicitante", "id_usuario_ofreciente",
        "id_libro_solicitado", "id_libro_ofrecido",
        "estado_intercambio", "lugar_intercambio", "fecha_intercambio", "fecha_completado",
    )
    list_filter = ("estado_intercambio", "fecha_intercambio")
    search_fields = (
        "id_usuario_solicitante__nombre_usuario",
        "id_usuario_ofreciente__nombre_usuario",
        "id_libro_solicitado__titulo",
        "id_libro_ofrecido__titulo",
        "lugar_intercambio",
    )
    date_hierarchy = "fecha_intercambio"
    ordering = ("-fecha_intercambio", "estado_intercambio")
    list_per_page = 50
    raw_id_fields = (
        "id_usuario_solicitante", "id_usuario_ofreciente",
        "id_libro_solicitado", "id_libro_ofrecido",
    )
    list_select_related = (
        "id_usuario_solicitante", "id_usuario_ofreciente",
        "id_libro_solicitado", "id_libro_ofrecido",
    )
    inlines = [MensajeInline]


@admin.register(Mensaje)
class MensajeAdmin(admin.ModelAdmin):
    list_display = ("id_mensaje", "id_intercambio", "id_usuario_emisor", "id_usuario_receptor", "fecha_envio")
    search_fields = ("mensaje", "id_usuario_emisor__nombre_usuario", "id_usuario_receptor__nombre_usuario")
    date_hierarchy = "fecha_envio"
    ordering = ("-fecha_envio",)
    raw_id_fields = ("id_intercambio", "id_usuario_emisor", "id_usuario_receptor")
    list_select_related = ("id_intercambio", "id_usuario_emisor", "id_usuario_receptor")


@admin.register(Favorito)
class FavoritoAdmin(admin.ModelAdmin):
    list_display = ("id_favorito", "id_usuario", "id_libro")
    search_fields = ("id_usuario__nombre_usuario", "id_libro__titulo")
    raw_id_fields = ("id_usuario", "id_libro")
    list_select_related = ("id_usuario", "id_libro")


@admin.register(Clasificacion)
class ClasificacionAdmin(admin.ModelAdmin):
    list_display = ("id_clasificacion", "id_usuario_calificador", "id_usuario_calificado", "puntuacion")
    list_filter = ("puntuacion",)
    search_fields = (
        "id_usuario_calificador__nombre_usuario",
        "id_usuario_calificado__nombre_usuario",
        "comentario",
    )
    raw_id_fields = ("id_usuario_calificador", "id_usuario_calificado")
    list_select_related = ("id_usuario_calificador", "id_usuario_calificado")

@admin.register(Conversacion)
class ConversacionAdmin(admin.ModelAdmin):
    list_display = ("id_conversacion", "id_intercambio", "creado_en", "actualizado_en")

@admin.register(ConversacionParticipante)
class ConversacionParticipanteAdmin(admin.ModelAdmin):
    list_display = ("id_conversacion", "id_usuario", "rol", "silenciado", "archivado", "ultimo_visto_id_mensaje", "visto_en")
    list_filter = ("silenciado", "archivado")

@admin.register(ConversacionMensaje)
class ConversacionMensajeAdmin(admin.ModelAdmin):
    list_display = ("id_mensaje", "id_conversacion", "id_usuario_emisor", "enviado_en", "eliminado")
    list_filter = ("eliminado",)

@admin.register(LibroSolicitudesVistas)
class LibroSolicitudesVistasAdmin(admin.ModelAdmin):
    list_display = ("id", "id_usuario", "id_libro", "ultimo_visto_id_intercambio", "visto_por_ultima_vez")
