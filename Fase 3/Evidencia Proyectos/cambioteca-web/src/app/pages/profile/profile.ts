import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router'; 
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs'; // Importamos forkJoin

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  user: any = null;
  metrics: any = null; 
  isLoading = true;

  favoriteBooks: any[] = [];
  isLoadingFavorites = true;

  // NUEVO: Variables para reseñas
  userReviews: any[] = [];
  isLoadingReviews = true;

  private readonly MEDIA_BASE = (environment.mediaBase || '').replace(/\/+$/, '');
  
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const loggedInUser = this.authService.getUser();

    if (loggedInUser && loggedInUser.id) {
      
      // 1. Carga Principal (Datos + Favoritos + Reseñas) en paralelo
      this.isLoading = true;
      this.isLoadingFavorites = true;
      this.isLoadingReviews = true;

      forkJoin({
        summary: this.apiService.getUserSummary(loggedInUser.id),
        favorites: this.apiService.getMyFavoritesList(loggedInUser.id),
        reviews: this.apiService.getUserRatings(loggedInUser.id) // Asegúrate de tener este método en ApiService
      }).subscribe({
        next: ({ summary, favorites, reviews }) => {
          
          // A) Datos de Usuario
          this.user = summary.user;
          this.metrics = summary.metrics;
          this.isLoading = false;

          // B) Favoritos (Procesando imágenes)
          this.favoriteBooks = (favorites || []).map((book: any) => ({
            ...book,
            first_image: this.toRailwayAbsolute(book.first_image)
          }));
          this.isLoadingFavorites = false;

          // C) Reseñas (Filtrando solo recibidas)
          // El backend devuelve 'tipo': 'recibida' | 'enviada'
          this.userReviews = (reviews || []).filter((r: any) => r.tipo === 'recibida');
          this.isLoadingReviews = false;

        },
        error: (err) => {
          console.error('Error cargando perfil completo:', err);
          this.isLoading = false;
          this.isLoadingFavorites = false;
          this.isLoadingReviews = false;
        }
      });

    } else {
      this.isLoading = false;
      this.isLoadingFavorites = false;
      this.isLoadingReviews = false;
    }
  }

  // --- Helpers ---

  // Genera un array [1..5] para dibujar las estrellas en el HTML
  getStarsArray(score: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  getAvatarSrc(): string {
    if (!this.user || !this.user.imagen_perfil) {
      return this.fromMediaBase('avatars/avatardefecto.jpg');
    }
    return this.toRailwayAbsolute(this.user.imagen_perfil);
  }

  // --- Lógica de Imágenes (Railway) ---
  private join(base: string, path: string): string {
    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  }

  private upgradeSchemeIfNeeded(url: string): string {
    try {
      if (location.protocol === 'https:' && url.startsWith('http://')) {
        const u = new URL(url);
        return `https://${u.host}${u.pathname}${u.search}${u.hash}`;
      }
    } catch {}
    return url;
  }

  private fromMediaBase(rel: string): string {
    return this.join(this.MEDIA_BASE, rel);
  }

  private toRailwayAbsolute(raw: string | null | undefined): string {
    const s = (raw || '').trim();
    const fallbackImage = 'books/librodefecto.png';
    if (!s) return this.fromMediaBase(fallbackImage);
    if (/^https?:\/\//i.test(s)) return this.upgradeSchemeIfNeeded(s);
    const m = s.match(/\/?media\/(.+)$/i);
    if (m && m[1]) return this.fromMediaBase(m[1]);
    return this.fromMediaBase(s);
  }
}