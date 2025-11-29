import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth'; 
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<any>;
  
  isUserDropdownOpen = false;
  isProposalsDropdownOpen = false;

  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isUserDropdownOpen = false;
    this.isProposalsDropdownOpen = false;
  }

  closeAllDropdowns(): void {
    this.isUserDropdownOpen = false;
    this.isProposalsDropdownOpen = false;
  }

  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isProposalsDropdownOpen = false;
  }

  toggleProposalsDropdown(event: Event) {
    event.stopPropagation();
    this.isProposalsDropdownOpen = !this.isProposalsDropdownOpen;
    this.isUserDropdownOpen = false;
  }

  onLogoutClick() {
    this.closeAllDropdowns();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // 👇 NUEVA FUNCIÓN: Calcula el saludo según la hora del sistema
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return '¡Buenos días';
    if (hour >= 12 && hour < 20) return '¡Buenas tardes';
    return '¡Buenas noches'; // De 20:00 a 06:00
  }
}