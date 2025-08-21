from django.db import models


class Clasificacion(models.Model):
    id_clasificacion = models.AutoField(primary_key=True)
    puntuacion = models.IntegerField()
    comentario = models.TextField()
    id_usuario_calificador = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario_calificador')
    id_usuario_calificado = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario_calificado', related_name='clasificaciones_recibidas')

    def __str__(self):
        return f'{self.id_usuario_calificador} -> {self.id_usuario_calificado}: {self.puntuacion}'


    class Meta:
        db_table = 'clasificacion'


class Favorito(models.Model):
    id_favorito = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario')
    id_libro = models.ForeignKey('Libro', models.CASCADE, db_column='id_libro')

    def __str__(self):
        return f'Favorito de {self.id_usuario} - Libro {self.id_libro}'

    class Meta:
        db_table = 'favorito'


class ImagenLibro(models.Model):
    id_imagen = models.AutoField(primary_key=True)
    url_imagen = models.ImageField(upload_to='libros/', blank=True, null=True)  # Modifica este campo
    descripcion = models.CharField(max_length=255, null=True, blank=True)
    id_libro = models.ForeignKey('Libro', models.CASCADE, db_column='id_libro')

    def __str__(self):
        return f'{self.descripcion} - {self.url_imagen}'

    class Meta:
        db_table = 'imagen_libro'


class Intercambio(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Aceptado', 'Aceptado'),
        ('Rechazado', 'Rechazado'),
        ('Completado', 'Completado'),
    ]
    
    id_intercambio = models.AutoField(primary_key=True)
    lugar_intercambio = models.CharField(max_length=255)
    fecha_intercambio = models.DateField()
    estado_intercambio = models.CharField(max_length=10, choices=ESTADO_CHOICES, default='Pendiente')
    fecha_completado = models.DateField(null=True, blank=True)
    id_usuario_solicitante = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario_solicitante')
    id_usuario_ofreciente = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario_ofreciente', related_name='intercambios_ofrecidos')
    id_libro_solicitado = models.ForeignKey('Libro', models.CASCADE, db_column='id_libro_solicitado')
    id_libro_ofrecido = models.ForeignKey('Libro', models.CASCADE, db_column='id_libro_ofrecido', related_name='libros_ofrecidos')

    def __str__(self):
        return f'{self.id_usuario_solicitante} <-> {self.id_usuario_ofreciente}'

    class Meta:
        db_table = 'intercambio'


class Libro(models.Model):
    id_libro = models.AutoField(primary_key=True)
    titulo = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13)
    anio_publicacion = models.PositiveSmallIntegerField()  # Ajuste del tipo
    autor = models.CharField(max_length=255)
    estado = models.CharField(max_length=20)
    fecha_compra = models.DateField()
    descripcion = models.TextField()
    editorial = models.CharField(max_length=255)
    genero = models.CharField(max_length=100)
    tipo_tapa = models.CharField(max_length=20)
    id_usuario = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario', null=False, blank=False)


    def __str__(self):
        return f'{self.titulo} - {self.autor}'

    class Meta:
        db_table = 'libro'


class Mensaje(models.Model):
    id_mensaje = models.AutoField(primary_key=True)
    mensaje = models.TextField()
    fecha_envio = models.DateTimeField()
    id_intercambio = models.ForeignKey(Intercambio, models.CASCADE, db_column='id_intercambio')
    id_usuario_emisor = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario_emisor')
    id_usuario_receptor = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario_receptor', related_name='mensajes_recibidos')

    def __str__(self):
        return f'De {self.id_usuario_emisor} a {self.id_usuario_receptor} - {self.fecha_envio}'

    class Meta:
        db_table = 'mensaje'


class Notificacion(models.Model):
    id_notificacion = models.AutoField(primary_key=True)
    mensaje = models.TextField()
    leido = models.BooleanField(default=False)
    fecha_envio = models.DateTimeField()  # Cambio de CharField a DateTimeField
    id_usuario = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario')

    def __str__(self):
        return f'Notificación para {self.id_usuario} - Leído: {self.leido}'

    class Meta:
        db_table = 'notificacion'


class SeguimientoActividad(models.Model):
    id_actividad = models.AutoField(primary_key=True)
    accion = models.CharField(max_length=255)
    fecha_hora = models.DateTimeField()
    ip_origen = models.CharField(max_length=45)
    dispositivo = models.CharField(max_length=50)
    ubicacion = models.CharField(max_length=255)  # Corregido de 'unicacion' a 'ubicacion'
    id_usuario = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario')

    def __str__(self):
        return f'{self.accion} por {self.id_usuario}'


    class Meta:
        db_table = 'seguimiento_actividad'


class Sesion(models.Model):
    id_sesion = models.AutoField(primary_key=True)
    token = models.CharField(max_length=255)
    fecha_inicio = models.DateTimeField()
    fecha_expiracion = models.DateTimeField()
    dispositivo = models.CharField(max_length=50)
    id_usuario = models.ForeignKey('Usuario', models.CASCADE, db_column='id_usuario')

    def __str__(self):
        return f'Sesión {self.id_usuario} - {self.fecha_inicio}'


    class Meta:
        db_table = 'sesion'

class Region(models.Model):
    id_region = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'region'


class Comuna(models.Model):
    id_comuna = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    id_region = models.ForeignKey(Region, on_delete=models.CASCADE, db_column='id_region')

    def __str__(self):
        return f'{self.nombre}, {self.id_region.nombre}'

    class Meta:
        db_table = 'comuna'



class Usuario(models.Model):
    id_usuario = models.AutoField(primary_key=True)
    rut = models.CharField(unique=True, max_length=12)
    nombres = models.CharField(max_length=150)
    apellido_paterno = models.CharField(max_length=100)
    apellido_materno = models.CharField(max_length=100)
    nombre_usuario = models.CharField(max_length=50)
    email = models.EmailField(unique=True, max_length=100)
    telefono = models.CharField(max_length=15)
    direccion = models.CharField(max_length=255) 
    numeracion = models.CharField(max_length=10, null=False)
    comuna = models.ForeignKey('Comuna', on_delete=models.CASCADE, null=False)
    contrasena = models.CharField(max_length=255)
    fecha_registro = models.DateField()
    calificacion = models.DecimalField(max_digits=2, decimal_places=1)
    numero_intercambios = models.IntegerField()
    imagen_perfil = models.ImageField(upload_to='media/perfil/', blank=True, null=True)  
    activo = models.BooleanField(default=False)
    verificado = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.nombres} {self.apellido_paterno} ({self.nombre_usuario})'

    class Meta:
        db_table = 'usuario'


class VerificacionUsuario(models.Model):
    id_verificacion = models.AutoField(primary_key=True)
    documento_identidad = models.CharField(unique=True, max_length=255)
    fecha_verificacion = models.DateField()
    verificado_por = models.CharField(max_length=50)
    id_usuario = models.ForeignKey(Usuario, models.CASCADE, db_column='id_usuario')

    def __str__(self):
        return f'Verificación {self.documento_identidad} por {self.verificado_por}'

    class Meta:
        db_table = 'verificacion_usuario'
