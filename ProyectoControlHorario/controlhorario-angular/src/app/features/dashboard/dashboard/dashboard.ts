import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';

interface DashboardOption {
  icon: string;
  title: string;
  description: string;
  route: string;
  color?:  string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  user: Usuario | null = null;
  options: DashboardOption[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    
    if (this.user) {
      this.loadOptions(this.user.rol);
    }
  }

  loadOptions(rol: string): void {
    this.options = [];

    // Opciones para Empleado y Supervisor
    if (rol === 'Empleado' || rol === 'Supervisor') {
      this.options. push(
        {
          icon: '⏰',
          title: 'Fichar',
          description: 'Registra tu entrada o salida',
          route: '/fichar'
        },
        {
          icon: '📋',
          title: 'Ver Fichajes',
          description:  'Consulta tu historial',
          route: '/fichajes'
        }
      );
    }

    // Opciones exclusivas para Supervisor
    if (rol === 'Supervisor') {
      this.options.push(
        {
          icon: '✅',
          title: 'Aprobar Solicitudes',
          description: 'Revisar ediciones pendientes',
          route: '/aprobar-solicitudes'
        },
        {
          icon: '🔐',
          title: 'Verificar Integridad Fichajes',
          description: 'Comprobar blockchain de fichajes',
          route: '/verificar-integridad'
        },
        {
          icon: '🔒',
          title: 'Verificar Integridad Ediciones',
          description: 'Comprobar blockchain de ediciones',
          route: '/verificar-integridad-ediciones'
        }
      );
    }

    // Opciones para Auditor
    if (rol === 'Auditor') {
      this.options.push(
        {
          icon: '🔐',
          title: 'Verificar Integridad',
          description: 'Comprobar autenticidad de fichajes',
          route: '/verificar-integridad'
        },
        {
          icon: '🔒',
          title: 'Verificar Integridad Ediciones',
          description: 'Comprobar blockchain de ediciones',
          route:  '/verificar-integridad-ediciones'
        }
      );
    }

    // Opciones para Administrador
    if (rol === 'Administrador') {
      this.options.push(
        {
          icon: '👤',
          title: 'Registrar Usuario',
          description: 'Crear nuevos usuarios',
          route: '/registro'
        },
        {
          icon: '🏢',
          title: 'Crear Departamento',
          description:  'Agregar nuevos departamentos',
          route: '/crear-departamento'
        },
        {
          icon: '🔑',
          title: 'Cambiar Contraseña',
          description: 'Cambiar contraseña de usuarios',
          route: '/cambiar-password'
        },
        {
          icon: '🔐',
          title: 'Verificar Integridad',
          description: 'Comprobar autenticidad de fichajes',
          route: '/verificar-integridad'
        },
        {
          icon: '🔒',
          title: 'Verificar Integridad Ediciones',
          description:  'Comprobar blockchain de ediciones',
          route: '/verificar-integridad-ediciones'
        }
      );
    }

    // Opción de salir (para todos)
    this.options.push({
      icon: '🚪',
      title: 'Salir',
      description:  'Cerrar sesión',
      route: 'logout',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    });
  }

  navigate(route: string): void {
    if (route === 'logout') {
      this.authService.logout();
    } else {
      this.router.navigate([route]);
    }
  }

  getUserInfo(): string {
    if (! this.user) return '';
    return `Rol: ${this.user.rol}${this.user.departamento ? ' - Departamento: ' + this. user.departamento : ''}`;
  }
}