from django.db import models

class Region(models.Model):
    id_region = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    class Meta:
        db_table = 'region'
        managed = False

class Comuna(models.Model):
    id_comuna = models.AutoField(primary_key=True)
    nombre = models.CharField(max_length=100)
    id_region = models.ForeignKey(Region, db_column='id_region', on_delete=models.DO_NOTHING)
    class Meta:
        db_table = 'comuna'
        managed = False

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
    numeracion = models.CharField(max_length=10)
    comuna = models.ForeignKey(Comuna, db_column='comuna_id', on_delete=models.DO_NOTHING)
    contrasena = models.CharField(max_length=255)
    fecha_registro = models.DateField()
    calificacion = models.DecimalField(max_digits=3, decimal_places=1, default=0)
    numero_intercambios = models.IntegerField(default=0)
    imagen_perfil = models.CharField(max_length=100, null=True, blank=True)  # <- antes ImageField
    activo = models.BooleanField(default=False)
    verificado = models.BooleanField(default=False)
    class Meta:
        db_table = 'usuario'
        managed = False
