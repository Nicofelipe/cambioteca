from django.db import models

# Referencias entre apps por string:
# 'core.Usuario', 'market.Libro'

class Libro(models.Model):
    id_libro = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13)
    anio_publicacion = models.PositiveSmallIntegerField()
    autor = models.CharField(max_length=255)
    estado = models.CharField(max_length=20)
    fecha_compra = models.DateField()
    descripcion = models.TextField()
    editorial = models.CharField(max_length=255)
    genero = models.CharField(max_length=100)
    tipo_tapa = models.CharField(max_length=20)
    id_usuario = models.ForeignKey('core.Usuario', db_column='id_usuario', on_delete=models.DO_NOTHING)
    class Meta:
        db_table = 'libro'
        managed = False

class Clasificacion(models.Model):
    id_clasificacion = models.AutoField(primary_key=True)
    puntuacion = models.IntegerField()
    comentario = models.TextField()
    id_usuario_calificador = models.ForeignKey('core.Usuario', db_column='id_usuario_calificador', on_delete=models.DO_NOTHING)
    id_usuario_calificado = models.ForeignKey('core.Usuario', db_column='id_usuario_calificado', on_delete=models.DO_NOTHING, related_name='clasificaciones_recibidas')
    class Meta:
        db_table = 'clasificacion'
        managed = False

class Favorito(models.Model):
    id_favorito = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('core.Usuario', db_column='id_usuario', on_delete=models.DO_NOTHING)
    id_libro = models.ForeignKey('market.Libro', db_column='id_libro', on_delete=models.DO_NOTHING)
    class Meta:
        db_table = 'favorito'
        managed = False

class ImagenLibro(models.Model):
    id_imagen = models.AutoField(primary_key=True)
    url_imagen = models.CharField(max_length=100, null=True, blank=True)  # <- antes ImageField
    descripcion = models.CharField(max_length=255, null=True, blank=True)
    id_libro = models.ForeignKey('market.Libro', db_column='id_libro', on_delete=models.DO_NOTHING)
    class Meta:
        db_table = 'imagen_libro'
        managed = False

class Intercambio(models.Model):
    ESTADO_CHOICES = [('Pendiente','Pendiente'), ('Aceptado','Aceptado'), ('Rechazado','Rechazado'), ('Completado','Completado')]
    id_intercambio = models.AutoField(primary_key=True)
    lugar_intercambio = models.CharField(max_length=255)
    fecha_intercambio = models.DateField(null=True, blank=True)  # en dump puede venir NULL
    estado_intercambio = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='Pendiente')
    fecha_completado = models.DateField(null=True, blank=True)
    id_usuario_solicitante = models.ForeignKey('core.Usuario', db_column='id_usuario_solicitante', on_delete=models.DO_NOTHING)
    id_usuario_ofreciente = models.ForeignKey('core.Usuario', db_column='id_usuario_ofreciente', on_delete=models.DO_NOTHING, related_name='intercambios_ofrecidos')
    id_libro_solicitado = models.ForeignKey('market.Libro', db_column='id_libro_solicitado', on_delete=models.DO_NOTHING)
    id_libro_ofrecido = models.ForeignKey('market.Libro', db_column='id_libro_ofrecido', on_delete=models.DO_NOTHING, related_name='libros_ofrecidos')
    class Meta:
        db_table = 'intercambio'
        managed = False

class Mensaje(models.Model):
    id_mensaje = models.AutoField(primary_key=True)
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField()
    id_intercambio = models.ForeignKey('market.Intercambio', db_column='id_intercambio', on_delete=models.DO_NOTHING)
    id_usuario_emisor = models.ForeignKey('core.Usuario', db_column='id_usuario_emisor', on_delete=models.DO_NOTHING)
    id_usuario_receptor = models.ForeignKey('core.Usuario', db_column='id_usuario_receptor', on_delete=models.DO_NOTHING, related_name='mensajes_recibidos')
    class Meta:
        db_table = 'mensaje'
        managed = False

class Notificacion(models.Model):
    id_notificacion = models.AutoField(primary_key=True)
    mensaje = models.TextField()
    leido = models.BooleanField(default=False)
    fecha_envio = models.DateTimeField(null=True, blank=True)  # dump: timestamp NULL
    id_usuario = models.ForeignKey('core.Usuario', db_column='id_usuario', on_delete=models.DO_NOTHING)
    class Meta:
        db_table = 'notificacion'
        managed = False

class SeguimientoActividad(models.Model):
    id_actividad = models.AutoField(primary_key=True)
    accion = models.CharField(max_length=255)
    fecha_hora = models.DateTimeField()
    ip_origen = models.CharField(max_length=45)
    dispositivo = models.CharField(max_length=50)
    ubicacion = models.CharField(max_length=255, null=True, blank=True)
    id_usuario = models.ForeignKey('core.Usuario', db_column='id_usuario', on_delete=models.DO_NOTHING)
    class Meta:
        db_table = 'seguimiento_actividad'
        managed = False

class Sesion(models.Model):
    id_sesion = models.AutoField(primary_key=True)
    token = models.CharField(max_length=255)
    fecha_inicio = models.DateTimeField()
    fecha_expiracion = models.DateTimeField()
    dispositivo = models.CharField(max_length=50)
    id_usuario = models.ForeignKey('core.Usuario', db_column='id_usuario', on_delete=models.DO_NOTHING)
    class Meta:
        db_table = 'sesion'
        managed = False

class VerificacionUsuario(models.Model):
    id_verificacion = models.AutoField(primary_key=True)
    documento_identidad = models.CharField(unique=True, max_length=255)
    fecha_verificacion = models.DateField()
    verificado_por = models.CharField(max_length=50)
    id_usuario = models.ForeignKey('core.Usuario', db_column='id_usuario', on_delete=models.DO_NOTHING)
    class Meta:
        db_table = 'verificacion_usuario'
        managed = False
