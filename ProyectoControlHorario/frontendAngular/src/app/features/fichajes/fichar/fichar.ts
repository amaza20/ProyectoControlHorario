import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { FichajeService } from '../../../core/services/fichaje.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioToken } from '../../../core/models/usuario.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fichar',
  standalone: false,
  templateUrl: './fichar.html',
  styleUrl: './fichar.css',
})
export class Fichar implements OnInit, OnDestroy {
  currentTime: string = '';
  currentDate: string = '';
  currentUser: UsuarioToken | null = null;
  message = '';
  messageType: 'success' | 'error' | '' = '';
  loading = false;
  fichajeReciente = false; // Para evitar fichajes duplicados
  mostrarResultado = false; // Para mostrar el resultado del fichaje
  fichajeExitoso: any = null; // Datos del fichaje exitoso
  private intervalId: any;

  // Nuevas propiedades para estado del último fichaje
  ultimoFichaje: any = null;
  cargandoUltimoFichaje = true;
  textoBoton = '✓ Fichar Ahora';
  botonDeshabilitado = false;
  mostrarBotonCorreccion = false;
  mensajeEstado = '';
  tipoMensaje: 'info' | 'warning' | '' = '';

  constructor(
    private fichajeService: FichajeService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserData();
    this.updateClock();
    this.startClock();
    this.cargarUltimoFichaje();
  }

  ngOnDestroy(): void {
    this.stopClock();
  }

  private startClock(): void {
    // Solo iniciar si no hay un reloj activo
    if (this.intervalId) {
      return;
    }
    
    // Ejecutar el reloj fuera de la zona de Angular para evitar NG0100
    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        // Ejecutar la actualización dentro de la zona de Angular
        this.ngZone.run(() => {
          this.updateClock();
        });
      }, 1000);
    });
  }

  private stopClock(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('es-ES');
    this.currentDate = now.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  cargarUltimoFichaje(): void {
    this.cargandoUltimoFichaje = true;
    
    this.fichajeService.obtenerUltimoFichaje().subscribe({
      next: (response) => {
        console.log('Último fichaje:', response);
        
        if (response.mensaje) {
          // No hay fichajes previos
          this.ultimoFichaje = null;
          this.textoBoton = '✓ Fichar Entrada';
          this.mensajeEstado = 'Este será tu primer fichaje';
          this.tipoMensaje = 'info';
        } else {
          this.ultimoFichaje = response;
          this.determinarEstadoBoton();
        }
        
        this.cargandoUltimoFichaje = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al obtener último fichaje:', error);
        this.cargandoUltimoFichaje = false;
        this.textoBoton = '✓ Fichar Ahora';
        this.cdr.detectChanges();
      }
    });
  }

  determinarEstadoBoton(): void {
    if (!this.ultimoFichaje) return;

    const instanteUTC = this.ultimoFichaje.instante.replace(' ', 'T') + 'Z';
    const fechaUltimoFichaje = new Date(instanteUTC);
    const hoy = new Date();
    
    // Comparar solo fechas (sin horas)
    const fechaUltimoSolo = new Date(fechaUltimoFichaje.getFullYear(), fechaUltimoFichaje.getMonth(), fechaUltimoFichaje.getDate());
    const hoySolo = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    
    const esHoy = fechaUltimoSolo.getTime() === hoySolo.getTime();
    const tipo = this.ultimoFichaje.tipo;

    if (esHoy) {
      // El último fichaje es de hoy
      if (tipo === 'ENTRA') {
        this.textoBoton = '✓ Fichar Salida';
        this.mensajeEstado = `Tu último fichaje fue una ENTRADA hoy a las ${fechaUltimoFichaje.toLocaleTimeString('es-ES')}`;
        this.tipoMensaje = 'info';
        this.botonDeshabilitado = false;
        this.mostrarBotonCorreccion = false;
      } else {
        // SALE
        this.textoBoton = '✓ Fichar Entrada';
        this.mensajeEstado = `Ya tienes un ciclo completo de entrada y salida hoy. Puedes iniciar uno nuevo.`;
        this.tipoMensaje = 'info';
        this.botonDeshabilitado = false;
        this.mostrarBotonCorreccion = false;
      }
    } else {
      // El último fichaje es de un día anterior
      if (tipo === 'ENTRA') {
        // Entrada sin salida - Mostrar botón de corrección
        this.textoBoton = '✓ Fichar';
        this.botonDeshabilitado = true;
        this.mostrarBotonCorreccion = true;
        this.mensajeEstado = `⚠️ Tienes pendiente fichar la salida del ${fechaUltimoFichaje.toLocaleDateString('es-ES')}`;
        this.tipoMensaje = 'warning';
      } else {
        // SALE - Normal, puede fichar entrada
        this.textoBoton = '✓ Fichar Entrada';
        this.mensajeEstado = `Tu último fichaje fue una SALIDA el ${fechaUltimoFichaje.toLocaleDateString('es-ES')}`;
        this.tipoMensaje = 'info';
        this.botonDeshabilitado = false;
        this.mostrarBotonCorreccion = false;
      }
    }
  }

  fichar(): void {
    if (this.fichajeReciente || this.botonDeshabilitado) {
      return; // Evitar fichajes duplicados o cuando está deshabilitado
    }

    this.loading = true;
    this.message = '';
    this.messageType = '';
    this.mostrarResultado = false; // Ocultar resultado anterior

    this.fichajeService.fichar().subscribe({
      next: (response) => {
        console.log('Response recibida:', response);
        
        // Convertir el instante UTC de la respuesta a la zona horaria local
        const instanteUTC = response.instante.replace(' ', 'T') + 'Z'; // Formato ISO con Z para indicar UTC
        const fechaLocal = new Date(instanteUTC);
        
        // Preparar datos del fichaje exitoso
        this.fichajeExitoso = {
          usuario: this.currentUser?.username || '',
          departamento: this.currentUser?.departamento || 'N/A',
          fecha: fechaLocal.toLocaleDateString('es-ES'),
          hora: fechaLocal.toLocaleTimeString('es-ES'),
          tipo: response.tipo || 'Fichaje',
          mensaje: response.mensaje || '✅ Fichaje registrado correctamente'
        };
        
        // Resetear loading y mostrar resultado
        this.loading = false;
        this.mostrarResultado = true;
        this.messageType = 'success';
        
        console.log('Loading:', this.loading, 'Mostrar resultado:', this.mostrarResultado);
        console.log('Datos fichaje:', this.fichajeExitoso);
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        
        // Recargar estado del último fichaje
        this.cargarUltimoFichaje();
        
        // Deshabilitar botón y ocultar resultado después de 5 segundos
        this.fichajeReciente = true;
        setTimeout(() => {
          this.fichajeReciente = false;
          this.mostrarResultado = false;
          this.cdr.detectChanges();
          console.log('Ocultando resultado');
        }, 5000);
      },
      error: (error) => {
        this.loading = false;
        this.messageType = 'error';
        this.message = error.error?.mensaje || '❌ Error al registrar fichaje';
        this.cdr.detectChanges();
      }
    });
  }

  corregirSalidaPendiente(): void {
    // Fichar automáticamente la salida y redirigir
    this.ficharSalidaAutomatica(this.ultimoFichaje!.instante);
  }

  ficharSalidaAutomatica(instanteEntrada: string): void {
    this.loading = true;
    
    this.fichajeService.fichar().subscribe({
      next: (response) => {
        // Obtener el ID del fichaje directamente desde la respuesta
        const fichajeId = response.idFichaje;

        if (!fichajeId) {
          this.message = 'Error: No se pudo obtener el ID del fichaje';
          this.messageType = 'error';
          this.loading = false;
          return;
        }

        // Calcular solo la fecha sugerida con hora 00:00 (el usuario la cambiará)
        const fechaEntrada = new Date(instanteEntrada.replace(' ', 'T') + 'Z');
        
        // Formatear fecha con hora 00:00 (YYYY-MM-DDTHH:mm) para que el usuario solo cambie la hora
        const year = fechaEntrada.getFullYear();
        const month = String(fechaEntrada.getMonth() + 1).padStart(2, '0');
        const day = String(fechaEntrada.getDate()).padStart(2, '0');
        const fechaPrerellenada = `${year}-${month}-${day}T00:00`;

        // Navegar a solicitar-edición con parámetros
        this.router.navigate(['/fichajes/solicitar-edicion'], {
          queryParams: {
            fichajeId: fichajeId,
            autoCorrection: 'true',
            fechaSugerida: fechaPrerellenada
          }
        });
      },
      error: (error) => {
        this.message = 'Error al fichar automáticamente la salida';
        this.messageType = 'error';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
