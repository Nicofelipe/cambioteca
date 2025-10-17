import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router'; // Importa RouterLink para el botón "Volver"
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink], // Añade RouterLink aquí
  templateUrl: './book-detail.html',
  styleUrls: ['./book-detail.css']
})
export class BookDetailComponent implements OnInit {
  
  book: any = null; // Para almacenar los datos del libro
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    // 1. Obtenemos el 'id' de la URL
    const bookId = this.route.snapshot.paramMap.get('id');

    if (bookId) {
      // 2. Llamamos al servicio con el ID
      this.apiService.getBookById(+bookId).subscribe({
        next: (data) => {
          this.book = data;
          this.isLoading = false;
          console.log('Detalle del libro:', this.book);
        },
        error: (err) => {
          console.error('Error al cargar el detalle del libro:', err);
          this.error = 'No se pudo cargar la información del libro. Inténtalo de nuevo más tarde.';
          this.isLoading = false;
        }
      });
    } else {
      // Manejar el caso en que no haya ID en la URL
      this.error = 'No se especificó un libro para mostrar.';
      this.isLoading = false;
    }
  }
}