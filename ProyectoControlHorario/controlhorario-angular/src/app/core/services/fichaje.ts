import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Fichaje, SolicitudEdicion, SolicitarEdicionRequest } from '../models/fichaje.model';

interface FicharResponse {
  mensaje: string;
  tipo?:  string;
}

interface AprobarResponse {
  msg: string;
}

@Injectable({
  providedIn:  'root'
})
export class FichajeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Registrar fichaje (entrada/salida)
   */
  fichar(): Observable<FicharResponse> {
    return this.http.post<FicharResponse>(`${this.apiUrl}/fichar`, {});
  }

  /**
   * Listar fichajes del usuario con paginación
   */
  listarFichajes(pagina: number = 0, elementosPorPagina: number = 5): Observable<Fichaje[]> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('elementosPorPagina', elementosPorPagina. toString());

    return this.http.get<Fichaje[]>(`${this.apiUrl}/listarFichajesUsuario`, { params });
  }

  /**
   * Solicitar edición de un fichaje
   */
  solicitarEdicion(request: SolicitarEdicionRequest): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.apiUrl}/solicitarEdicion`, request);
  }

  /**
   * Listar solicitudes pendientes (para Supervisor)
   */
  listarSolicitudes(pagina: number = 0, elementosPorPagina:  number = 5): Observable<SolicitudEdicion[]> {
    const params = new HttpParams()
      .set('pagina', pagina.toString())
      .set('elementosPorPagina', elementosPorPagina.toString());

    return this.http.get<SolicitudEdicion[]>(`${this.apiUrl}/listarSolicitudes`, { params });
  }

  /**
   * Aprobar solicitud de edición
   */
  aprobarSolicitud(solicitudId: number): Observable<AprobarResponse> {
    const params = new HttpParams().set('solicitudId', solicitudId.toString());
    return this.http.post<AprobarResponse>(`${this.apiUrl}/aprobarSolicitud`, {}, { params });
  }

  /**
   * Rechazar solicitud de edición
   */
  rechazarSolicitud(solicitudId: number): Observable<AprobarResponse> {
    const params = new HttpParams().set('solicitudId', solicitudId.toString());
    return this.http.post<AprobarResponse>(`${this.apiUrl}/denegarSolicitud`, {}, { params });
  }
}