export interface Fichaje {
  id?: number;
  usuario: string;
  fechaHora: string;
  departamento?: string;
  tipo?: string;
  hash?: string;
  hashPrevio?: string;
  editado?: boolean;
  fechaEdicion?: string;
  motivoEdicion?: string;
}

export interface FichajeResponse {
  instante: string;
  tipo: string;
  username: string;
  departamento: string;
  mensaje: string;
}
