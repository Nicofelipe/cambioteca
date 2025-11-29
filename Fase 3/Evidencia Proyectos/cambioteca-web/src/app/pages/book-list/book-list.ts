import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth';
import { debounceTime, distinctUntilChanged, Subject, Observable } from 'rxjs';
import { NotificationComponent } from '../../components/notification/notification';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationComponent],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
})
export class BookListComponent implements OnInit {

  // Datos principales
  books: any[] = [];
  isLoading = true;
  searchTerm = '';
  
  // Filtros
  genres: any[] = [];
  selectedGenreId: number | null = null;

  // Estados de usuario y favoritos
  currentUser: any = null;
  favoriteBookIds = new Set<number>();
  isTogglingFavorite: Record<number, boolean> = {};
  
  // UI Helpers
  isSubmitting = false;
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  // RxJS Subjects para búsqueda reactiva
  private searchSubject = new Subject<string>();
  private filterSubject = new Subject<void>();

  // Base URL para imágenes (Railway)
  private readonly MEDIA_BASE = (environment.mediaBase || '').replace(/\/+$/, '');

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    this.loadInitialFavorites();
    this.loadGenres(); 

    // Leer parámetros de la URL al iniciar
    this.route.queryParamMap.subscribe((params: any) => {
      this.searchTerm = params.get('q') || '';
      const g = params.get('genero');
      this.selectedGenreId = g ? Number(g) : null;
      this.loadBooks();
    });

    // Configurar el debounce para la búsqueda (espera 400ms)
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => this.loadBooks());

    // Configurar cambio de filtro (inmediato)
    this.filterSubject.subscribe(() => this.loadBooks());
  }

  // --- CARGA DE DATOS ---

  loadGenres(): void {
    this.apiService.getGeneros().subscribe({
      next: (data) => this.genres = data,
      error: (err) => console.error('Error cargando géneros', err)
    });
  }

  loadInitialFavorites(): void {
    if (this.currentUser) {
      this.apiService.getMyFavoriteIds(this.currentUser.id).subscribe({
        next: (data: any) => { this.favoriteBookIds = new Set(data.favorite_ids || []); },
        error: (err: any) => { console.error('Error al cargar favoritos:', err); }
      });
    } else {
      this.favoriteBookIds = new Set<number>();
    }
  }

  loadBooks(): void {
    this.isLoading = true;

    // Actualizar la URL sin recargar
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchTerm || null, genero: this.selectedGenreId || null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    let apiCall: Observable<any>;
    
    // Si hay texto, buscamos. Si no, traemos todos.
    if (this.searchTerm.trim()) {
      apiCall = this.apiService.searchBooks(this.searchTerm.trim());
    } else {
      apiCall = this.apiService.getBooks();
    }

    apiCall.subscribe({
      next: (data: any) => {
        // Ajuste: data puede ser un array directo o un objeto paginado { results: [...] }
        let arr = Array.isArray(data) ? data : (data?.results || []);
        
        // === FILTRADO EN FRONTEND (Solo Disponibles + Género) ===
        
        // 1. Solo libros disponibles
        arr = arr.filter((b: any) => b.disponible === true);

        // 2. Filtro por Género (si está seleccionado)
        if (this.selectedGenreId) {
          arr = arr.filter((b: any) => b.id_genero === this.selectedGenreId);
        }
        
        // =======================================================

        // Marcar flag para fallback de imagen
        this.books = arr.map((b: any) => ({ ...b, _fallback: false }));
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar libros:', err);
        this.books = [];
        this.isLoading = false;
      }
    });
  }

  // --- EVENTOS DE UI ---

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFilterChange(): void {
    this.filterSubject.next();
  }

  // --- MANEJO DE IMÁGENES (RAILWAY) ---

  imgSrc(book: any): string {
    if (!book || book._fallback) return this.remoteFallback();
    const raw = String(book.first_image ?? '').trim();
    if (!raw) return this.remoteFallback();
    return this.toRailwayAbsolute(raw);
  }

  onImgError(ev: Event, book: any): void {
    const img = ev.target as HTMLImageElement;
    if (book._fallback) return; // Evita bucle infinito
    book._fallback = true;
    img.src = this.remoteFallback();
  }

  private remoteFallback(): string {
    return this.fromMediaBase('books/librodefecto.png');
  }

  private toRailwayAbsolute(raw: string): string {
    const s = raw.trim();
    // Si ya es absoluta (http...), devolver
    if (/^https?:\/\//i.test(s)) return this.upgradeSchemeIfNeeded(s);
    
    // Limpiar prefijos comunes de Django
    const m = s.match(/\/?media\/(.+)$/i);
    if (m && m[1]) return this.fromMediaBase(m[1]);
    
    if (s.startsWith('books/')) return this.fromMediaBase(s);
    
    return this.fromMediaBase(s);
  }

  private fromMediaBase(rel: string): string {
    // Une la URL base de Railway con la ruta relativa
    return `${this.MEDIA_BASE}/${rel.replace(/^\/+/, '')}`;
  }

  private upgradeSchemeIfNeeded(url: string): string {
    // Si estamos en https y la imagen viene en http, forzar https
    try {
      if (location.protocol === 'https:' && url.startsWith('http://')) {
        const u = new URL(url);
        return `https://${u.host}${u.pathname}${u.search}${u.hash}`;
      }
    } catch {}
    return url;
  }

  // --- LÓGICA DE FAVORITOS ---

  isFavorite(bookId: number): boolean {
    return this.favoriteBookIds.has(bookId);
  }

  toggleFavorite(event: Event, book: any): void {
    event.stopPropagation();
    event.preventDefault();

    if (!this.currentUser) {
      this.showNotification('Debes iniciar sesión para agregar favoritos.', 'error');
      return;
    }
    if (!book || this.isTogglingFavorite[book.id]) return;

    const bookId = book.id;
    this.isTogglingFavorite[bookId] = true;

    this.apiService.toggleFavorite(this.currentUser.id, bookId).subscribe({
      next: (response: any) => {
        if (response.favorited) {
          this.favoriteBookIds.add(bookId);
          this.showNotification('¡Añadido a favoritos!', 'success');
        } else {
          this.favoriteBookIds.delete(bookId);
          this.showNotification('Eliminado de favoritos.', 'success'); // Mensaje opcional
        }
        this.isTogglingFavorite[bookId] = false;
      },
      error: (err: any) => {
        console.error('Error al actualizar favorito:', err);
        this.showNotification(err.error?.detail || 'No se pudo actualizar.', 'error');
        this.isTogglingFavorite[bookId] = false;
      }
    });
  }

  // --- ACCIONES DE ADMIN ---

  adminDeleteBook(bookId: number, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!confirm('¿Seguro que quieres eliminar este libro? Esta acción es permanente.')) {
      return;
    }
    const book = this.books.find(b => b.id === bookId);
    if (book) book.isDeleting = true;

    this.apiService.deleteBook(bookId).subscribe({
      next: () => {
        this.books = this.books.filter(b => b.id !== bookId);
        this.showNotification('Libro eliminado por administrador.', 'success');
      },
      error: (err: any) => {
        this.showNotification(err.error?.detail || 'No se pudo eliminar el libro.', 'error');
        if (book) book.isDeleting = false;
      }
    });
  }

  // --- NOTIFICACIONES ---

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => this.clearNotification(), 3000);
  }

  clearNotification(): void {
    this.notificationMessage = null;
  }

  // --- UTILS ---

  trackById(_i: number, b: any): number {
    return b?.id ?? _i;
  }
}