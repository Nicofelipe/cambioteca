from django.db import models
from core.models import Usuario

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
    id_usuario = models.ForeignKey(Usuario, db_column='id_usuario', on_delete=models.DO_NOTHING)

    class Meta:
        db_table = 'libro'
        managed = False
