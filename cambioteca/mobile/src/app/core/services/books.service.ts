import api from './api.service';

// Lo que devuelve tu backend (MySQL): id_libro, titulo, autor, ...
export interface RawLibro {
  id_libro: number;
  titulo: string;
  autor: string;
  isbn?: string;
  anio_publicacion?: number;
  estado?: string;
  editorial?: string;
  genero?: string;
  tipo_tapa?: string;
  owner_nombre?: string;
}

// Modelo "amigable" para la app (id en vez de id_libro)
export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  genero?: string;
}

function mapLibro(r: RawLibro): Libro {
  return {
    id: r.id_libro,
    titulo: r.titulo,
    autor: r.autor,
    genero: r.genero,
  };
}

class BooksService {
  async list(query = ''): Promise<Libro[]> {
    const { data } = await api.get<RawLibro[]>('/api/libros/', { params: { query } });
    return data.map(mapLibro);
  }
}

export const booksService = new BooksService();
