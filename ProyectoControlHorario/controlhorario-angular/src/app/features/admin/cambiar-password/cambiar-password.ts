import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cambiar-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cambiar-password.html',
  styleUrls: ['./cambiar-password.css']
})
export class CambiarPasswordComponent implements OnInit {
  username = '';
  nuevaPassword = '';
  usuarios: any[] = [];
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private usuarioService: UsuarioService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error:  (error) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  seleccionarUsuario(username:  string): void {
    this.username = username;
    // Hacer scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    // Validaciones
    if (!this.username || ! this.nuevaPassword) {
      this.errorMessage = '⚠️ Por favor completa todos los campos';
      return;
    }

    if (this.username.length < 3) {
      this.errorMessage = '⚠️ El nombre de usuario debe tener al menos 3 caracteres';
      return;
    }

    if (this. nuevaPassword.length < 8) {
      this.errorMessage = '⚠️ La contraseña debe tener al menos 8 caracteres';
      return;
    }

    this.isLoading = true;

    this.usuarioService.cambiarPassword({
      username: this.username,
      nuevaPassword: this. nuevaPassword
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Mostrar mensaje de éxito
        let mensaje = '🔑 CONTRASEÑA CAMBIADA EXITOSAMENTE\n\n';
        mensaje += `Usuario: ${this.username}\n`;
        mensaje += `Estado: Contraseña actualizada\n`;
        mensaje += `Información:  El usuario debe usar la nueva contraseña en su próximo login\n`;
        mensaje += '\n✅ Operación completada exitosamente';
        
        alert(mensaje);
        
        this. successMessage = response.msg || '✅ Contraseña cambiada correctamente';
        
        // Limpiar formulario
        this. username = '';
        this.nuevaPassword = '';
      },
      error: (error) => {
        this.isLoading = false;
        console. error('Error al cambiar contraseña:', error);
        
        if (error.error?.msg) {
          this.errorMessage = error.error.msg;
        } else {
          this.errorMessage = '❌ Error al cambiar la contraseña';
        }
        
        alert('❌ ERROR AL CAMBIAR CONTRASEÑA\n\n' + this.errorMessage);
      }
    });
  }

  getColorRol(rol: string): string {
    if (rol === 'Administrador') return '#dc3545';
    if (rol === 'Supervisor') return '#28a745';
    if (rol === 'Auditor') return '#ffc107';
    if (rol === 'Empleado') return '#17a2b8';
    return '#667eea';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  onMouseEnter(event:  Event): void {
    const target = event.currentTarget as HTMLElement;
    target.style.transform = 'translateY(-3px)';
    target.style.boxShadow = '0 4px 10px rgba(0,0,0,0.15)';
  }

  onMouseLeave(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    target.style.transform = 'translateY(0)';
    target.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
  }
}
