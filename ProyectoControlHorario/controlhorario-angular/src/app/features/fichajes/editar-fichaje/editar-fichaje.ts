import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FichajeService } from '../../../core/services/fichaje';
import { AuthService } from '../../../core/services/auth.service';
import { SolicitarEdicionRequest } from '../../../core/models/fichaje.model';

@Component({
  selector: 'app-editar-fichaje',
  standalone: true,
  imports:  [CommonModule, FormsModule],
  templateUrl: './editar-fichaje.component.html',
  styleUrls: ['./editar-fichaje.component. css']
})
export class EditarFichajeComponent implements OnInit {
  fichajeId: number | null = null;
  instanteOriginal = '';
  tipoOriginal = '';
  nuevoInstante = '';
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private fichajeService: FichajeService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Recuperar datos del fichaje desde localStorage
    const fichajeData = localStorage.getItem('fichajeParaEditar');
    
    if (fichajeData) {
      try {
        const fichaje = JSON.parse(fichajeData);
        this.fichajeId = fichaje.id;
        this.instanteOriginal = fichaje.instante;
        this.tipoOriginal = fichaje.tipo;
        
        // Convertir a formato datetime-local
        this.nuevoInstante = this.convertirADatetimeLocal(fichaje.instante);
      } catch (error) {
        console.error('Error al parsear fichaje:', error);
        this.errorMessage = 'Error al cargar datos del fichaje';
      }
    } else {
      this.errorMessage = 'No se encontraron datos del fichaje';
    }
  }

  /**
   * Convierte fecha del formato "16/12/2025, 16:30:00" a "2025-12-16T16:30"
   */
  convertirADatetimeLocal(fechaLocal: string): string {
    try {
      // Parsear "16/12/2025, 16:30:00"
      const partes = fechaLocal.split(', ');
      const [dia, mes, anio] = partes[0].split('/');
      const [hora, minuto] = partes[1].split(': ');
      
      // Formato datetime-local:  "2025-12-16T16:30"
      return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${hora.padStart(2, '0')}:${minuto.padStart(2, '0')}`;
    } catch (error) {
      console.error('Error al convertir fecha:', error);
      return '';
    }
  }

  /**
   * Convierte de datetime-local "2025-12-16T16:30" a UTC "2025-12-16 15:30:00"
   */
  convertirLocalAUTC(instanteLocal: string): string {
    if (!instanteLocal) return '';
    
    try {
      // El input datetime-local devuelve:  "2025-12-16T16:30"
      // JavaScript lo interpreta como hora LOCAL del navegador
      const fechaLocal = new Date(instanteLocal);
      
      // Verificar si es válida
      if (isNaN(fechaLocal.getTime())) {
        console.error('Fecha inválida:', instanteLocal);
        return '';
      }
      
      // Convertir a UTC usando toISOString() y formatear
      const isoUTC = fechaLocal.toISOString(); // "2025-12-16T15:30:00.123Z"
      
      // Formato para el backend: "YYYY-MM-DD HH:mm:ss"
      const instanteUTC = isoUTC.replace('T', ' ').substring(0, 19);
      
      return instanteUTC;
    } catch (error) {
      console.error('Error al convertir a UTC:', error);
      return '';
    }
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    // Validaciones
    if (!this.fichajeId) {
      this.errorMessage = '⚠️ No se ha seleccionado un fichaje válido';
      return;
    }

    if (!this.nuevoInstante) {
      this.errorMessage = '⚠️ Por favor selecciona una fecha y hora';
      return;
    }

    this.isLoading = true;

    // Convertir a UTC
    const nuevoInstanteUTC = this.convertirLocalAUTC(this.nuevoInstante);

    if (! nuevoInstanteUTC) {
      this.errorMessage = '❌ Fecha inválida';
      this.isLoading = false;
      return;
    }

    const request: SolicitarEdicionRequest = {
      id_fichaje: this.fichajeId,
      nuevoInstante: nuevoInstanteUTC
    };

    this.fichajeService.solicitarEdicion(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.msg || '✅ Solicitud de edición registrada correctamente.  Redirigiendo...';
        
        // Limpiar localStorage
        localStorage.removeItem('fichajeParaEditar');
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          this. router.navigate(['/fichajes']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al solicitar edición:', error);
        
        if (error.error?.msg) {
          this.errorMessage = error.error.msg;
        } else {
          this.errorMessage = '❌ Error al solicitar edición';
        }
      }
    });
  }

  cancelar(): void {
    localStorage.removeItem('fichajeParaEditar');
    this.router.navigate(['/fichajes']);
  }
}
