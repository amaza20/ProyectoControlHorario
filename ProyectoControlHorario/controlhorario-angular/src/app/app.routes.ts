import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard';
import { RoleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  // Ruta raíz - Index/Landing
  {
    path: '',
    loadComponent: () => import('./features/auth/index/index').then(m => m.IndexComponent)
  },
  
  // Login
  {
    path: 'login',
    loadComponent:  () => import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  
  // Dashboard (requiere autenticación)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  
  // Fichajes (Empleado y Supervisor)
  {
    path: 'fichar',
    loadComponent: () => import('./features/fichajes/fichar/fichar').then(m => m.FicharComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Empleado', 'Supervisor'] }
  },
  {
    path: 'fichajes',
    loadComponent: () => import('./features/fichajes/lista-fichajes/lista-fichajes').then(m => m.ListaFichajesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data:  { roles: ['Empleado', 'Supervisor'] }
  },
  {
    path:  'editar',
    loadComponent: () => import('./features/fichajes/editar-fichaje/editar-fichaje').then(m => m.EditarFichajeComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Empleado', 'Supervisor'] }
  },
  
  // Supervisor
  {
    path: 'aprobar-solicitudes',
    loadComponent:  () => import('./features/supervisor/aprobar-solicitudes/aprobar-solicitudes').then(m => m.AprobarSolicitudesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Supervisor'] }
  },
  
  // Integridad (Auditor, Supervisor, Administrador)
  {
    path: 'verificar-integridad',
    loadComponent:  () => import('./features/integridad/verificar-fichajes/verificar-fichajes').then(m => m.VerificarFichajesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Auditor', 'Supervisor', 'Administrador'] }
  },
  {
    path: 'verificar-integridad-ediciones',
    loadComponent:  () => import('./features/integridad/verificar-ediciones/verificar-ediciones').then(m => m.VerificarEdicionesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Auditor', 'Supervisor', 'Administrador'] }
  },
  
  // Admin
  {
    path: 'registro',
    loadComponent: () => import('./features/admin/crear-usuario/crear-usuario').then(m => m.CrearUsuarioComponent),
    canActivate: [AuthGuard, RoleGuard],
    data:  { roles: ['Administrador'] }
  },
  {
    path: 'crear-departamento',
    loadComponent: () => import('./features/admin/crear-departamento/crear-departamento').then(m => m.CrearDepartamentoComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles:  ['Administrador'] }
  },
  {
    path:  'cambiar-password',
    loadComponent: () => import('./features/admin/cambiar-password/cambiar-password').then(m => m.CambiarPasswordComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles:  ['Administrador'] }
  },
  
  // Ruta 404
  {
    path: '**',
    redirectTo: ''
  }
];