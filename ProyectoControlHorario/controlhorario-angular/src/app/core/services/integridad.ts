import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IntegridadResponse } from '../models/integridad.model';

@Injectable({
  providedIn:  'root'
})
export class IntegridadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Verificar integridad de fichajes
   */
  verificarIntegridadFichajes(
    departamento: string, 
    pagina: number = 0, 
    elementosPorPagina: number = 5
  ): Observable<IntegridadResponse[]> {
    const params = new HttpParams()
      .set('departamento', departamento)
      .set('pagina', pagina.toString())
      .set('elementosPorPagina', elementosPorPagina. toString());

    return this.http.get<IntegridadResponse[]>(
      `${this.apiUrl}/verificarIntegridadFichajes`, 
      { params }
    );
  }

  /**
   * Verificar integridad de ediciones
   */
  verificarIntegridadEdiciones(
    departamento: string, 
    pagina: number = 0, 
    elementosPorPagina: number = 5
  ): Observable<IntegridadResponse[]> {
    const params = new HttpParams()
      .set('departamento', departamento)
      .set('pagina', pagina.toString())
      .set('elementosPorPagina', elementosPorPagina.toString());

    return this.http.get<IntegridadResponse[]>(
      `${this.apiUrl}/verificarIntegridadEdiciones`, 
      { params }
    );
  }
}
