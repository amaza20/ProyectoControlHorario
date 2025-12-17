export interface Fichaje {
  id?:  number;
  id_fichaje?:  number;
  username?:  string;
  usuario?: string;
  instanteAnterior?: string;
  nuevoInstante?: string;
  tipoAnterior?: string;
  nuevoTipo?: string;
  aprobadoEdicion?: string;
  solicitudInstante?: string;
  solicitudTipo?: string;
  fechaHora_original?: string;
  fechaHora_editado?: string;
  tipo?:  string;
}

export interface SolicitudEdicion {
  id:  number;
  username: string;
  instante_original: string;
  nuevo_instante: string;
  tipo: string;
  aprobado: string;
}

export interface SolicitarEdicionRequest {
  id_fichaje: number;
  nuevoInstante: string;
}