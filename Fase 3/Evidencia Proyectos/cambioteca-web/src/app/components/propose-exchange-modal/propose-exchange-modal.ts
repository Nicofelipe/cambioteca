import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-propose-exchange-modal',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './propose-exchange-modal.html',
  styleUrls: ['./propose-exchange-modal.css']
})
export class ProposeExchangeModalComponent implements OnInit {

  @Input() bookDesiredId: number | null = null; 
  @Input() bookDesiredTitle: string = 'este libro'; 

  @Output() closeModal = new EventEmitter<void>(); 
  @Output() proposalSuccess = new EventEmitter<string>(); 
  @Output() proposalError = new EventEmitter<string>(); 

  myAvailableBooks: any[] = [];
  
  // CAMBIO: Ahora es un solo ID (number), no un array
  selectedBookId: number | null = null;
  
  isLoadingMyBooks = true; 
  isSubmitting = false; 
  errorMessage: string | null = null; 
  currentUser: any = null; 

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUser();
    if (this.currentUser && this.currentUser.id) {
      this.loadMyAvailableBooks(this.currentUser.id);
    } else {
      this.errorMessage = "Error: No se pudo identificar al usuario.";
      this.isLoadingMyBooks = false;
    }
  }

  loadMyAvailableBooks(userId: number): void {
    this.isLoadingMyBooks = true;
    this.errorMessage = null;
    this.apiService.getMyBooks(userId).subscribe({ 
      next: (data) => {
        // Filtra disponibles y excluye el libro que quieres pedir (no puedes ofrecer el mismo)
        this.myAvailableBooks = data.filter((book: any) => book.disponible && book.id !== this.bookDesiredId);
        this.isLoadingMyBooks = false;
        if (this.myAvailableBooks.length === 0) {
          this.errorMessage = "No tienes libros disponibles para ofrecer.";
        }
      },
      error: (err) => {
        this.errorMessage = "Error al cargar tus libros disponibles.";
        this.isLoadingMyBooks = false;
      }
    });
  }

  // CAMBIO: Función simple para seleccionar UNO
  selectBook(bookId: number): void {
    this.selectedBookId = bookId;
    this.errorMessage = null; 
  }

  submitProposal(): void {
    // Validación: Debe haber 1 libro seleccionado
    if (!this.selectedBookId) {
      this.errorMessage = "Debes seleccionar 1 libro para ofrecer.";
      return;
    }
    if (!this.bookDesiredId || !this.currentUser) {
      this.errorMessage = "Faltan datos esenciales.";
      return;
    }

    this.isSubmitting = true; 
    this.errorMessage = null;

    const proposalData = {
      id_usuario_solicitante: this.currentUser.id,
      id_libro_deseado: this.bookDesiredId,
      // CAMBIO: Enviamos el ID dentro de un array, porque el backend espera una lista
      id_libros_ofrecidos: [this.selectedBookId]
    };

    this.apiService.crearSolicitudIntercambio(proposalData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.proposalSuccess.emit(`¡Propuesta enviada con éxito para "${this.bookDesiredTitle}"!`);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.detail || "Ocurrió un error al enviar la propuesta.";
      }
    });
  }

  requestClose(): void {
    this.closeModal.emit(); 
  }
}