import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BooksService, Libro } from '../../core/services/books.service';

// Web Components de Swiper
import { register } from 'swiper/element/bundle';
register();

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  // ⬇️ Permite elementos personalizados como <swiper-container>
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HomePage implements OnInit {
  q = '';
  ultimos: Libro[] = [];
  populares: Libro[] = [];
  loading = false;
  loadingPopulares = false;

  constructor(private books: BooksService) {}

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading = this.loadingPopulares = true;
    this.books.list('').subscribe({
      next: (data) => {
        this.ultimos = data.slice(0, 10);
        this.populares = data.slice(10, 20);
        this.loading = this.loadingPopulares = false;
      },
      error: () => { this.loading = this.loadingPopulares = false; }
    });
  }

  buscar() {
    this.loading = true;
    this.books.list(this.q).subscribe({
      next: (data) => { this.ultimos = data.slice(0, 10); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  trackByLibro = (_: number, item: Libro) => item.id;
}
