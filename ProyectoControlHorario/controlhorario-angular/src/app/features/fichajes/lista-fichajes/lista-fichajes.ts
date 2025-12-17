import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FichajeService } from '../../../core/services/fichaje';
import { AuthService } from '../../../core/services/auth.service';
import { Fichaje } from '../../../core/models/fichaje.model';
import { FechaLocalPipe } from '../../../shared/pipes/fecha-local-pipe';

@Component({
  selector: 'app-lista-fichajes',
  standalone: true,
  imports: [CommonModule, FechaLocalPipe],
  templateUrl: './lista-fichajes.component.html',
  styleUrls: ['./lista-fichajes.component.css']
})
export class ListaFichajesComponent implements OnInit {
  fichajes: Fichaje[] = [];
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
    this.cargarFichajes();
  }

  cargarFichajes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.fichajeService.listarFichajes(this.paginaActual, this.elementosPorPagina).subscribe({
      next: (fichajes) => {
        this.isLoading = false;
        this.fichajes = fichajes;
        this.hayMasPaginas = fichajes.length === this.elementosPorPagina;
      },
      error:  (error) => {
        this.isLoading = false;
        console.error('Error al cargar fichajes:', error);
        this.errorMessage = '❌ Error al cargar fichajes';
      }
    });
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

  editarFichaje(fichaje:  Fichaje): void {
    // Guardar el fichaje en localStorage para la página de edición
    const fichajeParaEditar = {
      id: fichaje.id_fichaje || fichaje.id,
      instante: this.getInstanteActual(fichaje),
      tipo: this.getTipoActual(fichaje)
    };
    
    localStorage.setItem('fichajeParaEditar', JSON.stringify(fichajeParaEditar));
    this.router.navigate(['/editar']);
  }

  getInstanteActual(fichaje:  Fichaje): string {
    return fichaje.nuevoInstante || fichaje.instanteAnterior || '';
  }

  getTipoActual(fichaje: Fichaje): string {
    return fichaje.nuevoTipo || fichaje.tipoAnterior || '';
  }

  getEstadoAprobacion(fichaje: Fichaje): string | null {
    const aprobado = fichaje.aprobadoEdicion;
    
    if (aprobado === null || aprobado === undefined) {
      return null;
    }
    
    if (typeof aprobado === 'string') {
      const aprobadoUpper = aprobado.toUpperCase().trim();
      if (aprobadoUpper === 'APROBADO') return 'aprobado';
      if (aprobadoUpper === 'PENDIENTE') return 'pendiente';
      if (aprobadoUpper === 'RECHAZADO') return 'rechazado';
    }
    
    return null;
  }

  puedeEditar(fichaje:  Fichaje): boolean {
    const estado = this.getEstadoAprobacion(fichaje);
    // Solo puede editar si NO está pendiente
    return estado !== 'pendiente';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToFichar(): void {
    this.router.navigate(['/fichar']);
  }
}