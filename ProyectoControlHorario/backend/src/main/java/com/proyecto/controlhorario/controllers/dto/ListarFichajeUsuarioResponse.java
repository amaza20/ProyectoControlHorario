package com.proyecto.controlhorario.controllers.dto;


public class ListarFichajeUsuarioResponse {
     // Response DTO (lo que devuelves al frontend)

    private int id_fichaje;

    private String instanteAnterior;     // Primer fichaje registrado en la tabla fichajes
    private String tipoAnterior;  

    ///////////////////////////////       

    private String nuevoInstante;        //   Si ha habido una edicion efectiva del fichaje, este sera el nuevo instante
    private String nuevoTipo;            //   Por eso una vez se aprueba una edicion de fichaje, se anade en la tabla fichajes un id_edicion que 
                                         //  es una clave foranea a la tabla ediciones
                                         //   Si nunca ha habido edicion de ese fichaje(id_fichaje), estos campos seran null

    ///////////////////////////////

    private String solicitudInstante;    // Si hay una solicitud PENDIENTE (aprobado=FALSO), este es el instante solicitado
    private String solicitudTipo;        // Si hay una solicitud PENDIENTE (aprobado=FALSO), este es el tipo solicitado
                                         // Estos campos solo se llenan cuando aprobadoEdicion = "FALSO"

    private String aprobadoEdicion;     // Busco en la tabla solicitud_edicion los registros que contienen ese id_fichaje y me quedo con el 
                                        // mas reciente y consulto si el campo aprobado es VERDADERO o FALSO o null (si no existe solicitud de edicion)


    public ListarFichajeUsuarioResponse() {}

    public ListarFichajeUsuarioResponse(int id_fichaje, String instanteAnterior, String tipoAnterior, String nuevoInstante, String nuevoTipo) {
        this.id_fichaje = id_fichaje;
        this.instanteAnterior = instanteAnterior;
        this.tipoAnterior = tipoAnterior; 
        this.nuevoInstante = nuevoInstante;
        this.nuevoTipo = nuevoTipo;
    }

    public String getSolicitudInstante() {
        return solicitudInstante;
    }

    public String getSolicitudTipo() {
        return solicitudTipo;
    }
    public void setSolicitudInstante(String solicitudInstante) {
        this.solicitudInstante = solicitudInstante;
    }
    public void setSolicitudTipo(String solicitudTipo) {
        this.solicitudTipo = solicitudTipo;
    }

    public String getAprobadoEdicion() {
        return aprobadoEdicion;
    }
    
    public void setAprobadoEdicion(String aprobadoEdicion) {
        this.aprobadoEdicion = aprobadoEdicion;
    }


public int getId_fichaje() {  // ← CORREGIDO
        return id_fichaje;
    }

    public void setId_fichaje(int id_fichaje) {  // ← CORREGIDO
        this.id_fichaje = id_fichaje;
    }

    public String getNuevoInstante() {
        return nuevoInstante;
    }
    public void setNuevoInstante(String nuevoInstante) {
        this.nuevoInstante = nuevoInstante;
    }
    public String getNuevoTipo() {
        return nuevoTipo;
    }
    public void setNuevoTipo(String nuevoTipo) {
        this.nuevoTipo = nuevoTipo;
    }

    public String getInstanteAnterior() {
        return instanteAnterior;
    }
    public void setInstanteAnterior(String instanteAnterior) {
        this.instanteAnterior = instanteAnterior;
    }
    public String getTipoAnterior() {
        return tipoAnterior;
    }
    public void setTipoAnterior(String tipoAnterior) {
        this.tipoAnterior = tipoAnterior;
    }
}
