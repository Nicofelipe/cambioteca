// src/app/pages/home/home.page.ts
import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/core/services/auth.service';
import { BooksService, Libro, PopularItem } from '../../core/services/books.service';

// Web Components de Swiper
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  q = '';
  ultimos: Libro[] = [];
  populares: PopularItem[] = [];
  loading = false;
  loadingPopulares = false;



  constructor(private books: BooksService, private router: Router, private auth: AuthService,) { }

  // Devuelve array de géneros limpios
  genreList(b: Libro): string[] {
    const raw = (b.genero || '').trim();
    if (!raw) return [];
    return raw
      .split(',')
      .map(x => x.trim())
      .filter(Boolean);
  }



  // Mapea cada género a un color de Ionic
  genreColor(g: string): string {
    const k = g.toLowerCase();
    const map: Record<string, string> = {
      'ficción': 'primary',
      'fantasía': 'secondary',
      'fantasia': 'secondary',
      'romance': 'tertiary',
      'misterio': 'dark',
      'suspenso': 'dark',
      'terror': 'danger',
      'horror': 'danger',
      'autoayuda': 'success',
      'no ficción': 'medium',
      'no ficcion': 'medium',
      'historia': 'warning',
      'biografía': 'warning',
      'biografia': 'warning',
      'ciencia': 'success',
      'tecnología': 'success',
      'tecnologia': 'success',
      'poesía': 'secondary',
      'poesia': 'secondary',
      'juvenil': 'primary',
      'infantil': 'tertiary',
    };
    return map[k] || 'medium'; // color por defecto
  }

  meId: number | null = null; // 👈

  async ngOnInit() {
    await this.auth.restoreSession();     // 👈 recupera sesión
    this.meId = this.auth.user?.id ?? null;
    this.cargar();
  }


  cargar() {
    this.loading = true;
    this.loadingPopulares = true;

    this.books.latest().subscribe({
      next: (data) => { this.ultimos = data; this.loading = false; },
      error: () => { this.loading = false; }
    });

    this.books.populares().subscribe({
      next: (data) => { this.populares = data; this.loadingPopulares = false; },
      error: () => { this.loadingPopulares = false; }
    });
  }

  goBook(id?: number) {
    if (!id) return;
    this.router.navigate(['/books', 'view', id], {
      state: { from: this.router.url },   // 👈 ayuda al botón Back del detalle
    });
  }

  goUser(id?: number | null) {
    if (!id) return;
    const isMe = this.meId != null && id === this.meId;
    // ajusta la ruta si tu perfil propio es otra (p. ej. '/profile')
    const target = isMe ? ['/my-books', 'profile'] : ['/users', id];
    this.router.navigate(target, { state: { from: this.router.url } });
  }

  goTitle(title: string) {
    if (!title) return;
    // tu TitleResultsPage lee :title y hace decodeURIComponent
    this.router.navigate(['/books', 'title', encodeURIComponent(title)], {
      state: { from: this.router.url },
    });
  }


  buscar() {
    // Si quieres que la búsqueda solo afecte “últimos agregados”
    this.loading = true;
    this.books.list(this.q).subscribe({
      next: (data) => { this.ultimos = data.slice(0, 10); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  trackByLibro = (_: number, item: Libro) => item.id;
  trackByPopular = (_: number, item: PopularItem) => item.titulo;
}
