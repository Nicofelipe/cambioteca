// src/app/pages/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // <-- Importamos el Router
import { AuthService } from '../../services/auth'; // <-- Importamos el nuevo servicio

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // Objeto para guardar los datos del formulario
  credentials = {
    email: '',
    contrasena: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router // <-- Inyectamos el Router
  ) {}

  onSubmit() {
    this.authService.login(this.credentials).subscribe({
      // Se ejecuta si el login es exitoso
      next: (response) => {
        console.log('Login exitoso!', response);
        alert('¡Bienvenido!');
        // Redirigimos al usuario a la página principal
        this.router.navigate(['/']);
      },
      // Se ejecuta si hay un error
      error: (err) => {
        console.error('Error en el login:', err);
        // El backend envía el mensaje de error en err.error.error
        alert(`Error: ${err.error.error || 'Credenciales incorrectas.'}`);
      }
    });
  }
}