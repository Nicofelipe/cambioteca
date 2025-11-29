import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth';
import { ProposeExchangeModalComponent } from '../../components/propose-exchange-modal/propose-exchange-modal';
import { NotificationComponent } from '../../components/notification/notification'; // 👈 1. IMPORTAR NOTIFICACIÓN
import { forkJoin, Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  // 👇 2. AGREGAR NotificationComponent AQUÍ
  imports: [CommonModule, RouterLink, FormsModule, ProposeExchangeModalComponent, NotificationComponent], 
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.css']
})
export class BookDetailComponent implements OnInit, OnDestroy {
  
  // ... (tus variables existentes: book, isLoading, etc.) ...
  book: any = null; 
  isLoading = true;
  error: string | null = null;
  currentUser: any = null; 
  
  showProposalModal = false;
  proposalSuccessMessage: string | null = null;
  proposalErrorMessage: string | null = null;

  showReportModal = false;
  reportData = { motivo: '', descripcion: '' };
  isSubmittingReport = false;
  reportError: string | null = null;

  favoriteBookIds = new Set<number>();
  isTogglingFavorite = false; 
  private authSubscription!: Subscription;

  // 👇 3. VARIABLES NUEVAS PARA LA NOTIFICACIÓN
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  private mainImagePath: string | null = null;
  private readonly MEDIA_BASE = (environment.mediaBase || '').replace(/\/+$/, '');
  private mainImageFallbackTriggered = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router 
  ) {}

  ngOnInit(): void {
     // ... (tu código ngOnInit igual) ...
     this.authSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user && user.id) {
        this.loadInitialFavorites(user.id);
      } else {
        this.favoriteBookIds.clear();
      }
    });

    const bookId = this.route.snapshot.paramMap.get('id');
    if (bookId) {
      this.loadBookDetails(+bookId); 
    } else {
      this.error = 'No se especificó un libro.'; this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // ... (loadBookDetails, loadInitialFavorites, toggleFavorite, isFavorite, openProposalModal... igual) ...
  // Solo pondré aquí loadBookDetails resumido para no llenar espacio, déjalo como lo tienes.
  loadBookDetails(bookId: number): void {
    // ... tu código actual ...
     this.isLoading = true;
      this.mainImageFallbackTriggered = false;
      
      forkJoin({
        bookData: this.apiService.getBookById(bookId),
        imagesData: this.apiService.getBookImages(bookId)
      }).subscribe({
        next: ({ bookData, imagesData }) => { 
          this.book = bookData; 
          if (imagesData && imagesData.length > 0) {
            let mainImage = imagesData.find(img => img.is_portada);
            if (!mainImage) mainImage = imagesData[0]; 
            this.mainImagePath = mainImage.url_imagen; 
          }
          this.isLoading = false; 
        },
        error: (err) => { 
          this.error = 'No se pudo cargar la información.'; 
          this.isLoading = false; 
        }
      });
  }

  // Lógica Favoritos y Modal Propuesta (déjalas igual) ...
  loadInitialFavorites(userId: number): void {
    if (userId) {
      this.apiService.getMyFavoriteIds(userId).subscribe({
        next: (data) => { this.favoriteBookIds = new Set(data.favorite_ids || []); },
        error: (err) => { console.error("Error al cargar favoritos:", err); }
      });
    } else {
      this.favoriteBookIds = new Set<number>();
    }
  }

  toggleFavorite(): void {
    if (!this.currentUser || !this.book) { this.router.navigate(['/login']); return; }
    const userId = this.currentUser.id; 
    const bookId = this.book.id;
    const isCurrentlyFavorite = this.isFavorite(bookId);
    const request$ = isCurrentlyFavorite 
        ? this.apiService.removeFavorite(userId, bookId) 
        : this.apiService.addFavorite(userId, bookId);

    this.isTogglingFavorite = true; 
    request$.subscribe({
        next: () => {
            if (isCurrentlyFavorite) { this.favoriteBookIds.delete(bookId); } 
            else { this.favoriteBookIds.add(bookId); }
            this.isTogglingFavorite = false; 
            // Opcional: Puedes usar showNotification aquí también
            this.showNotification(isCurrentlyFavorite ? 'Eliminado de favoritos' : 'Añadido a favoritos', 'success');
        },
        error: (err) => {
            console.error("Error al actualizar favorito:", err);
            this.showNotification("No se pudo actualizar.", 'error'); 
            this.isTogglingFavorite = false; 
        }
    });
  }

  isFavorite(bookId: number | null | undefined): boolean {
    return !!bookId && this.favoriteBookIds.has(bookId);
  }

  openProposalModal(): void { this.proposalSuccessMessage=null; this.proposalErrorMessage=null; this.showProposalModal = true;}
  closeProposalModal(): void { this.showProposalModal = false; }
  handleProposalSuccess(message: string): void { 
      // Cambiamos esto para usar el toast global también si quieres
      this.showNotification(message, 'success'); 
      this.showProposalModal = false; 
  }
  handleProposalError(message: string): void { 
      this.showNotification(message, 'error'); 
  }
  

  // --- LÓGICA REPORTE ---

  openReportModal(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.reportData = { motivo: '', descripcion: '' };
    this.reportError = null;
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
  }

  submitReport(): void {
    if (!this.reportData.motivo) {
      this.reportError = 'Debes seleccionar un motivo.';
      return;
    }
    if (!this.book || !this.book.id) return;

    this.isSubmittingReport = true;
    this.reportError = null;

    this.apiService.reportBook(this.book.id, this.reportData).subscribe({
      next: (res) => {
        this.isSubmittingReport = false;
        this.closeReportModal();
        
        // 👇 4. AQUÍ ESTÁ EL CAMBIO PRINCIPAL: Usar showNotification en lugar de alert()
        this.showNotification('Reporte enviado correctamente. El equipo de administración revisará la publicación.', 'success');
      },
      error: (err) => {
        this.isSubmittingReport = false;
        this.reportError = err.error?.detail || 'Ocurrió un error al enviar el reporte.';
      }
    });
  }

  // --- 👇 5. AGREGAR MÉTODOS DE NOTIFICACIÓN (TOAST) ---
  showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    // Se borra a los 4 segundos
    setTimeout(() => this.clearNotification(), 4000);
  }

  clearNotification(): void {
    this.notificationMessage = null;
  }

  // ... (Tus funciones de imagen: getMainImageUrl, onMainImageError, getFullOwnerAvatarUrl... déjalas igual) ...
  getMainImageUrl(): string {
    if (this.mainImageFallbackTriggered) return this.remoteFallback();
    if (!this.mainImagePath) return this.remoteFallback();
    return this.toRailwayAbsolute(this.mainImagePath);
  }
  onMainImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (this.mainImageFallbackTriggered) { img.onerror = null; return; }
    this.mainImageFallbackTriggered = true; img.onerror = null; img.src = this.remoteFallback();
  }
  private join(base: string, path: string): string { return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`; }
  private upgradeSchemeIfNeeded(url: string): string { try { if (location.protocol === 'https:s' && url.startsWith('http://')) { const u = new URL(url); return `https://${u.host}${u.pathname}${u.search}${u.hash}`; } } catch {} return url; }
  private fromMediaBase(rel: string): string { return this.join(this.MEDIA_BASE, rel); }
  private toRailwayAbsolute(raw: string): string { if (!raw) return this.remoteFallback(); const s = raw.trim(); if (/^https?:\/\//i.test(s)) return this.upgradeSchemeIfNeeded(s); const m = s.match(/\/?media\/(.+)$/i); if (m && m[1]) return this.fromMediaBase(m[1]); if (s.startsWith('books/')) return this.fromMediaBase(s); return this.fromMediaBase(s); }
  private remoteFallback(): string { return this.fromMediaBase('books/librodefecto.png'); }
  getFullOwnerAvatarUrl(relativePath: string | null): string { const apiBaseUrl = 'http://127.0.0.1:8000'; if (relativePath) { return `${apiBaseUrl}/media/${relativePath}`; } return 'assets/icon/avatardefecto.png'; }
}