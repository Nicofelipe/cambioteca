import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  regiones: any[] = [];
  comunas: any[] = [];
  selectedFile: File | null = null;

  isLoading = false;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.cargarRegiones();
  }

  initForm() {
    this.registerForm = this.fb.group({
      rut: ['', [Validators.required, this.rutValidator]],
      nombres: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido_paterno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido_materno: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      nombre_usuario: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^(\+56)?[0-9]{9}$/)]],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
      numeracion: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      region: [null, Validators.required],
      comuna: [null, Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      password2: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador personalizado para RUT chileno
  rutValidator(control: AbstractControl): ValidationErrors | null {
    const rut = control.value;
    if (!rut) return null;

    // Limpiar el RUT
    const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');
    
    if (rutLimpio.length < 8 || rutLimpio.length > 9) {
      return { rutInvalido: 'El RUT debe tener entre 8 y 9 caracteres' };
    }

    const cuerpo = rutLimpio.slice(0, -1);
    const digitoVerificador = rutLimpio.slice(-1).toUpperCase();

    // Validar que el cuerpo sea numérico
    if (!/^\d+$/.test(cuerpo)) {
      return { rutInvalido: 'El cuerpo del RUT debe ser numérico' };
    }

    // Calcular dígito verificador
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : String(11 - resto);

    if (digitoVerificador !== dvCalculado) {
      return { rutInvalido: 'El dígito verificador no es válido' };
    }

    return null;
  }

  // Validador de fortaleza de contraseña
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;

    const errors: string[] = [];

    if (!/[A-Z]/.test(password)) {
      errors.push('una mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('una minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('un número');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('un carácter especial');
    }

    if (errors.length > 0) {
      return { passwordDebil: `Debe incluir: ${errors.join(', ')}` };
    }

    return null;
  }

  // Validador de coincidencia de contraseñas
  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const contrasena = form.get('contrasena')?.value;
    const password2 = form.get('password2')?.value;

    if (contrasena && password2 && contrasena !== password2) {
      form.get('password2')?.setErrors({ noCoincide: true });
      return { noCoincide: true };
    }
    return null;
  }

  // Método helper para obtener errores de un campo
  getErrorMessage(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    // Mensajes personalizados por campo
    const mensajes: { [key: string]: { [error: string]: string } } = {
      rut: {
        required: 'El RUT es obligatorio',
        rutInvalido: errors['rutInvalido'] || 'RUT inválido'
      },
      nombres: {
        required: 'El nombre es obligatorio',
        minlength: 'El nombre debe tener al menos 2 caracteres',
        pattern: 'El nombre solo puede contener letras'
      },
      apellido_paterno: {
        required: 'El apellido paterno es obligatorio',
        minlength: 'Debe tener al menos 2 caracteres',
        pattern: 'Solo puede contener letras'
      },
      apellido_materno: {
        required: 'El apellido materno es obligatorio',
        minlength: 'Debe tener al menos 2 caracteres',
        pattern: 'Solo puede contener letras'
      },
      nombre_usuario: {
        required: 'El nombre de usuario es obligatorio',
        minlength: 'Debe tener al menos 4 caracteres',
        pattern: 'Solo letras, números y guión bajo'
      },
      email: {
        required: 'El email es obligatorio',
        email: 'Ingresa un email válido'
      },
      telefono: {
        required: 'El teléfono es obligatorio',
        pattern: 'Formato: 912345678 o +56912345678'
      },
      direccion: {
        required: 'La dirección es obligatoria',
        minlength: 'Debe tener al menos 5 caracteres'
      },
      numeracion: {
        required: 'La numeración es obligatoria',
        pattern: 'Solo números permitidos'
      },
      region: {
        required: 'Selecciona una región'
      },
      comuna: {
        required: 'Selecciona una comuna'
      },
      contrasena: {
        required: 'La contraseña es obligatoria',
        minlength: 'Debe tener al menos 8 caracteres',
        passwordDebil: errors['passwordDebil'] || 'Contraseña muy débil'
      },
      password2: {
        required: 'Confirma tu contraseña',
        noCoincide: 'Las contraseñas no coinciden'
      }
    };

    const fieldMessages = mensajes[fieldName];
    if (!fieldMessages) return 'Campo inválido';

    for (const errorKey of Object.keys(errors)) {
      if (fieldMessages[errorKey]) {
        return fieldMessages[errorKey];
      }
    }

    return 'Campo inválido';
  }

  // Verificar si un campo es inválido y tocado
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  cargarRegiones() {
    this.apiService.getRegiones().subscribe(data => {
      this.regiones = data;
    });
  }

  onRegionChange() {
    this.comunas = [];
    this.registerForm.get('comuna')?.setValue(null);
    const regionId = this.registerForm.get('region')?.value;
    
    if (regionId) {
      this.apiService.getComunas(regionId).subscribe(data => {
        this.comunas = data;
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.showToast('Solo se permiten imágenes (JPG, PNG, GIF, WEBP)', 'error');
        event.target.value = '';
        return;
      }
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showToast('La imagen no debe superar los 5MB', 'error');
        event.target.value = '';
        return;
      }
      this.selectedFile = file;
    }
  }

  showToast(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    
    setTimeout(() => {
      this.toastMessage = null;
    }, 4000);
  }

  onSubmit() {
    // Marcar todos los campos como tocados para mostrar errores
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.showToast('Por favor, corrige los errores en el formulario', 'error');
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    const formValue = this.registerForm.value;

    Object.entries(formValue).forEach(([key, value]) => {
      if (key !== 'region' && key !== 'password2' && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (this.selectedFile) {
      formData.append('imagen_perfil', this.selectedFile, this.selectedFile.name);
    }

    console.log('Enviando FormData al backend...');
    
    this.apiService.registerUser(formData).subscribe({
      next: (response) => {
        console.log('Usuario registrado:', response);
        this.showToast('¡Gracias por registrarte! Redirigiendo al login...', 'success');
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        this.isLoading = false;
        
        let errorMessage = 'Hubo un error en el registro.';
        if (err.error) {
          const firstError = Object.values(err.error)[0];
          if (typeof firstError === 'string') {
            errorMessage = firstError;
          } else if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          } else if (err.error.detail) {
            errorMessage = err.error.detail;
          }
        }
        this.showToast(errorMessage, 'error');
      }
    });
  }
}