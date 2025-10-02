// src/app/core/services/api.service.ts
import {
  HttpClient, HttpContext, HttpHeaders, HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type PlainParams = Record<string, string | number | boolean | null | undefined>;

interface JsonHttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: HttpParams | PlainParams;
  withCredentials?: boolean;
  reportProgress?: boolean;
  context?: HttpContext;
}

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

  /** Convierte headers (si vienen como Record) a HttpHeaders */
  private asHttpHeaders(h?: HttpHeaders | Record<string, string | string[]>): HttpHeaders | undefined {
    if (!h) return undefined;
    return h instanceof HttpHeaders ? h : new HttpHeaders(h);
  }

  /** Si el body es FormData, elimina Content-Type (el browser pondrá boundary correcto) */
  private optionsForBody(body: any, options?: JsonHttpOptions): JsonOptionsRequired {
    const base = this.normalizeOptions(options);
    if (body instanceof FormData) {
      const current = this.asHttpHeaders(base.headers);
      const headers = current ? current.delete('Content-Type') : undefined;
      return { ...base, headers };
    }
    return base;
  }

  get<T>(path: string, options?: JsonHttpOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), this.normalizeOptions(options));
  }

  patch<T>(path: string, body: any, options?: JsonHttpOptions): Observable<T> {
    const opts = this.optionsForBody(body, options);
    return this.http.patch<T>(this.buildUrl(path), body, opts);
  }

  post<T>(path: string, body: any, options?: JsonHttpOptions): Observable<T> {
    const opts = this.optionsForBody(body, options);
    return this.http.post<T>(this.buildUrl(path), body, opts);
  }

  put<T>(path: string, body: any, options?: JsonHttpOptions): Observable<T> {
    const opts = this.optionsForBody(body, options);
    return this.http.put<T>(this.buildUrl(path), body, opts);
  }

  delete<T>(path: string, options?: JsonHttpOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(path), this.normalizeOptions(options));
  }
}
