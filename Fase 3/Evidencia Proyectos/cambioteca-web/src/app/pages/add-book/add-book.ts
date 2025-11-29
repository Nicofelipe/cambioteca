import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth';
import { forkJoin } from 'rxjs';
import { NotificationComponent } from '../../components/notification/notification';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: './add-book.html',
  styleUrls: ['./add-book.css']
})
export class AddBookComponent implements OnInit, OnDestroy {
  
  bookForm: FormGroup;
  generos: any[] = [];
  isLoading = false;
  isSearchingIsbn = false; 
  
  // Variables para la notificación flotante (Toast)
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  currentYear = new Date().getFullYear();

  // --- IMÁGENES ---
  selectedFiles: File[] = [];
  previews: string[] = [];
  coverIndex = 0;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {
    this.bookForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(2)]],
      autor: ['', [Validators.required, Validators.minLength(2)]],
      isbn: ['', Validators.required],
      anio_publicacion: [this.currentYear, [Validators.required, Validators.min(1800), Validators.max(this.currentYear)]],
      editorial: ['', Validators.required],
      id_genero: [null, Validators.required],
      estado: ['Buen estado', Validators.required],
      tipo_tapa: ['Tapa blanda', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.apiService.getGeneros().subscribe(data => {
      this.generos = data;
    });
  }

  // --- BUSCADOR DE ISBN (ACTUALIZADO SIN ALERT) ---
  searchIsbn(): void {
    const isbnValue = this.bookForm.get('isbn')?.value;

    if (!isbnValue || isbnValue.length < 10) {
      // 👇 Usamos notificación en vez de alert
      this.showNotification("Por favor ingresa un ISBN válido (10 o 13 dígitos).", 'error');
      return;
    }

    this.isSearchingIsbn = true;

    this.apiService.fetchBookByIsbn(isbnValue).subscribe({
      next: (response: any) => {
        this.isSearchingIsbn = false;

        if (response.totalItems > 0 && response.items) {
          const info = response.items[0].volumeInfo;
          
          const patchData: any = {
            titulo: info.title || '',
            autor: info.authors ? info.authors.join(', ') : '',
            editorial: info.publisher || '',
            descripcion: info.description || ''
          };

          if (info.publishedDate) {
            const year = parseInt(info.publishedDate.substring(0, 4));
            if (!isNaN(year)) {
              patchData.anio_publicacion = year;
            }
          }

          if (info.categories && info.categories.length > 0) {
            const googleGenre = info.categories[0].toLowerCase();
            const match = this.generos.find(g => g.nombre.toLowerCase().includes(googleGenre) || googleGenre.includes(g.nombre.toLowerCase()));
            if (match) {
              patchData.id_genero = match.id_genero;
            }
          }

          this.bookForm.patchValue(patchData);
          
          // 👇 Notificación de éxito
          this.showNotification('¡Libro encontrado! Hemos rellenado los datos por ti.', 'success');
        } else {
          // 👇 Notificación de error
          this.showNotification('No encontramos información para ese ISBN. Por favor llena los datos manualmente.', 'error');
        }
      },
      error: (err) => {
        this.isSearchingIsbn = false;
        console.error(err);
        this.showNotification('Error al conectar con el servicio de búsqueda.', 'error');
      }
    });
  }

  // --- IMÁGENES ---
  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.cleanupPreviews();
    this.selectedFiles = Array.from(input.files);
    this.previews = this.selectedFiles.map(file => URL.createObjectURL(file));
    this.coverIndex = 0; 
  }

  setAsCover(index: number): void {
    this.coverIndex = index;
  }

  private cleanupPreviews(): void {
    this.previews.forEach(url => URL.revokeObjectURL(url));
    this.previews = [];
  }

  // --- SUBMIT ---
  onSubmit(): void {
    if (this.bookForm.invalid) {
      this.bookForm.markAllAsTouched();
      this.showNotification("Por favor, completa todos los campos requeridos.", 'error');
      return;
    }

    this.isLoading = true;

    const currentUser = this.authService.getUser();
    if (!currentUser) {
      this.showNotification("Error de autenticación.", 'error');
      this.isLoading = false;
      return;
    }

    const bookData = { ...this.bookForm.value, id_usuario: currentUser.id };

    this.apiService.createBook(bookData).subscribe({
      next: (response) => {
        const bookId = response.id;
        this.uploadImages(bookId);
      },
      error: (err) => {
        this.isLoading = false;
        this.showNotification(err.error.detail || 'Ocurrió un error al crear el libro.', 'error');
      }
    });
  }

  private uploadImages(bookId: number): void {
    if (this.selectedFiles.length === 0) {
      this.finalizeCreation();
      return;
    }
    const uploadObservables = this.selectedFiles.map((file, index) => {
      const isCover = index === this.coverIndex;
      return this.apiService.uploadBookImage(bookId, file, { is_portada: isCover, orden: index + 1 });
    });

    forkJoin(uploadObservables).subscribe({
      next: () => this.finalizeCreation(),
      error: (err) => {
        this.isLoading = false;
        this.showNotification("El libro se creó, pero hubo un error al subir las imágenes.", 'error');
      }
    });
  }

  private finalizeCreation(): void {
    this.isLoading = false;
    this.showNotification(`¡El libro "${this.bookForm.value.titulo}" ha sido añadido con éxito!`, 'success');
    setTimeout(() => this.router.navigate(['/mis-libros']), 2000);
  }

  // 👇 Helpers para mostrar el Toast
  showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => this.clearNotification(), 4000);
  }

  clearNotification(): void {
    this.notificationMessage = null;
  }

  ngOnDestroy(): void {
    this.cleanupPreviews();
  }
}