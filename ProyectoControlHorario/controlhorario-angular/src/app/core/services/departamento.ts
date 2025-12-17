import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface CrearDepartamentoResponse {
  msg: string;
  nombreDepartamento: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Crear nuevo departamento (solo Administrador)
   */
  crearDepartamento(nombreDepartamento: string): Observable<CrearDepartamentoResponse> {
    const params = new HttpParams().set('nombreDepartamento', nombreDepartamento);
    return this.http.post<CrearDepartamentoResponse>(
      `${this.apiUrl}/general/crearDepartamento`, 
      {}, 
      { params }
    );
  }

  /**
   * Listar departamentos existentes
   */
  listarDepartamentos(): Observable<string[]> {
    return this. http.get<string[]>(`${this.apiUrl}/general/listarDepartamentos`);
  }

  /**
   * Listar roles existentes
   */
  listarRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/general/listarRoles`);
  }
}
