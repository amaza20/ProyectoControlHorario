import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FichajeService } from '../../../core/services/fichaje.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { convertirACSV, descargarCSV, generarNombreArchivoCSV } from '../../../shared/utils/csv-utils';
import { formatearFechaLocal } from '../../../shared/utils/date-utils';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { finalize, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-aprobar-solicitudes',
  standalone: false,
  templateUrl: './aprobar-solicitudes.html',
  styleUrl: './aprobar-solicitudes.css'
})
export class AprobarSolicitudes implements OnInit, OnDestroy {
  solicitudes: any[] = [];
  totalSolicitudes: number = 0;
  paginaActual: number = 0;
  elementosPorPagina: number = 5;
  totalPaginas: number = 0;
  loading: boolean = false;
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  departamento: string = '';
  nombreUsuario: string = '';
  descargandoCSV: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fichajeService: FichajeService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.departamento = userData.departamento || '';
      this.nombreUsuario = `${userData.username} (${userData.rol})`;
      this.cargarSolicitudes();
    }
  }

  cargarSolicitudes(): void {
    if (!this.departamento) {
      this.showMessage('⚠️ No se pudo obtener el departamento del usuario', 'error');
      return;
    }

    this.loading = true;

    this.fichajeService.contarSolicitudesTotales(this.departamento)
      .pipe(
        switchMap((data) => {
          this.totalSolicitudes = data.totalSolicitudesDepartamento || 0;
          this.totalPaginas = Math.ceil(this.totalSolicitudes / this.elementosPorPagina);

          if (this.totalSolicitudes === 0 || (this.paginaActual >= this.totalPaginas && this.totalPaginas > 0)) {
            this.paginaActual = Math.max(0, this.totalPaginas - 1);
          }

          return this.fichajeService.listarSolicitudesPendientes(this.paginaActual, this.elementosPorPagina);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (solicitudes) => {
          this.solicitudes = solicitudes;
          if (solicitudes.length === 0 && this.paginaActual === 0) {
            this.showMessage('ℹ️ No hay solicitudes pendientes', 'success');
          }
        },
        error: (error) => {
          const mensaje = error.error?.msg || 'Error al cargar solicitudes';
          this.showMessage(`❌ ${mensaje}`, 'error');
        }
      });
  }

  aprobarSolicitud(solicitudId: number): void {
    if (!confirm('¿Estás seguro de que deseas aprobar esta solicitud?')) {
      return;
    }

    this.fichajeService.aprobarSolicitud(solicitudId).subscribe({
      next: (response) => {
        this.showMessage(`✅ ${response.msg || 'Solicitud aprobada correctamente'}`, 'success');
        setTimeout(() => this.cargarSolicitudes(), 1000);
      },
      error: (error) => {
        const mensaje = error.error?.msg || 'Error al aprobar solicitud';
        this.showMessage(`❌ ${mensaje}`, 'error');
      }
    });
  }

  rechazarSolicitud(solicitudId: number): void {
    if (!confirm('¿Estás seguro de que deseas RECHAZAR esta solicitud?')) {
      return;
    }

    this.fichajeService.rechazarSolicitud(solicitudId).subscribe({
      next: (response) => {
        this.showMessage(`✅ ${response.msg || 'Solicitud rechazada correctamente'}`, 'success');
        setTimeout(() => this.cargarSolicitudes(), 1000);
      },
      error: (error) => {
        const mensaje = error.error?.msg || 'Error al rechazar solicitud';
        this.showMessage(`❌ ${mensaje}`, 'error');
      }
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina < 0 || nuevaPagina >= this.totalPaginas) return;
    this.paginaActual = nuevaPagina;
    this.cargarSolicitudes();
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

  generarPaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i);
  }

  irAPagina(pagina: number): void {
    if (pagina >= 0 && pagina < this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarSolicitudes();
    }
  }

  cambiarPaginaDirecta(): void {
    this.cargarSolicitudes();
  }

  cambiarElementosPorPagina(): void {
    this.paginaActual = 0;
    this.cargarSolicitudes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  descargarCSV(): void {
    if (this.totalSolicitudes === 0) {
      alert('⚠️ No hay solicitudes para descargar');
      return;
    }

    this.descargandoCSV = true;

    const paginasNecesarias = Math.ceil(this.totalSolicitudes / 100);
    const solicitudesCalls: Promise<any>[] = [];

    for (let i = 0; i < paginasNecesarias; i++) {
      solicitudesCalls.push(this.fichajeService.listarSolicitudesPendientes(i, 100).toPromise());
    }

    Promise.all(solicitudesCalls)
      .then((resultados) => {
        const todasLasSolicitudes = resultados
          .filter(r => r !== undefined && Array.isArray(r))
          .flatMap((r: any) => r);

        const columnas = [
          { header: 'ID Solicitud', key: 'id' },
          { header: 'Usuario', key: 'username' },
          { header: 'Instante Original', key: 'instante_original', transform: (v: string) => formatearFechaLocal(v) },
          { header: 'Nuevo Instante', key: 'nuevo_instante', transform: (v: string) => formatearFechaLocal(v) },
          { header: 'Tipo', key: 'tipo' },
          { header: 'Estado', key: 'aprobado', transform: (v: string) => {
            const val = (v || '').toString().toUpperCase();
            if (val === 'APROBADO') return 'Aprobada';
            if (val === 'RECHAZADO') return 'Rechazada';
            return 'Pendiente';
          } }
        ];

        const csv = convertirACSV(todasLasSolicitudes, columnas);
        const nombreArchivo = generarNombreArchivoCSV(`solicitudes_pendientes_${this.departamento || 'all'}`);
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
