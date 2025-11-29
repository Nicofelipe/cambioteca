import { Component, HostListener } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
// Quitamos 'Observable' y 'AuthService' de aquí
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink,
    HeaderComponent, 
    FooterComponent 
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  // Variable para controlar la visibilidad del botón
  showScrollButton = false;

  // 👇 Escuchamos el scroll de la ventana
  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Si bajamos más de 300px, mostramos el botón
    if (window.scrollY > 300) {
      this.showScrollButton = true;
    } else {
      this.showScrollButton = false;
    }
  }

  // 👇 Función para subir suavemente
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}