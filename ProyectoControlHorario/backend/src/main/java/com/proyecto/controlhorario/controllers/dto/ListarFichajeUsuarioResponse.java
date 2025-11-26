package com.proyecto.controlhorario.controllers.dto;


public class ListarFichajeUsuarioResponse {
     // Response DTO (lo que devuelves al frontend)

    private int id_fichaje;
    private String instanteAnterior;
    private String tipoAnterior;

    private String nuevoInstante;
    private String nuevoTipo;
    private String aprobadoEdicion;


    public ListarFichajeUsuarioResponse() {}

    public ListarFichajeUsuarioResponse(int id_fichaje, String instanteAnterior, String tipoAnterior, String nuevoInstante, String nuevoTipo) {
        this.id_fichaje = id_fichaje;
        this.instanteAnterior = instanteAnterior;
        this.tipoAnterior = tipoAnterior; 
        this.nuevoInstante = nuevoInstante;
        this.nuevoTipo = nuevoTipo;
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
