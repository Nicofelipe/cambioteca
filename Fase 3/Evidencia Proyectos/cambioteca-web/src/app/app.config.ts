import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router'; // 1. Importamos withInMemoryScrolling

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // 2. Configuramos el Router con el Scroll Restoration
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Esto hace que la página suba al cambiar de ruta
        anchorScrolling: 'enabled'
      })
    ),

    // 3. Mantenemos tu configuración HTTP con el Interceptor (NO BORRAR ESTO)
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};