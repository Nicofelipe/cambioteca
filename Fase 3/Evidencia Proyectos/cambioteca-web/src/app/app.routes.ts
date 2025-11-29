import { Routes } from '@angular/router';
// ... tus imports de componentes ...
import { RegisterComponent } from './pages/register/register';
import { LoginComponent } from './pages/login/login';
import { BookListComponent } from './pages/book-list/book-list';
import { ProfileComponent } from './pages/profile/profile';
import { BookDetailComponent } from './pages/book-detail/book-detail';
import { MyBooksComponent } from './pages/my-books/my-books';
import { AddBookComponent } from './pages/add-book/add-book';
import { ChatListComponent } from './pages/chat-list/chat-list';
import { ChatConversationComponent } from './pages/chat-conversation/chat-conversation';
import { EditBookComponent } from './pages/edit-book/edit-book';
import { EditProfileComponent } from './pages/edit-profile/edit-profile';
import { ReceivedProposalsComponent } from './pages/received-proposals/received-proposals';
import { HomeComponent } from './pages/home/home';
import { ExchangeHistoryComponent } from './pages/exchange-history/exchange-history';
import { ProposalDetailComponent } from './pages/proposal-detail/proposal-detail';
import { ChangePasswordComponent } from './pages/change-password/change-password';
import { MeetingPointsComponent } from './pages/meeting-points/meeting-points';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';
import { AboutUsComponent } from './pages/about-us/about-us';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { ProposalsSentComponent } from './pages/proposals-sent/proposals-sent';
import { AdminUserListComponent } from './pages/admin-user-list/admin-user-list';
import { AdminBookListComponent } from './pages/admin-book-list/admin-book-list';
import { PublicProfileComponent } from './pages/public-profile/public-profile';

// Guards
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { notAdminGuard } from './core/guards/not-admin.guard'; 
import { AdminReportsComponent } from './pages/admin-reports/admin-reports';

export const routes: Routes = [
  // Rutas Públicas (Login/Registro/Home)
  { 
    path: '', 
    component: HomeComponent,
    canActivate: [notAdminGuard],
    title: 'Inicio | Cambioteca' // 👈 Título Dinámico
  }, 
  { 
    path: 'registro', 
    component: RegisterComponent,
    title: 'Registro | Cambioteca'
  },
  { 
    path: 'login', 
    component: LoginComponent,
    title: 'Iniciar Sesión | Cambioteca'
  },
  { 
    path: 'recuperar-password', 
    component: ForgotPasswordComponent,
    title: 'Recuperar Contraseña | Cambioteca'
  },
  { 
    path: 'reset-password/:token', 
    component: ResetPasswordComponent,
    title: 'Restablecer Contraseña | Cambioteca'
  },
  
  // Páginas informativas
  { 
    path: 'sobre-nosotros', 
    component: AboutUsComponent,
    title: 'Sobre Nosotros | Cambioteca'
  },
  { 
    path: 'terminos', 
    component: AboutUsComponent,
    title: 'Términos y Condiciones | Cambioteca'
  },
  { 
    path: 'privacidad', 
    component: AboutUsComponent,
    title: 'Política de Privacidad | Cambioteca'
  },

  // =========================================================
  // 🔒 RUTAS DE USUARIO NORMAL
  // =========================================================
  
  { 
    path: 'catalogo', 
    component: BookListComponent,
    canActivate: [notAdminGuard],
    title: 'Catálogo de Libros | Cambioteca'
  },
  { 
    path: 'perfil', 
    component: ProfileComponent, 
    canActivate: [authGuard, notAdminGuard],
    title: 'Mi Perfil | Cambioteca'
  },
  { 
    path: 'perfil/editar', 
    component: EditProfileComponent, 
    canActivate: [authGuard, notAdminGuard],
    title: 'Editar Perfil | Cambioteca'
  },
  { 
    path: 'perfil/cambiar-password', 
    component: ChangePasswordComponent, 
    canActivate: [authGuard, notAdminGuard],
    title: 'Cambiar Contraseña | Cambioteca'
  },
  { 
    path: 'usuario/:id', 
    component: PublicProfileComponent,
    canActivate: [authGuard, notAdminGuard],
    title: 'Perfil de Usuario | Cambioteca'
  },
  { 
    path: 'puntos-encuentro', 
    component: MeetingPointsComponent,
    canActivate: [notAdminGuard],
    title: 'Puntos de Encuentro | Cambioteca'
  },
  {
    path: 'historial', 
    component: ExchangeHistoryComponent,
    canActivate: [authGuard, notAdminGuard],
    title: 'Historial de Intercambios | Cambioteca'
  },
  {
    path: 'libros/nuevo',
    component: AddBookComponent,
    canActivate: [authGuard, notAdminGuard],
    title: 'Subir Libro | Cambioteca'
  },
  { 
    path: 'libros/:id/editar', 
    component: EditBookComponent, 
    canActivate: [authGuard, notAdminGuard],
    title: 'Editar Libro | Cambioteca'
  },
  { 
    path: 'libros/:id',
    component: BookDetailComponent,
    canActivate: [notAdminGuard],
    title: 'Detalle del Libro | Cambioteca'
  },
  {
    path: 'mis-libros',
    component: MyBooksComponent,
    canActivate: [authGuard, notAdminGuard],
    title: 'Mis Libros | Cambioteca'
  },
  
  // --- Chat y Propuestas ---
  {
    path: 'chat', 
    component: ChatListComponent,
    canActivate: [authGuard, notAdminGuard],
    title: 'Mis Mensajes | Cambioteca'
  },
  {
    path: 'chat/:id', 
    component: ChatConversationComponent,
    canActivate: [authGuard, notAdminGuard],
    title: 'Chat | Cambioteca'
  },
  {
    path: 'propuestas/recibidas', 
    component: ReceivedProposalsComponent,
    canActivate: [authGuard, notAdminGuard],
    title: 'Propuestas Recibidas | Cambioteca'
  },
  {
    path: 'propuestas/enviadas', 
    component: ProposalsSentComponent,
    canActivate: [authGuard, notAdminGuard],
    title: 'Propuestas Enviadas | Cambioteca'
  },
  { 
    path: 'propuestas/:id', 
    component: ProposalDetailComponent, 
    canActivate: [authGuard, notAdminGuard],
    title: 'Detalle de Propuesta | Cambioteca'
  },

  // =========================================================
  // 🛡️ RUTAS DE ADMINISTRADOR
  // =========================================================
  {
    path: 'admin',
    canActivate: [adminGuard],
    title: 'Administración | Cambioteca', // Título general para /admin
    children: [
      { 
        path: '', 
        component: AdminDashboardComponent,
        title: 'Dashboard Admin | Cambioteca'
      },
      { 
        path: 'users', 
        component: AdminUserListComponent,
        title: 'Gestión Usuarios | Cambioteca'
      },
      { 
        path: 'books', 
        component: AdminBookListComponent,
        title: 'Gestión Libros | Cambioteca'
      },
      { 
        path: 'reports', 
        component: AdminReportsComponent,
        title: 'Reportes | Cambioteca' 
      }
    ]
  },
];