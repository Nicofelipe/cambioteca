import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// 1. Importa 'RouterLink' desde el router de Angular
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  // 2. Añade 'RouterLink' al array de imports del componente
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
})
export class BookListComponent implements OnInit {
  
  // La única lista que necesitamos para mostrar los libros
  books: any[] = [];
  
  isLoading = true;
  searchTerm: string = '';
  
  // Para mostrar un mensaje adecuado si la búsqueda no arroja resultados
  isSearchActive: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadAllBooks();
  }

  /**
   * Carga la lista completa de libros del catálogo.
   */
  loadAllBooks(): void {
    this.isLoading = true;
    this.isSearchActive = false; // No es una búsqueda
    this.apiService.getBooks().subscribe({
      next: (data) => {
        // La API paginada devuelve los libros en la propiedad 'results'
        this.books = data.results || data; 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar los libros:', err);
        this.isLoading = false;
      }
    });
  }

  /**
   * Se ejecuta al enviar el formulario de búsqueda.
   */
  searchBooks(): void {
    // Si el campo de búsqueda está vacío, recargamos todos los libros
    if (this.searchTerm.trim() === '') {
      this.loadAllBooks();
      return;
    }

    this.isLoading = true;
    this.isSearchActive = true; // Es una búsqueda
    
    this.apiService.searchBooks(this.searchTerm).subscribe({
      next: (data) => {
        this.books = data.results || data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error en la búsqueda:', err);
        this.isLoading = false;
      }
    });
  }
}
