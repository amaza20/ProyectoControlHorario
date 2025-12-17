import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FichajeService } from '../../../core/services/fichaje';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-fichar',
  standalone: true,
  imports: [CommonModule],
  templateUrl:  './fichar.component.html',
  styleUrls: ['./fichar.component.css']
})
export class FicharComponent {
  successMessage = '';
  errorMessage = '';
  isLoading = false;
  fichajeDetails: any = null;

  constructor(
    private fichajeService: FichajeService,
    private authService: AuthService,
    private router: Router
  ) {}
  

  fichar(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.isLoading = true;

    this.fichajeService.fichar().subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Obtener datos del usuario
        const usuario = this.authService.getCurrentUser();
        const ahora = new Date();

        // Preparar detalles del fichaje
        this.fichajeDetails = {
          usuario: usuario?. username,
          departamento: usuario?.departamento || 'N/A',
          fecha: ahora.toLocaleDateString('es-ES'),
          hora: ahora.toLocaleTimeString('es-ES'),
          tipo: response.tipo || 'Entrada/Salida',
          estado: 'Guardado en blockchain'
        };

        this.successMessage = response.mensaje || '✅ Fichaje registrado correctamente';
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al fichar:', error);
        
        if (error.error?.mensaje) {
          this.errorMessage = error.error.mensaje;
        } else {
          this.errorMessage = '❌ Error al registrar fichaje';
        }
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  verFichajes(): void {
    this.router.navigate(['/fichajes']);
  }
}