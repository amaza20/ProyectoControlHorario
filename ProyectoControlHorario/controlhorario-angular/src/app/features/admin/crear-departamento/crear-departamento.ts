import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DepartamentoService } from '../../../core/services/departamento';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-crear-departamento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-departamento.html',
  styleUrls: ['./crear-departamento.css']
})
export class CrearDepartamentoComponent implements OnInit {
  nombreDepartamento = '';
  departamentos: string[] = [];
  successMessage = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private departamentoService: DepartamentoService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDepartamentos();
  }

  cargarDepartamentos(): void {
    this.departamentoService.listarDepartamentos().subscribe({
      next: (departamentos) => {
        this.departamentos = departamentos;
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
      }
    });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    // Validaciones
    if (!this.nombreDepartamento) {
      this.errorMessage = '⚠️ Por favor ingresa el nombre del departamento';
      return;
    }

    if (this.nombreDepartamento.length < 2) {
      this.errorMessage = '⚠️ El nombre debe tener al menos 2 caracteres';
      return;
    }

    this.isLoading = true;

    this.departamentoService.crearDepartamento(this.nombreDepartamento).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Mostrar mensaje de éxito
        let mensaje = '🏢 DEPARTAMENTO CREADO EXITOSAMENTE\n\n';
        mensaje += `Nombre: ${this.nombreDepartamento}\n`;
        mensaje += `Base de datos: departamento_${this.nombreDepartamento. toLowerCase()}.db\n`;
        mensaje += `Estado:  Activo y disponible para asignar usuarios\n`;
        mensaje += '\n✅ Operación completada exitosamente';
        
        alert(mensaje);
        
        this.successMessage = response. msg || '✅ Departamento creado correctamente';
        
        // Limpiar formulario
        this.nombreDepartamento = '';
        
        // Recargar lista de departamentos
        setTimeout(() => {
          this.cargarDepartamentos();
        }, 500);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear departamento:', error);
        
        if (error.error?.msg) {
          this.errorMessage = error.error.msg;
        } else {
          this.errorMessage = '❌ Error al crear departamento';
        }
        
        alert('❌ ERROR AL CREAR DEPARTAMENTO\n\n' + this.errorMessage);
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}