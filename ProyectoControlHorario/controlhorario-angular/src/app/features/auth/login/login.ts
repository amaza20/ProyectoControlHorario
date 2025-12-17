import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RecaptchaService } from '../../../core/services/recaptcha';
import { LoginRequest } from '../../../core/models/usuario.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  username = '';
  password = '';
  recaptchaToken = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  
  private recaptchaWidgetId: number | null = null;

  constructor(
    private authService: AuthService,
    private recaptchaService: RecaptchaService,
    private router:  Router
  ) {}

  ngAfterViewInit(): void {
    // Esperar a que grecaptcha esté listo
    this.waitForRecaptcha();
  }

  ngOnDestroy(): void {
    // Limpiar el widget al destruir el componente
    if (this.recaptchaWidgetId !== null) {
      this.recaptchaService.reset(this.recaptchaWidgetId);
    }
  }

  private waitForRecaptcha(): void {
    const checkInterval = setInterval(() => {
      if (this. recaptchaService.isReady()) {
        clearInterval(checkInterval);
        this.initRecaptcha();
      }
    }, 100);

    // Timeout después de 10 segundos
    setTimeout(() => {
      clearInterval(checkInterval);
      if (this.recaptchaWidgetId === null) {
        this.errorMessage = 'Error al cargar reCAPTCHA. Por favor, recarga la página.';
      }
    }, 10000);
  }

  private initRecaptcha(): void {
    this.recaptchaWidgetId = this.recaptchaService.render(
      'recaptcha-container',
      environment.recaptchaSiteKey,
      (token:  string) => {
        this.recaptchaToken = token;
      }
    );
  }

  onSubmit(): void {
    // Limpiar mensajes
    this.errorMessage = '';
    this.successMessage = '';

    // Validaciones
    if (!this.username || !this.password) {
      this.errorMessage = '⚠️ Por favor ingresa usuario y contraseña';
      return;
    }

    // Obtener token de reCAPTCHA
    this.recaptchaToken = this.recaptchaService.getResponse(this.recaptchaWidgetId || undefined);

    if (!this.recaptchaToken) {
      this.errorMessage = '⚠️ Por favor completa el reCAPTCHA';
      return;
    }

    this.isLoading = true;

    const loginData: LoginRequest = {
      username: this.username,
      password: this.password,
      recaptchaToken: this.recaptchaToken
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.successMessage = '✅ Login exitoso.  Redirigiendo... ';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error:  (error) => {
        this.isLoading = false;
        console.error('Error en login:', error);
        
        if (error.error?.mensaje) {
          this.errorMessage = error.error.mensaje;
        } else if (error.status === 401) {
          this.errorMessage = '❌ Credenciales incorrectas';
        } else {
          this.errorMessage = '❌ Error en el login.  Inténtalo de nuevo. ';
        }
        
        // Resetear reCAPTCHA
        if (this.recaptchaWidgetId !== null) {
          this.recaptchaService. reset(this.recaptchaWidgetId);
        }
        this.recaptchaToken = '';
      }
    });
  }
}