import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fichaje, FichajeResponse } from '../models/fichaje.model';

@Injectable({
  providedIn: 'root'
})
export class FichajeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  fichar(): Observable<FichajeResponse> {
    return this.http.post<FichajeResponse>(`${this.apiUrl}/fichar`, {});
  }

  // Obtener fichajes del usuario autenticado (Empleado, Supervisor)
  obtenerFichajes(): Observable<Fichaje[]> {
    return this.http.get<Fichaje[]>(`${this.apiUrl}/fichar/usuario`);
  }

  // Obtener fichajes del departamento (Supervisor, Auditor)
  obtenerFichajesPorDepartamento(): Observable<Fichaje[]> {
    return this.http.get<Fichaje[]>(`${this.apiUrl}/fichar/departamento`);
  }

  // Obtener todos los fichajes de todos los departamentos (solo Administrador)
  obtenerTodosFichajes(): Observable<Fichaje[]> {
    return this.http.get<Fichaje[]>(`${this.apiUrl}/fichar/todos`);
  }

  solicitarEdicion(data: { id_fichaje: number, nuevoInstante: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitarEdicion`, data);
  }

  listarSolicitudesPendientes(pagina: number = 0, elementosPorPagina: number = 10, fechaDesde?: string, fechaHasta?: string): Observable<any[]> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('elementosPorPagina', elementosPorPagina.toString());
    
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta);
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/listarSolicitudes`, { params });
  }

  contarSolicitudesTotales(departamento: string): Observable<{ totalSolicitudesDepartamento: number }> {
    const params = new HttpParams().set('departamento', departamento);
    return this.http.get<{ totalSolicitudesDepartamento: number }>(`${this.apiUrl}/contarSolicitudesTotales`, { params });
  }

  aprobarSolicitud(solicitudId: number): Observable<{ msg: string }> {
    const params = new HttpParams().set('solicitudId', solicitudId.toString());
    return this.http.post<{ msg: string }>(`${this.apiUrl}/aprobarSolicitud`, null, { params });
  }

  rechazarSolicitud(solicitudId: number): Observable<{ msg: string }> {
    const params = new HttpParams().set('solicitudId', solicitudId.toString());
    return this.http.post<{ msg: string }>(`${this.apiUrl}/denegarSolicitud`, null, { params });
  }

  // Listar fichajes del usuario con paginación
  listarFichajesUsuario(pagina: number = 0, elementosPorPagina: number = 5, fechaDesde?: string, fechaHasta?: string): Observable<any[]> {
    let params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('elementosPorPagina', elementosPorPagina.toString());
    
    if (fechaDesde) {
      params = params.set('fechaDesde', fechaDesde);
    }
    if (fechaHasta) {
      params = params.set('fechaHasta', fechaHasta);
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/listarFichajesUsuario`, { params });
  }

  // Contar total de fichajes del usuario
  contarFichajesUsuario(username: string, departamento: string): Observable<{ totalFichajesUsuario: number }> {
    const params = new HttpParams()
      .set('username', username)
      .set('departamento', departamento);
    return this.http.get<{ totalFichajesUsuario: number }>(`${this.apiUrl}/contarFichajesUsuario`, { params });
  }

  // Obtener el último fichaje del usuario
  obtenerUltimoFichaje(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ultimoFichaje`);
  }
}
