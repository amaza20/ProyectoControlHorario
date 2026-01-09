import { Component, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { FichajeService } from '../../../core/services/fichaje.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioToken } from '../../../core/models/usuario.model';

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

  constructor(
    private fichajeService: FichajeService,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getUserData();
    this.updateClock();
    this.startClock();
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

  fichar(): void {
    if (this.fichajeReciente) {
      return; // Evitar fichajes duplicados
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
}
