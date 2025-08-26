import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type GetOptions = {
  params?: HttpParams | { [param: string]: string | number | boolean };
  headers?: HttpHeaders | { [header: string]: string | string[] };
};

@Injectable({ providedIn: 'root' })
export default class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  get<T>(path: string, options?: GetOptions): Observable<T> {
    return this.http.get<T>(this.base + path, options);
  }
  post<T>(path: string, body: any, options?: GetOptions): Observable<T> {
    return this.http.post<T>(this.base + path, body, options);
  }
  put<T>(path: string, body: any, options?: GetOptions): Observable<T> {
    return this.http.put<T>(this.base + path, body, options);
  }
  delete<T>(path: string, options?: GetOptions): Observable<T> {
    return this.http.delete<T>(this.base + path, options);
  }
}
