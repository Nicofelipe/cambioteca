# 🎨 Cambioteca Frontend - Angular Application

Frontend de la plataforma Cambioteca construido con Angular 20, proporcionando una interfaz moderna y responsiva para el intercambio de libros.

## 🏗️ Arquitectura del Frontend

```
src/
├── app/
│   ├── components/           # Componentes reutilizables
│   │   ├── header/          # Barra de navegación
│   │   ├── footer/          # Pie de página
│   │   ├── notification/    # Sistema de notificaciones
│   │   └── propose-exchange-modal/ # Modal de propuestas
│   ├── core/               # Funcionalidades core
│   │   ├── guards/         # Guards de autenticación y autorización
│   │   ├── interceptors/   # Interceptores HTTP
│   │   └── services/       # Servicios core
│   ├── pages/              # Páginas/Vistas principales
│   │   ├── home/           # Página de inicio
│   │   ├── login/          # Inicio de sesión
│   │   ├── register/       # Registro de usuarios
│   │   ├── book-list/      # Catálogo de libros
│   │   ├── book-detail/    # Detalle de libro
│   │   ├── my-books/       # Mis libros
│   │   ├── add-book/       # Agregar libro
│   │   ├── edit-book/      # Editar libro
│   │   ├── profile/        # Perfil de usuario
│   │   ├── edit-profile/   # Editar perfil
│   │   ├── chat-list/      # Lista de conversaciones
│   │   ├── chat-conversation/ # Conversación específica
│   │   ├── received-proposals/ # Propuestas recibidas
│   │   ├── proposals-sent/ # Propuestas enviadas
│   │   ├── exchange-history/ # Historial de intercambios
│   │   ├── meeting-points/ # Puntos de encuentro
│   │   ├── admin-dashboard/ # Panel de administración
│   │   └── ...
│   ├── services/           # Servicios de la aplicación
│   │   ├── api.service.ts  # Servicio principal de API
│   │   └── auth.ts         # Servicio de autenticación
│   ├── app.config.ts       # Configuración de la app
│   ├── app.routes.ts       # Configuración de rutas
│   └── app.ts             # Componente principal
├── assets/                 # Recursos estáticos
│   ├── data/              # Datos CSV (bibliotecas, metro, etc.)
│   └── icon/              # Iconos y favicon
├── environments/           # Configuraciones de entorno
└── styles.css             # Estilos globales
```

## 📦 Dependencias Principales

```json
{
  "dependencies": {
    "@angular/core": "^20.3.0",
    "@angular/common": "^20.3.0",
    "@angular/router": "^20.3.0",
    "@angular/forms": "^20.3.0",
    "@angular/cdk": "^20.2.12",
    "@angular/google-maps": "^20.2.11",
    "@swimlane/ngx-charts": "^23.1.0",
    "@fortawesome/fontawesome-free": "^7.1.0",
    "papaparse": "^5.5.3",
    "rxjs": "~7.8.0",
    "zone.js": "~0.15.0"
  }
}
```

## 🛣️ Sistema de Rutas

### Rutas Públicas
```typescript
{ path: '', component: HomeComponent },
{ path: 'catalogo', component: BookListComponent },
{ path: 'registro', component: RegisterComponent },
{ path: 'login', component: LoginComponent },
{ path: 'sobre-nosotros', component: AboutUsComponent },
{ path: 'puntos-encuentro', component: MeetingPointsComponent },
{ path: 'recuperar-password', component: ForgotPasswordComponent },
{ path: 'reset-password/:token', component: ResetPasswordComponent }
```

### Rutas Protegidas (requieren autenticación)
```typescript
{ path: 'perfil', component: ProfileComponent, canActivate: [authGuard] },
{ path: 'perfil/editar', component: EditProfileComponent, canActivate: [authGuard] },
{ path: 'perfil/cambiar-password', component: ChangePasswordComponent, canActivate: [authGuard] },
{ path: 'mis-libros', component: MyBooksComponent, canActivate: [authGuard] },
{ path: 'libros/nuevo', component: AddBookComponent, canActivate: [authGuard] },
{ path: 'libros/:id/editar', component: EditBookComponent, canActivate: [authGuard] },
{ path: 'chat', component: ChatListComponent, canActivate: [authGuard] },
{ path: 'chat/:id', component: ChatConversationComponent, canActivate: [authGuard] },
{ path: 'propuestas/recibidas', component: ReceivedProposalsComponent, canActivate: [authGuard] },
{ path: 'propuestas/enviadas', component: ProposalsSentComponent, canActivate: [authGuard] },
{ path: 'historial', component: ExchangeHistoryComponent, canActivate: [authGuard] }
```

### Rutas de Administración
```typescript
{
  path: 'admin',
  canActivate: [adminGuard],
  children: [
    { path: '', component: AdminDashboardComponent },
    { path: 'users', component: AdminUserListComponent },
    { path: 'books', component: AdminBookListComponent }
  ]
}
```

## 🔐 Guards y Seguridad

### Auth Guard
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
```

### Admin Guard
```typescript
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  } else {
    router.navigate(['/']);
    return false;
  }
};
```

## 🌐 Servicios

### API Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Métodos CRUD genéricos
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`);
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`);
  }
}
```

### Auth Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {
    this.loadUserFromStorage();
  }

  login(credentials: any): Observable<any> {
    return this.api.post('auth/login/', credentials).pipe(
      tap(response => {
        this.setCurrentUser(response.user);
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.es_admin || false;
  }
}
```

## 🎨 Componentes Principales

### Header Component
```typescript
@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  currentUser: any = null;
  isMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
```

### Book List Component
```typescript
@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.html',
  styleUrls: ['./book-list.css']
})
export class BookListComponent implements OnInit {
  books: any[] = [];
  filteredBooks: any[] = [];
  genres: any[] = [];
  searchTerm = '';
  selectedGenre = '';
  loading = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadBooks();
    this.loadGenres();
  }

  loadBooks() {
    this.loading = true;
    this.api.get('libros/').subscribe({
      next: (response: any) => {
        this.books = response.results || response;
        this.filteredBooks = [...this.books];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading books:', error);
        this.loading = false;
      }
    });
  }

  filterBooks() {
    this.filteredBooks = this.books.filter(book => {
      const matchesSearch = book.titulo.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           book.autor.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesGenre = !this.selectedGenre || book.id_genero.toString() === this.selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }
}
```

## 🗺️ Integración con Google Maps

### Map Loader Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class MapLoaderService {
  private mapLoaded = false;

  loadGoogleMaps(): Promise<any> {
    if (this.mapLoaded) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.onload = () => {
        this.mapLoaded = true;
        resolve(true);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}
```

### Meeting Points Component
```typescript
@Component({
  selector: 'app-meeting-points',
  templateUrl: './meeting-points.html',
  styleUrls: ['./meeting-points.css']
})
export class MeetingPointsComponent implements OnInit {
  @ViewChild(GoogleMap) map!: GoogleMap;
  
  center: google.maps.LatLngLiteral = { lat: -33.4489, lng: -70.6693 }; // Santiago
  zoom = 12;
  markers: any[] = [];
  meetingPoints: any[] = [];

  constructor(
    private api: ApiService,
    private mapLoader: MapLoaderService
  ) {}

  async ngOnInit() {
    await this.mapLoader.loadGoogleMaps();
    this.loadMeetingPoints();
  }

  loadMeetingPoints() {
    this.api.get('puntos-encuentro/').subscribe({
      next: (points: any) => {
        this.meetingPoints = points;
        this.createMarkers();
      }
    });
  }

  createMarkers() {
    this.markers = this.meetingPoints.map(point => ({
      position: { lat: parseFloat(point.latitud), lng: parseFloat(point.longitud) },
      title: point.nombre,
      info: point
    }));
  }
}
```

## 📊 Gráficos y Visualizaciones

### Admin Dashboard con NgX Charts
```typescript
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
  // Datos para gráficos
  userRegistrationData: any[] = [];
  exchangeStatusData: any[] = [];
  booksByGenreData: any[] = [];

  // Configuración de gráficos
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.api.get('admin/summary/').subscribe({
      next: (data: any) => {
        this.processChartData(data);
      }
    });
  }

  processChartData(data: any) {
    // Procesar datos para los gráficos
    this.userRegistrationData = data.user_registration_by_month;
    this.exchangeStatusData = data.exchange_status_distribution;
    this.booksByGenreData = data.books_by_genre;
  }
}
```

## 💬 Sistema de Chat

### Chat Conversation Component
```typescript
@Component({
  selector: 'app-chat-conversation',
  templateUrl: './chat-conversation.html',
  styleUrls: ['./chat-conversation.css']
})
export class ChatConversationComponent implements OnInit, OnDestroy {
  conversationId!: number;
  messages: any[] = [];
  newMessage = '';
  currentUser: any;
  private messagePolling?: any;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.conversationId = +this.route.snapshot.params['id'];
    this.currentUser = this.authService.getCurrentUser();
    this.loadMessages();
    this.startMessagePolling();
  }

  ngOnDestroy() {
    if (this.messagePolling) {
      clearInterval(this.messagePolling);
    }
  }

  loadMessages() {
    this.api.get(`conversaciones/${this.conversationId}/mensajes/`).subscribe({
      next: (messages: any) => {
        this.messages = messages;
        this.scrollToBottom();
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const messageData = {
      cuerpo: this.newMessage,
      id_conversacion: this.conversationId
    };

    this.api.post(`conversaciones/${this.conversationId}/mensajes/`, messageData).subscribe({
      next: () => {
        this.newMessage = '';
        this.loadMessages();
      }
    });
  }

  startMessagePolling() {
    this.messagePolling = setInterval(() => {
      this.loadMessages();
    }, 3000); // Actualizar cada 3 segundos
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
}
```

## 🎨 Estilos y Temas

### Variables CSS Globales
```css
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --accent-color: #e74c3c;
  --success-color: #27ae60;
  --warning-color: #f39c12;
  --danger-color: #e74c3c;
  --light-color: #ecf0f1;
  --dark-color: #2c3e50;
  --border-radius: 8px;
  --box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* Utilidades */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background-color: #34495e;
}

.card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 20px;
  margin-bottom: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.error {
  color: var(--danger-color);
  background-color: #fdf2f2;
  border: 1px solid #fecaca;
  padding: 10px;
  border-radius: var(--border-radius);
  margin: 10px 0;
}

.success {
  color: var(--success-color);
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 10px;
  border-radius: var(--border-radius);
  margin: 10px 0;
}
```

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile First */
.container {
  padding: 0 15px;
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    max-width: 750px;
    margin: 0 auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
  }
}

/* Grid System */
.row {
  display: flex;
  flex-wrap: wrap;
  margin: 0 -15px;
}

.col {
  flex: 1;
  padding: 0 15px;
}

.col-md-6 {
  width: 100%;
}

@media (min-width: 768px) {
  .col-md-6 {
    width: 50%;
  }
}
```

## 🔧 Interceptores HTTP

### Auth Interceptor
```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq);
    }
    
    return next.handle(req);
  }
}
```

## 🧪 Testing

### Configuración de Testing
```typescript
// karma.conf.js
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
```

### Ejemplo de Test
```typescript
describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ApiService', ['get']);

    await TestBed.configureTestingModule({
      declarations: [BookListComponent],
      providers: [
        { provide: ApiService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load books on init', () => {
    const mockBooks = [{ id: 1, titulo: 'Test Book' }];
    apiService.get.and.returnValue(of({ results: mockBooks }));

    component.ngOnInit();

    expect(apiService.get).toHaveBeenCalledWith('libros/');
    expect(component.books).toEqual(mockBooks);
  });
});
```

## 🚀 Build y Deployment

### Comandos de Build
```bash
# Desarrollo
ng serve

# Build de producción
ng build --configuration production

# Tests
ng test

# Linting
ng lint

# Análisis de bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/stats.json
```

### Configuración de Entornos
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.up.railway.app/api',
  googleMapsApiKey: 'tu-google-maps-api-key'
};

// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  googleMapsApiKey: 'tu-google-maps-api-key'
};
```

## 📊 Performance

### Lazy Loading
```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [adminGuard]
  }
];
```

### OnPush Change Detection
```typescript
@Component({
  selector: 'app-book-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`
})
export class BookCardComponent {
  @Input() book!: any;
  
  constructor(private cdr: ChangeDetectorRef) {}
}
```

## 🔍 SEO y Accesibilidad

### Meta Tags
```typescript
constructor(
  private meta: Meta,
  private title: Title
) {}

ngOnInit() {
  this.title.setTitle('Cambioteca - Intercambio de Libros');
  this.meta.updateTag({ name: 'description', content: 'Plataforma para intercambiar libros de manera segura' });
  this.meta.updateTag({ property: 'og:title', content: 'Cambioteca' });
}
```

### Accesibilidad
```html
<!-- Uso correcto de ARIA labels -->
<button 
  [attr.aria-label]="'Marcar ' + book.titulo + ' como favorito'"
  (click)="toggleFavorite(book)">
  <i class="fas fa-heart" [class.text-red-500]="book.is_favorite"></i>
</button>

<!-- Navegación por teclado -->
<div 
  class="book-card" 
  tabindex="0"
  (keydown.enter)="viewBook(book)"
  (keydown.space)="viewBook(book)">
</div>
```

---

**Cambioteca Frontend** - Interfaz moderna para intercambio de libros 🎨📚