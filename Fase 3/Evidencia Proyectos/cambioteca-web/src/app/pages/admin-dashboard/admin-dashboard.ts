import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { RouterLink } from '@angular/router';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink,
    NgxChartsModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  summaryData: any = null;
  isLoading = true;
  error: string | null = null;
  
  // Variables para el botón "Actualizar"
  currentDate = new Date();
  isRefreshing = false;

  // --- DATOS PARA GRÁFICOS ---
  chartTopUsers: any[] = [];
  chartGenres: any[] = [];
  chartHistory: any[] = [];

  // NOTA: Eliminé la variable 'view' para que el gráfico se adapte al CSS automáticamente.

  // Esquemas de Colores
  colorScheme: Color = {
    name: 'terracota',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#aa9797', '#28a745', '#ffc107', '#17a2b8', '#6c757d']
  };

  colorSchemeLines: Color = {
    name: 'lines',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#aa9797', '#28a745'] // Terracota, Verde
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Función centralizada para cargar datos.
   * Se usa al inicio y al presionar el botón de actualizar.
   */
  loadData(): void {
    // Solo mostramos el loading de pantalla completa si NO estamos refrescando manualmente
    if (!this.isRefreshing) {
      this.isLoading = true;
    }
    this.error = null;

    this.apiService.getAdminSummary().subscribe({
      next: (data) => {
        
        // --- INICIO DEL PARCHE DE DATOS (Tu lógica original) ---
        if (data.top_publishers) {
          data.top_publishers = data.top_publishers.map((u: any) => ({
            ...u, 
            nombre_usuario: u.nombre_usuario || u.id_usuario__nombre_usuario || 'Usuario Desconocido'
          }));
        }
        if (data.top_rated_users) {
          data.top_rated_users = data.top_rated_users.map((u: any) => ({
            ...u,
            nombre_usuario: u.nombre_usuario || u.id_usuario_calificado__nombre_usuario || 'Usuario Desconocido'
          }));
        }
        // --- FIN DEL PARCHE ---

        this.summaryData = data;
        this.processCharts(data);
        
        // Finalizar estados de carga
        this.isLoading = false;
        this.isRefreshing = false;
        this.currentDate = new Date(); // Actualizar hora
      },
      error: (err) => {
        this.error = "No tienes permiso de administrador o ocurrió un error.";
        this.isLoading = false;
        this.isRefreshing = false;
      }
    });
  }

  /**
   * Esta función se vincula al botón del HTML
   */
  refreshData(): void {
    this.isRefreshing = true; // Activa la animación de giro del icono
    this.loadData();
  }

  processCharts(data: any): void {
    // 1. Top Usuarios Activos
    if (data.top_active_users) {
      this.chartTopUsers = data.top_active_users.map((u: any) => ({
        name: u.nombre_usuario,
        value: u.total_completed_exchanges
      }));
    }

    // 2. Géneros Más Populares
    if (data.genres_exchanges) {
      this.chartGenres = data.genres_exchanges.slice(0, 6).map((g: any) => ({
        name: g.genre,
        value: g.total
      }));
    }

    // 3. Historial de Actividad (Líneas)
    const booksSeries = (data.books_stats?.by_day_last_30 || []).map((item: any) => ({
      name: this.formatDate(item.date),
      value: item.total
    }));

    const exchangeSeries = (data.exchanges_stats?.by_day_last_30 || []).map((item: any) => ({
      name: this.formatDate(item.date),
      value: item.total
    }));

    this.chartHistory = [
      {
        name: 'Intercambios',
        series: exchangeSeries
      },
      {
        name: 'Libros Nuevos',
        series: booksSeries
      }
    ];
  }

  // Helper para fechas cortas (DD/MM)
  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    // Ajuste simple para zona horaria local si es necesario, o uso directo
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
}