import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FichajeService } from '../../../core/services/fichaje.service';
import { AuthService } from '../../../core/services/auth.service';
import { Fichaje } from '../../../core/models/fichaje.model';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { finalize, takeUntil } from 'rxjs/operators';
import { convertirACSV, descargarCSV, generarNombreArchivoCSV } from '../../../shared/utils/csv-utils';
import { formatearFechaLocal } from '../../../shared/utils/date-utils';

@Component({
  selector: 'app-historial',
  standalone: false,
  templateUrl: './historial.html',
  styleUrl: './historial.css',
})
export class Historial implements OnInit, OnDestroy {
  fichajes: any[] = [];
  loading = true;
  errorMessage = '';
  userRole = '';
  username = '';
  departamento = '';
  paginaActual: number = 0;
  elementosPorPagina: number = 5;
  totalPaginas: number = 0;
  totalFichajes: number = 0;
  private destroy$ = new Subject<void>();
  descargandoCSV: boolean = false;

  constructor(
    private fichajeService: FichajeService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    this.userRole = userData?.rol || '';
    this.username = userData?.username || '';
    this.departamento = userData?.departamento || '';
    this.cargarFichajes();
  }

  cargarFichajes(): void {
    this.loading = true;
    this.errorMessage = '';
    
    // Usar switchMap para encadenar las llamadas correctamente
    this.fichajeService.contarFichajesUsuario(this.username, this.departamento)
      .pipe(
        switchMap((data) => {
          this.totalFichajes = data.totalFichajesUsuario || 0;
          this.totalPaginas = Math.ceil(this.totalFichajes / this.elementosPorPagina);

          // Ajustar la página si es necesario
          if (this.totalFichajes === 0 || (this.paginaActual >= this.totalPaginas && this.totalPaginas > 0)) {
            this.paginaActual = Math.max(0, this.totalPaginas - 1);
          }

          // Retornar el observable de fichajes
          return this.fichajeService.listarFichajesUsuario(this.paginaActual, this.elementosPorPagina);
        }),
        finalize(() => {
          // Siempre ocultar el loader cuando termine (éxito o error)
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (fichajes) => {
          this.fichajes = fichajes;
        },
        error: (error) => {
          this.errorMessage = 'Error al cargar fichajes';
          console.error('Error:', error);
        }
      });
  }

  getEstadoClass(fichaje: any): string {
    const aprobado = fichaje.aprobadoEdicion;
    if (!aprobado) {
      return 'original';
    }
    const estadoUpper = String(aprobado).toUpperCase().trim();
    if (estadoUpper === 'PENDIENTE') {
      return 'pendiente';
    } else if (estadoUpper === 'RECHAZADO') {
      return 'rechazado';
    } else if (estadoUpper === 'APROBADO') {
      return 'editado';
    }
    return 'original';
  }

  getEstadoTexto(fichaje: any): string {
    const aprobado = fichaje.aprobadoEdicion;
    if (!aprobado) {
      return '📋 Original';
    }
    const estadoUpper = String(aprobado).toUpperCase().trim();
    if (estadoUpper === 'PENDIENTE') {
      return '⏳ Pendiente';
    } else if (estadoUpper === 'RECHAZADO') {
      return '❌ Rechazado';
    } else if (estadoUpper === 'APROBADO') {
      return '✏️ Editado';
    }
    return '📋 Original';
  }

  editarFichaje(fichaje: any): void {
    const fichajeId = fichaje.id_fichaje || fichaje.id;
    // Redirigir a la página de solicitar edición con el ID del fichaje
    this.router.navigate(['/fichajes/solicitar-edicion'], { 
      queryParams: { fichajeId: fichajeId } 
    });
  }

  generarPaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i);
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarFichajes();
    }
  }

  cambiarPagina(): void {
    this.cargarFichajes();
  }

  cambiarElementosPorPagina(): void {
    this.paginaActual = 0;
    this.totalPaginas = Math.ceil(this.totalFichajes / this.elementosPorPagina);
    this.cargarFichajes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  descargarCSV(): void {
    this.descargandoCSV = true;
    
    // Calcular cuántas páginas necesitamos para obtener todos los datos
    const paginasNecesarias = Math.ceil(this.totalFichajes / 100); // 100 registros por página
    const solicitudes = [];
    
    // Crear solicitudes para todas las páginas
    for (let i = 0; i < paginasNecesarias; i++) {
      solicitudes.push(
        this.fichajeService.listarFichajesUsuario(i, 100).toPromise()
      );
    }
    
    // Ejecutar todas las solicitudes en paralelo
    Promise.all(solicitudes)
      .then((resultados) => {
        // Combinar todos los resultados
        const todosLosFichajes = resultados.flat();
        
        // Definir columnas para el CSV
        const columnas = [
          { header: 'ID', key: 'id_fichaje' },
          { header: 'Fecha/Hora', key: 'instanteAnterior', transform: (v: string) => formatearFechaLocal(v) },
          { header: 'Tipo', key: 'tipoAnterior' },
          { header: 'Estado', key: 'aprobadoEdicion', transform: (v: any) => {
            if (!v) return 'Original';
            const estado = String(v).toUpperCase().trim();
            if (estado === 'PENDIENTE') return 'Pendiente';
            if (estado === 'RECHAZADO') return 'Rechazado';
            if (estado === 'APROBADO') return 'Editado';
            return 'Original';
          }},
          { header: 'Hash', key: 'hash' }
        ];
        
        // Convertir a CSV
        const csv = convertirACSV(todosLosFichajes, columnas);
        
        // Descargar
        const nombreArchivo = generarNombreArchivoCSV('historial_fichajes');
        descargarCSV(csv, nombreArchivo);
        
        this.descargandoCSV = false;
      })
      .catch((error) => {
        console.error('Error al descargar CSV:', error);
        alert('❌ Error al descargar CSV');
        this.descargandoCSV = false;
      });
  }
}
