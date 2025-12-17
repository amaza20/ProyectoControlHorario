import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject. asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario del token al iniciar
    this.loadUserFromToken();
  }

  /**
   * Login con validación de reCAPTCHA
   */
  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/general/login`, loginData)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            this.loadUserFromToken();
          }
        })
      );
  }

  /**
   * Verificar si hay sesión activa
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return token !== null;
  }

  /**
   * Obtener token
   */
  getToken(): string | null {
    return localStorage. getItem('authToken');
  }

  /**
   * Decodificar token y obtener datos del usuario
   */
  getUserFromToken(): Usuario | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded:  any = jwtDecode(token);
      return {
        username: decoded.username,
        rol: decoded.rol,
        departamento: decoded.departamento
      };
    } catch (error) {
      console.error('Error al decodificar token:', error);
      return null;
    }
  }

  /**
   * Cargar usuario desde el token
   */
  private loadUserFromToken(): void {
    const user = this.getUserFromToken();
    this.currentUserSubject.next(user);
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    localStorage. removeItem('authToken');
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(roles: string[]): boolean {
    const user = this.getUserFromToken();
    if (!user) return false;
    return roles.includes(user.rol);
  }

  /**
   * Obtener usuario actual (síncrono)
   */
  getCurrentUser(): Usuario | null {
    return this. currentUserSubject.value;
  }
}