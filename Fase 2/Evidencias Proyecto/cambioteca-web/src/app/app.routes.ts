import { Routes } from '@angular/router';

// Importaciones de tus páginas
import { RegisterComponent } from './pages/register/register';
import { LoginComponent } from './pages/login/login';
import { BookListComponent } from './pages/book-list/book-list';
import { ProfileComponent } from './pages/profile/profile';
import { BookDetailComponent } from './pages/book-detail/book-detail';
import { MyBooksComponent } from './pages/my-books/my-books';

// Importación del guardián
// Asegúrate de que el archivo auth.guard.ts exista en la ruta: src/app/core/guards/
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: BookListComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'libros/:id', component: BookDetailComponent },
  {
    path: 'mis-libros',
    component: MyBooksComponent,
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    component: ProfileComponent,
    canActivate: [authGuard] // <-- Añade esta línea para proteger la ruta
  }
];
