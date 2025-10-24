import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth'; // Necesitamos este servicio para saber quién es el usuario

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-books.html',
  styleUrls: ['./my-books.css']
})
export class MyBooksComponent implements OnInit {

  myBooks: any[] = [];
  isLoading = true;
  error: string | null = null;
  currentUser: any = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    if (this.currentUser && this.currentUser.id) {
      this.loadMyBooks(this.currentUser.id);
    } else {
      this.error = "No se pudo identificar al usuario. Por favor, inicia sesión de nuevo.";
      this.isLoading = false;
    }
  }

  loadMyBooks(userId: number): void {
    this.isLoading = true;
    this.apiService.getMyBooks(userId).subscribe({
      next: (data) => {
        this.myBooks = data;
        this.isLoading = false;
        console.log("Mis libros:", this.myBooks);
      },
      error: (err) => {
        console.error("Error al cargar mis libros:", err);
        this.error = "Hubo un problema al cargar tus libros.";
        this.isLoading = false;
      }
    });
  }

  // Funciones placeholder para los botones de acción
  editBook(bookId: number) {
    console.log('Editar libro:', bookId);
    // Aquí irá la lógica para navegar a una página de edición
  }

  deleteBook(bookId: number) {
    console.log('Eliminar libro:', bookId);
    // Aquí irá la lógica para llamar a la API y eliminar el libro
  }
}
