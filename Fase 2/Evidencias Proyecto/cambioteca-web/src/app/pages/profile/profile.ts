import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {

  user: any = null;
  metrics: any = null; // Guardaremos las métricas por separado
  isLoading = true;
  apiBaseUrl = 'http://127.0.0.1:8000'; // URL base de tu backend

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const loggedInUser = this.authService.getUser();

    if (loggedInUser && loggedInUser.id) {
      this.apiService.getUserSummary(loggedInUser.id).subscribe({
        next: (data) => {
          this.user = data.user;
          this.metrics = data.metrics; // Guardamos las métricas
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error al cargar el perfil:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  // NUEVA FUNCIÓN para construir la URL completa del avatar
  getFullAvatarUrl(relativePath: string | null): string {
    if (relativePath) {
      // Une la base de la API con la ruta de medios y la ruta de la imagen
      return `${this.apiBaseUrl}/media/${relativePath}`;
    }
    // Si no hay imagen, devuelve una por defecto
    return 'assets/icon/avatardefecto.png'; // Asegúrate de tener una imagen por defecto
  }
}