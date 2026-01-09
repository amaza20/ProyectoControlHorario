import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartamentoService } from '../../../core/services/departamento.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DepartamentoExitosoDialogComponent } from '../../../shared/components/departamento-exitoso-dialog/departamento-exitoso-dialog.component';

@Component({
  selector: 'app-crear-departamento',
  standalone: false,
  templateUrl: './crear-departamento.html',
  styleUrl: './crear-departamento.css'
})
export class CrearDepartamento implements OnInit {
  departamentoForm: FormGroup;
  departamentosExistentes: string[] = [];
  message: string = '';
  messageType: 'success' | 'error' = 'success';
  loading: boolean = false;
  nombreUsuario: string = '';

  constructor(
    private fb: FormBuilder,
    private departamentoService: DepartamentoService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.departamentoForm = this.fb.group({
      nombreDepartamento: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[A-Za-zÀ-ÿ0-9\s]+$/)]]
    });
  }

  ngOnInit(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.nombreUsuario = `${userData.username} (${userData.rol})`;
    }
    this.cargarDepartamentosExistentes();
  }

  cargarDepartamentosExistentes(): void {
    this.departamentoService.listarDepartamentos().subscribe({
      next: (depts) => {
        this.departamentosExistentes = depts;
        console.log('Departamentos cargados:', depts);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar departamentos:', error);
        this.showMessage('❌ Error al cargar la lista de departamentos', 'error');
      }
    });
  }

  crearDepartamento(): void {
    if (this.departamentoForm.invalid) {
      this.showMessage('⚠️ Por favor completa correctamente el campo', 'error');
      return;
    }

    this.loading = true;
    const nombreDepartamento = this.departamentoForm.value.nombreDepartamento.trim();

    this.departamentoService.crearDepartamento(nombreDepartamento).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Mostrar diálogo de éxito
        this.dialog.open(DepartamentoExitosoDialogComponent, {
          data: {
            nombre: nombreDepartamento,
            baseDatos: `departamento_${nombreDepartamento.toLowerCase()}.db`,
            estado: 'Activo y disponible para asignar usuarios'
          },
          width: '500px'
        });
        
        this.showMessage(`✅ Departamento "${nombreDepartamento}" creado exitosamente`, 'success');
        this.departamentoForm.reset();
        // Recargar lista de departamentos
        setTimeout(() => this.cargarDepartamentosExistentes(), 500);
      },
      error: (error) => {
        this.loading = false;
        const mensaje = error.error?.msg || error.message || 'Error al crear departamento';
        this.showMessage(`❌ ${mensaje}`, 'error');
      }
    });
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
}
