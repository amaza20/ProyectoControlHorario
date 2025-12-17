import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FichajeService } from '../../../core/services/fichaje';
import { AuthService } from '../../../core/services/auth.service';
import { SolicitudEdicion } from '../../../core/models/fichaje.model';
import { FechaLocalPipe } from '../../../shared/pipes/fecha-local-pipe';

@Component({
  selector: 'app-aprobar-solicitudes',
  standalone: true,
  imports:  [CommonModule, FechaLocalPipe],
  templateUrl:  './aprobar-solicitudes.html',
  styleUrls: ['./aprobar-solicitudes.css']
})
export class AprobarSolicitudesComponent implements OnInit {
  solicitudes: SolicitudEdicion[] = [];
  paginaActual = 0;
  elementosPorPagina = 5;
  hayMasPaginas = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fichajeService: FichajeService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.fichajeService.listarSolicitudes(this.paginaActual, this.elementosPorPagina).subscribe({
      next: (solicitudes) => {
        this.isLoading = false;
        this.solicitudes = solicitudes;
        this.hayMasPaginas = solicitudes.length === this.elementosPorPagina;
      },
      error:  (error) => {
        this.isLoading = false;
        console.error('Error al cargar solicitudes:', error);
        this.errorMessage = '❌ Error al cargar solicitudes';
      }
    });
  }

  aprobarSolicitud(solicitudId: number): void {
    if (!confirm('¿Estás seguro de que deseas aprobar esta solicitud? ')) {
      return;
    }

    this.fichajeService.aprobarSolicitud(solicitudId).subscribe({
      next: (response) => {
        alert(response.msg || '✅ Solicitud aprobada correctamente');
        this.cargarSolicitudes();
      },
      error: (error) => {
        console.error('Error al aprobar solicitud:', error);
        alert(error.error?.msg || '❌ Error al aprobar solicitud');
      }
    });
  }

  rechazarSolicitud(solicitudId: number): void {
    if (!confirm('¿Estás seguro de que deseas RECHAZAR esta solicitud?')) {
      return;
    }

    this.fichajeService. rechazarSolicitud(solicitudId).subscribe({
      next: (response) => {
        alert(response.msg || '✅ Solicitud rechazada correctamente');
        this.cargarSolicitudes();
      },
      error: (error) => {
        console.error('Error al rechazar solicitud:', error);
        alert(error.error?. msg || '❌ Error al rechazar solicitud');
      }
    });
  }

  getEstadoClass(estado: string): string {
    const estadoUpper = estado.toUpperCase();
    if (estadoUpper === 'APROBADO') return 'estado-aprobado';
    if (estadoUpper === 'RECHAZADO') return 'estado-rechazado';
    if (estadoUpper === 'PENDIENTE') return 'estado-pendiente';
    return '';
  }

  paginaAnterior(): void {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.cargarSolicitudes();
    }
  }

  paginaSiguiente(): void {
    if (this.hayMasPaginas) {
      this.paginaActual++;
      this.cargarSolicitudes();
    }
  }

  cambiarElementosPorPagina(event:  any): void {
    this.elementosPorPagina = parseInt(event.target.value);
    this.paginaActual = 0;
    this.cargarSolicitudes();
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}