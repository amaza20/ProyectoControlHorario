export interface IntegridadResponse {
  id: number;
  username: string;
  usuario?: string;
  fechaHora_original:  string;
  fechaHora_editado?:  string;
  tipo:  string;
  huellaGuardada:  string;
  huellaCalculada: string;
  mensaje:  string;
  estado?:  string;
}