import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { NotificationComponent } from '../../components/notification/notification';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    NotificationComponent 
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  
  credentials = {
    email: '',
    contrasena: ''
  };

  isLoading = false;
  loginError: string | null = null; 

  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.loginError = null; 
    this.clearNotification();

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        this.showNotification('¡Bienvenido de vuelta!', 'success');
        
        setTimeout(() => {
          // --- LÓGICA DE REDIRECCIÓN POR ROL ---
          // Obtenemos el usuario guardado en el AuthService (o del response)
          const user = this.authService.getUser(); 

          if (user && user.es_admin) {
            // Si es admin, directo al dashboard
            this.router.navigate(['/admin']);
          } else {
            // Si es usuario normal, al catálogo
            this.router.navigate(['/catalogo']);
          }
        }, 1500); 
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error en el login:', err);
        this.loginError = err.error?.error || 'Credenciales incorrectas. Intenta de nuevo.';
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
  }

  clearNotification() {
    this.notificationMessage = null;
  }
}