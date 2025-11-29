import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NotificationComponent } from '../../components/notification/notification';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NotificationComponent],
  templateUrl: './admin-reports.html',
  styleUrls: ['./admin-reports.css']
})
export class AdminReportsComponent implements OnInit {

  reports: any[] = [];
  isLoading = true;
  currentTab: 'PENDIENTE' | 'RESUELTOS' = 'PENDIENTE'; // Pestañas
  
  // Modal de resolución
  showModal = false;
  selectedReport: any = null;
  resolutionData = {
    action: '', // 'APROBAR' (Castigar) o 'RECHAZAR' (Descartar)
    comment: '',
    banBook: false
  };
  isSubmitting = false;

  notificationMessage: string | null = null;
  notificationType: 'success' | 'error' = 'success';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  loadReports(): void {
    this.isLoading = true;
    // Si es "RESUELTOS", en el backend no filtramos, traemos todo y filtramos aquí o pedimos endpoint específico.
    // Para simplificar, pediremos PENDIENTE por defecto, o null para todo.
    const statusFilter = this.currentTab === 'PENDIENTE' ? 'PENDIENTE' : ''; 
    
    this.apiService.getAdminReports(statusFilter).subscribe({
      next: (data) => {
        if (this.currentTab === 'RESUELTOS') {
            // Filtramos localmente lo que no sea pendiente
            this.reports = data.filter(r => r.estado !== 'PENDIENTE');
        } else {
            this.reports = data;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  changeTab(tab: 'PENDIENTE' | 'RESUELTOS'): void {
    this.currentTab = tab;
    this.loadReports();
  }

  openResolveModal(report: any): void {
    this.selectedReport = report;
    this.resolutionData = { action: '', comment: '', banBook: false };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReport = null;
  }

  submitResolution(): void {
    if (!this.resolutionData.action) return;
    
    this.isSubmitting = true;

    // Mapear acción a lo que espera el backend
    // Si Acción es "Sancionar" -> Estado APROBADO (el reporte es válido)
    // Si Acción es "Descartar" -> Estado RECHAZADO (el reporte es inválido)
    const nuevoEstado = this.resolutionData.action === 'APROBAR' ? 'APROBADO' : 'RECHAZADO';
    const darBaja = this.resolutionData.action === 'APROBAR' && this.resolutionData.banBook;

    const payload = {
      estado: nuevoEstado,
      comentario_admin: this.resolutionData.comment,
      marcar_baja: darBaja
    };

    this.apiService.resolveReport(this.selectedReport.id_reporte, payload).subscribe({
      next: () => {
        this.showNotification('Reporte gestionado correctamente.', 'success');
        this.isSubmitting = false;
        this.closeModal();
        this.loadReports(); // Recargar lista
      },
      error: (err) => {
        this.showNotification('Error al procesar el reporte.', 'error');
        this.isSubmitting = false;
      }
    });
  }

  // Helpers visuales
  getBadgeClass(estado: string): string {
    switch(estado) {
      case 'PENDIENTE': return 'badge-warning';
      case 'APROBADO': return 'badge-success'; // Reporte aprobado = acción tomada
      case 'RECHAZADO': return 'badge-secondary'; // Reporte rechazado = falso positivo
      default: return 'badge-secondary';
    }
  }

  showNotification(msg: string, type: 'success' | 'error'): void {
    this.notificationMessage = msg;
    this.notificationType = type;
    setTimeout(() => this.notificationMessage = null, 4000);
  }
  clearNotification() { this.notificationMessage = null; }
}