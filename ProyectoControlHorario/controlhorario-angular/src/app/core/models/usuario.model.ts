export interface Usuario {
  username: string;
  rol: string;
  departamento?:  string;
}

export interface LoginRequest {
  username: string;
  password: string;
  recaptchaToken:  string;
}

export interface LoginResponse {
  token: string;
  mensaje: string;
  username?:  string;
}

export interface RegistroRequest {
  username:  string;
  password: string;
  rol: string;
  departamento?:  string;
}

export interface RegistroResponse {
  msg: string;
  username:  string;
  rol: string;
  departamento?: string;
}