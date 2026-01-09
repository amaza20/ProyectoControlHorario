import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FichajeService } from '../../../core/services/fichaje.service';
import { convertirLocalAUTC, formatearFechaLocal } from '../../../shared/utils/date-utils';
import { finalize, Subject, takeUntil } from 'rxjs';

// Interfaz para la respuesta del backend de listarFichajesUsuario
interface FichajeParaEdicion {
  id_fichaje: number;
  instanteAnterior: string;
  tipoAnterior: string;
  nuevoInstante: string | null;
  nuevoTipo: string | null;
  solicitudInstante: string | null;
  solicitudTipo: string | null;
  aprobadoEdicion: string | null;
}

@Component({
  selector: 'app-solicitar-edicion',
  standalone: false,
  templateUrl: './solicitar-edicion.html',
  styleUrl: './solicitar-edicion.css',
})
export class SolicitarEdicion implements OnInit, OnDestroy {
  fichajeSeleccionado: FichajeParaEdicion | null = null;
  solicitudForm: FormGroup;
  loading = false;
  loadingFichaje = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  fichajeId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private fichajeService: FichajeService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.solicitudForm = this.fb.group({
      nuevoFechaHora: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Obtener el fichajeId de los queryParams
    this.route.queryParams.subscribe(params => {
      const id = params['fichajeId'];
      const autoCorrection = params['autoCorrection'];
      const fechaSugerida = params['fechaSugerida'];
      
      if (id) {
        this.fichajeId = parseInt(id);
        this.cargarFichaje();

        // Si viene de una corrección automática, pre-rellenar el formulario
        if (autoCorrection === 'true' && fechaSugerida) {
          // Esperar a que el formulario esté listo
          setTimeout(() => {
            this.solicitudForm.patchValue({
              nuevoFechaHora: fechaSugerida
            });
            this.message = 'ℹ️ Fichaje automático creado. Por favor, ajusta la hora de salida correcta.';
            this.messageType = 'success';
            this.cdr.detectChanges();
          }, 100);
        }
      } else {
        // Si no hay fichaje seleccionado, redirigir al historial
        this.message = '⚠️ No has seleccionado ningún fichaje. Redirigiendo...';
        this.messageType = 'error';
        setTimeout(() => {
          this.router.navigate(['/fichajes/historial']);
        }, 2000);
      }
    });
  }

  cargarFichaje(): void {
    if (!this.fichajeId) return;
    
    this.loadingFichaje = true;
    // Cargar suficientes fichajes para encontrar el seleccionado
    this.fichajeService.listarFichajesUsuario(0, 100)
      .pipe(
        finalize(() => {
          this.loadingFichaje = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: FichajeParaEdicion[]) => {
          this.fichajeSeleccionado = data.find(f => f.id_fichaje === this.fichajeId) || null;

          if (!this.fichajeSeleccionado) {
            this.message = '⚠️ No se encontró el fichaje seleccionado';
            this.messageType = 'error';
          }
        },
        error: (error) => {
          this.message = 'Error al cargar el fichaje';
          this.messageType = 'error';
        }
      });
  }

  // Método auxiliar para obtener el instante actual del fichaje (editado o original)
  getInstanteActual(): string {
    if (!this.fichajeSeleccionado) return '';
    const instanteUTC = this.fichajeSeleccionado.nuevoInstante || this.fichajeSeleccionado.instanteAnterior;
    return formatearFechaLocal(instanteUTC);
  }

  // Método auxiliar para obtener el tipo actual del fichaje (editado o original)
  getTipoActual(): string {
    if (!this.fichajeSeleccionado) return '';
    return this.fichajeSeleccionado.nuevoTipo || this.fichajeSeleccionado.tipoAnterior;
  }

  onSubmit(): void {
    if (this.solicitudForm.invalid || !this.fichajeId) {
      this.message = '⚠️ Por favor completa todos los campos correctamente';
      this.messageType = 'error';
      return;
    }

    this.loading = true;
    this.message = '';

    // Convertir la fecha local del usuario a UTC antes de enviar al backend
    const nuevoInstante = convertirLocalAUTC(this.solicitudForm.value.nuevoFechaHora);

    if (!nuevoInstante) {
      this.loading = false;
      this.message = '❌ Fecha inválida';
      this.messageType = 'error';
      return;
    }

    // Enviar solo id_fichaje y nuevoInstante, sin motivo
    const payload = {
      id_fichaje: this.fichajeId,
      nuevoInstante: nuevoInstante
    };

    this.fichajeService.solicitarEdicion(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.messageType = 'success';
          this.message = response.msg || response.mensaje || '✅ Solicitud enviada correctamente. Redirigiendo...';

          setTimeout(() => {
            this.router.navigate(['/fichajes/historial']);
          }, 2000);
        },
        error: (error) => {
          this.messageType = 'error';
          this.message = error.error?.msg || error.error?.mensaje || '❌ Error al enviar solicitud';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
