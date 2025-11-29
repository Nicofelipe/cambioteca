import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth'; // <--- CAMBIO 1: Importar AuthService
import { NotificationComponent } from '../../components/notification/notification';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NotificationComponent],
  templateUrl: './admin-user-list.html',
  styleUrls: ['./admin-user-list.css']
})
export class AdminUserListComponent implements OnInit {

  users: any[] = [];
  isLoading = true;
  error: string | null = null;
  
  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  // Estados para el modal de confirmación
  showConfirmationModal = false;
  confirmationTitle = '';
  confirmationMessage = '';
  private actionToConfirm: () => void = () => {};

  constructor(
    private apiService: ApiService,
    private authService: AuthService // <--- CAMBIO 2: Inyectar AuthService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    // <--- CAMBIO 3: Obtener el ID del administrador actual
    const currentUser = this.authService.getUser();
    const currentAdminId = currentUser ? currentUser.id : null;

    this.apiService.adminGetAllUsers().subscribe({
      next: (data) => {
        
        // <--- CAMBIO 4: Filtrar la lista para excluir al admin actual
        // (Asumiendo que tu objeto usuario tiene 'id_usuario' o 'id')
        const filteredData = data.filter((user: any) => user.id_usuario !== currentAdminId);

        // Inicializamos los estados de UI con la lista ya filtrada
        this.users = filteredData.map((user: any) => ({
          ...user,
          isToggling: false, // Estado para el botón Habilitar/Deshabilitar
          isDeleting: false  // Estado para el botón Eliminar
        }));
        
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Error al cargar usuarios. No tienes permiso o el servidor falló.";
        this.isLoading = false;
      }
    });
  }

  // --- Funciones del Modal (Se mantienen igual) ---

  promptToggleUserActive(user: any): void {
    const actionText = user.activo ? "deshabilitar" : "habilitar";
    
    this.confirmationTitle = `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Usuario`;
    this.confirmationMessage = `¿Estás seguro de que quieres ${actionText} al usuario "${user.nombre_usuario}"?`;
    
    this.actionToConfirm = () => this.executeToggleUserActive(user);
    
    this.showConfirmationModal = true;
  }

  private executeToggleUserActive(user: any) {
    user.isToggling = true;
    
    this.apiService.adminToggleUserActive(user.id_usuario).subscribe({
      next: (response) => {
        user.activo = response.activo; 
        this.showNotification(`Usuario ${user.activo ? 'habilitado' : 'deshabilitado'} correctamente.`, 'success');
        user.isToggling = false;
      },
      error: (err) => {
        this.showNotification(err.error?.detail || 'No se pudo actualizar el estado del usuario.', 'error');
        user.isToggling = false;
      }
    });
  }

  promptDeleteUser(user: any): void {
    this.confirmationTitle = 'Eliminar Usuario';
    this.confirmationMessage = `¿Estás seguro de que quieres ELIMINAR al usuario "${user.nombre_usuario}"? Esta acción es permanente y no se puede deshacer.`;
    
    this.actionToConfirm = () => this.executeDeleteUser(user);
    
    this.showConfirmationModal = true;
  }

  private executeDeleteUser(user: any) {
    user.isDeleting = true;
    
    this.apiService.adminDeleteUser(user.id_usuario).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id_usuario !== user.id_usuario);
        this.showNotification('Usuario eliminado permanentemente.', 'success');
      },
      error: (err) => {
        this.showNotification(err.error?.detail || 'No se pudo eliminar al usuario.', 'error');
        user.isDeleting = false;
      }
    });
  }

  // --- Funciones del Modal ---
  
  onConfirmAction(): void {
    this.actionToConfirm();
    this.showConfirmationModal = false;
  }

  onCancelAction(): void {
    this.showConfirmationModal = false;
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notificationMessage = message;
    this.notificationType = type;
    setTimeout(() => this.clearNotification(), 4000);
  }

  clearNotification(): void {
    this.notificationMessage = null;
  }
}