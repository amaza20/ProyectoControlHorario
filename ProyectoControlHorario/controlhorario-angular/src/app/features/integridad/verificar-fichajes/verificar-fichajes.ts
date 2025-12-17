import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IntegridadService } from '../../../core/services/integridad';
import { DepartamentoService } from '../../../core/services/departamento';
import { AuthService } from '../../../core/services/auth.service';
import { IntegridadResponse } from '../../../core/models/integridad.model';
import { FechaLocalPipe } from '../../../shared/pipes/fecha-local-pipe';

@Component({
  selector: 'app-verificar-fichajes',
  standalone: true,
  imports: [CommonModule, FormsModule, FechaLocalPipe],
  templateUrl: './verificar-fichajes.html',
  styleUrls: ['./verificar-fichajes.css']
})
export class VerificarFichajesComponent implements OnInit {
  departamentos: string[] = [];
  departamentoSeleccionado = '';
  fichajes: IntegridadResponse[] = [];
  paginaActual = 0;
  elementosPorPagina = 5;
  hayMasPaginas = false;
  isLoading = false;
  isLoadingDepartamentos = false;
  errorMessage = '';
  mostrarResultados = false;

  constructor(
    private integridadService: IntegridadService,
    private departamentoService: DepartamentoService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDepartamentosSegunRol();
  }

  cargarDepartamentosSegunRol(): void {
    const user = this.authService.getCurrentUser();
    
    if (! user) {
      this.errorMessage = 'Error: No se pudo obtener datos del usuario';
      return;
    }

    const rol = user.rol;
    const departamentoUsuario = user.departamento;

    this.isLoadingDepartamentos = true;

    // Auditor o Supervisor:  Solo su departamento
    if (rol === 'Auditor' || rol === 'Supervisor') {
      if (! departamentoUsuario) {
        this.errorMessage = `Error: ${rol} sin departamento asignado`;
        this.isLoadingDepartamentos = false;
        return;
      }

      this.departamentos = [departamentoUsuario];
      this.departamentoSeleccionado = departamentoUsuario;
      this.isLoadingDepartamentos = false;
    } 
    // Administrador:  Todos los departamentos
    else if (rol === 'Administrador') {
      this.departamentoService.listarDepartamentos().subscribe({
        next: (departamentos) => {
          this.isLoadingDepartamentos = false;
          this.departamentos = departamentos;
        },
        error: (error) => {
          this.isLoadingDepartamentos = false;
          console.error('Error al cargar departamentos:', error);
          this.errorMessage = 'Error al cargar departamentos';
        }
      });
    } else {
      this.errorMessage = `Rol ${rol} no tiene permisos para verificar integridad`;
      this.isLoadingDepartamentos = false;
    }
  }

  verificarIntegridad(): void {
    if (!this.departamentoSeleccionado) {
      this.errorMessage = '⚠️ Por favor selecciona un departamento';
      return;
    }

    this.paginaActual = 0;
    this.cargarFichajes();
  }

  cargarFichajes(): void {
    this.isLoading = true;
    this. errorMessage = '';
    this.mostrarResultados = false;

    this.integridadService.verificarIntegridadFichajes(
      this.departamentoSeleccionado,
      this. paginaActual,
      this.elementosPorPagina
    ).subscribe({
      next: (fichajes) => {
        this.isLoading = false;
        this.fichajes = fichajes. sort((a, b) => (b.id || 0) - (a.id || 0));
        this.hayMasPaginas = fichajes.length === this.elementosPorPagina;
        this.mostrarResultados = true;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al verificar integridad:', error);
        this.errorMessage = '❌ Error al verificar integridad';
      }
    });
  }

  getCorruptos(): number {
    return this.fichajes. filter(f => this.esCorrupto(f)).length;
  }

  getValidos(): number {
    return this. fichajes.filter(f => ! this.esCorrupto(f)).length;
  }

  esCorrupto(fichaje:  IntegridadResponse): boolean {
    const mensaje = (fichaje.mensaje || fichaje.estado || '').toUpperCase();
    return mensaje. includes('INCONSISTENCIA') || 
           mensaje.includes('CORRUPTO') || 
           mensaje.includes('COMPROMETID') ||
           mensaje.includes('INVÁLIDO') ||
           mensaje. includes('ERROR') ||
           mensaje.includes('DETECTADA');
  }

  huellasCoinciden(fichaje: IntegridadResponse): boolean {
    return fichaje.huellaGuardada === fichaje.huellaCalculada;
  }

  abreviarHuella(huella: string): string {
    return huella.length > 16 ? huella.substring(0, 16) + '...' : huella;
  }

  paginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.cargarFichajes();
    }
  }

  paginaSiguiente(): void {
    if (this.hayMasPaginas) {
      this.paginaActual++;
      this.cargarFichajes();
    }
  }

  cambiarElementosPorPagina(event: any): void {
    this.elementosPorPagina = parseInt(event.target.value);
    this.paginaActual = 0;
    this.cargarFichajes();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}