import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs'; // Importamos 'of' para manejar errores
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // No slash at the end

  constructor(private http: HttpClient, private authService: AuthService) { }

  getRegiones(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + 'catalog/regiones/');
  }

  getComunas(regionId: number | null): Observable<any[]> {
    let url = this.apiUrl + 'catalog/comunas/';
    if (regionId) {
      url += `?region=${regionId}`;
    }
    return this.http.get<any[]>(url);
  }

  registerUser(userData: FormData): Observable<any> {
    return this.http.post(this.apiUrl + 'auth/register/', userData);
  }

  getBooks(): Observable<any> {
  // Llama al endpoint principal que devuelve la lista paginada de todos los libros
  return this.http.get(`${this.apiUrl}/libros/`);
  }

  searchBooks(query: string): Observable<any> {
  // El backend espera el término en el parámetro 'query'
  return this.http.get(`${this.apiUrl}/libros/?query=${query}`);
  }

  getLatestBooks(): Observable<any> {
  // Llama al endpoint para los libros más recientes
  return this.http.get(`${this.apiUrl}/libros/latest/`);
  }

  getPopularBooks(): Observable<any> {
  // Llama al endpoint para los libros más populares
  return this.http.get(`${this.apiUrl}/libros/populares/`);
  }

  getBookById(id: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/libros/${id}/`);
  }

  getMyBooks(userId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/books/mine/?user_id=${userId}`);
  } 



  getUserSummary(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/summary/`);
  }
  
  getUserProfile(userId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/users/${userId}/profile/`);
  }

}