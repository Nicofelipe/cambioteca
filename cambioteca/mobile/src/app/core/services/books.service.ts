import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // <--- usa operadores
import ApiService from './api.service';

export interface RawLibro {
  id_libro: number;
  titulo: string;
  autor: string;
  genero?: string;
}
export interface Libro {
  id: number;
  titulo: string;
  autor: string;
  genero?: string;
}
const mapLibro = (r: RawLibro): Libro => ({
  id: r.id_libro,
  titulo: r.titulo,
  autor: r.autor,
  genero: r.genero,
});

@Injectable({ providedIn: 'root' })
export class BooksService {
  constructor(private api: ApiService) {}

  list(q = ''): Observable<Libro[]> {
    const options = q ? { params: { query: q } } : undefined;
    return this.api.get<RawLibro[]>('/api/libros/', options).pipe(
      map((arr: RawLibro[]) => arr.map(mapLibro))
    );
  }

  get(id: number): Observable<Libro> {
    return this.api.get<RawLibro>(`/api/libros/${id}/`).pipe(
      map((r: RawLibro) => mapLibro(r))
    );
  }
}
