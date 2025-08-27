import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type PlainParams = Record<string, string | number | boolean | null | undefined>;

/** Opciones que acepta tu capa (sin 'observe' para no inducir otros overloads) */
interface JsonHttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | PlainParams;
  withCredentials?: boolean;
  reportProgress?: boolean;
  context?: HttpContext;
}

/** Opciones normalizadas que exige HttpClient para body+json */
type JsonOptionsRequired = {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams;
  withCredentials?: boolean;
  reportProgress?: boolean;
  context?: HttpContext;
  responseType: 'json';
  observe: 'body';
};

@Injectable({ providedIn: 'root' })
export default class ApiService {
  private readonly base = (environment.apiUrl || '').replace(/\/+$/, '');

  constructor(private http: HttpClient) {}

  private buildUrl(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return this.base + p;
  }

  /** Convierte params planos a HttpParams y fija los literales json/body */
  private normalizeOptions(options?: JsonHttpOptions): JsonOptionsRequired {
    let params: HttpParams | undefined;

    if (options?.params instanceof HttpParams) {
      params = options.params;
    } else if (options?.params) {
      const fromObject: Record<string, string> = {};
      Object.entries(options.params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fromObject[k] = String(v);
      });
      params = new HttpParams({ fromObject });
    }

    const { headers, withCredentials, reportProgress, context } = options ?? {};
    return {
      headers,
      params,
      withCredentials,
      reportProgress,
      context,
      responseType: 'json' as const,
      observe: 'body' as const,
    };
  }

  get<T>(path: string, options?: JsonHttpOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), this.normalizeOptions(options));
  }

  post<T>(path: string, body: any, options?: JsonHttpOptions): Observable<T> {
    return this.http.post<T>(
      this.buildUrl(path),
      body,
      this.normalizeOptions(options),
    );
  }

  put<T>(path: string, body: any, options?: JsonHttpOptions): Observable<T> {
    return this.http.put<T>(
      this.buildUrl(path),
      body,
      this.normalizeOptions(options),
    );
  }

  delete<T>(path: string, options?: JsonHttpOptions): Observable<T> {
    return this.http.delete<T>(
      this.buildUrl(path),
      this.normalizeOptions(options),
    );
  }
}
