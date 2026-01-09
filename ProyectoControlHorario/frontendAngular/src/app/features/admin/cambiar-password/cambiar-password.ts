import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cambiar-password',
  standalone: false,
  templateUrl: './cambiar-password.html',
  styleUrl: './cambiar-password.css'
})
export class CambiarPassword implements OnInit {
  passwordForm: FormGroup;
  usuariosExistentes: any[] = [];
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  loading: boolean = false;
  nombreUsuario: string = '';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.passwordForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.nombreUsuario = `${userData.username} (${userData.rol})`;
    }
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuariosExistentes = usuarios;
        console.log('Usuarios cargados:', usuarios);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.showMessage('❌ Error al cargar la lista de usuarios', 'error');
      }
    });
  }

  cambiarPassword(): void {
    if (this.passwordForm.invalid) {
      this.showMessage('⚠️ Por favor completa todos los campos correctamente', 'error');
      return;
    }

    this.loading = true;
    const data = this.passwordForm.value;

    this.usuarioService.cambiarPassword(data).subscribe({
      next: (response) => {
        this.showMessage(`✅ Contraseña de "${data.username}" cambiada exitosamente`, 'success');
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        const mensaje = error.error?.msg || error.message || 'Error al cambiar contraseña';
        this.showMessage(`❌ ${mensaje}`, 'error');
      }
    });
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  volverDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  seleccionarUsuario(username: string): void {
    this.passwordForm.patchValue({ username });
  }
}
