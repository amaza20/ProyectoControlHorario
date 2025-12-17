import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RegistroRequest, RegistroResponse } from '../models/usuario.model';

interface CambiarPasswordRequest {
  username: string;
  nuevaPassword: string;
}

interface CambiarPasswordResponse {
  msg: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = environment. apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Registrar nuevo usuario (solo Administrador)
   */
  registrarUsuario(request: RegistroRequest): Observable<RegistroResponse> {
    return this.http.post<RegistroResponse>(`${this.apiUrl}/general/registro`, request);
  }

  /**
   * Cambiar contraseña de usuario (solo Administrador)
   */
  cambiarPassword(request: CambiarPasswordRequest): Observable<CambiarPasswordResponse> {
    return this.http.post<CambiarPasswordResponse>(`${this.apiUrl}/general/cambiarPassword`, request);
  }

  /**
   * Listar usuarios existentes
   */
  listarUsuarios(): Observable<any[]> {
    return this. http.get<any[]>(`${this.apiUrl}/general/listarUsuarios`);
  }
}
