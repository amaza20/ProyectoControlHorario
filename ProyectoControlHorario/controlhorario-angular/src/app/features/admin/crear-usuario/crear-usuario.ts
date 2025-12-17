import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../core/services/usuario';
import { DepartamentoService } from '../../../core/services/departamento';
import { AuthService } from '../../../core/services/auth.service';
import { RegistroRequest } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-usuario.html',
  styleUrls: ['./crear-usuario.css']
})
export class CrearUsuarioComponent implements OnInit {
  username = '';
  password = '';
  rol = '';
  departamento = '';
  
  roles:  string[] = [];
  departamentos: string[] = [];
  usuarios: any[] = [];
  
  mostrarDepartamento = false;
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private usuarioService: UsuarioService,
    private departamentoService:  DepartamentoService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarDepartamentos();
    this.cargarUsuarios();
  }

  cargarRoles(): void {
    this.departamentoService.listarRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error al cargar roles:', error);
      }
    });
  }

  cargarDepartamentos(): void {
    this.departamentoService.listarDepartamentos().subscribe({
      next: (departamentos) => {
        this.departamentos = departamentos;
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
      }
    });
  }

  cargarUsuarios(): void {
    this.usuarioService. listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console. error('Error al cargar usuarios:', error);
      }
    });
  }

  onRolChange(): void {
    // Mostrar campo de departamento solo si NO es Administrador
    this.mostrarDepartamento = this.rol !== 'Administrador';
    
    // Si es Administrador, limpiar departamento
    if (this.rol === 'Administrador') {
      this.departamento = '';
    }
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    // Validaciones
    if (!this.username || !this.password || !this. rol) {
      this.errorMessage = '⚠️ Por favor completa todos los campos obligatorios';
      return;
    }

    if (this. username.length < 3) {
      this.errorMessage = '⚠️ El nombre de usuario debe tener al menos 3 caracteres';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = '⚠️ La contraseña debe tener al menos 8 caracteres';
      return;
    }

    // Validar departamento si NO es Administrador
    if ((this.rol === 'Empleado' || this.rol === 'Supervisor' || this.rol === 'Auditor') && !this.departamento) {
      this.errorMessage = '⚠️ Este rol requiere un departamento';
      return;
    }

    this.isLoading = true;

    const request: RegistroRequest = {
      username: this.username,
      password: this.password,
      rol: this.rol,
      departamento: this.rol === 'Administrador' ? undefined : this.departamento
    };

    this.usuarioService. registrarUsuario(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Mostrar mensaje de éxito
        let mensaje = '👤 USUARIO CREADO EXITOSAMENTE\n\n';
        mensaje += `Usuario: ${response.username}\n`;
        mensaje += `Rol: ${response.rol}\n`;
        if (response.departamento) {
          mensaje += `Departamento: ${response.departamento}\n`;
        }
        mensaje += '\n✅ Operación completada exitosamente';
        
        alert(mensaje);
        
        this.successMessage = response.msg || '✅ Usuario registrado correctamente';
        
        // Limpiar formulario
        this.username = '';
        this.password = '';
        this.rol = '';
        this.departamento = '';
        this.mostrarDepartamento = false;
        
        // Recargar lista de usuarios
        this.cargarUsuarios();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear usuario:', error);
        
        if (error.error?.msg) {
          this.errorMessage = error.error.msg;
        } else {
          this.errorMessage = '❌ Error al crear usuario';
        }
        
        alert('❌ ERROR AL CREAR USUARIO\n\n' + this.errorMessage);
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

  seleccionarUsuario(username: string): void {
    // Aquí podrías implementar lógica adicional si lo necesitas
    console.log('Usuario seleccionado:', username);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
