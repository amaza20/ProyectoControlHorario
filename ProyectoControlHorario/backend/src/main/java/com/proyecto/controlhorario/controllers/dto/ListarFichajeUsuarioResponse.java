package com.proyecto.controlhorario.controllers.dto;


public class ListarFichajeUsuarioResponse {
     // Response DTO (lo que devuelves al frontend)

    private String instanteAnterior;
    private String tipoAnterior;

    private String nuevoInstante;
    private String nuevoTipo;


    public ListarFichajeUsuarioResponse() {}

    public ListarFichajeUsuarioResponse(String instanteAnterior, String tipoAnterior, String nuevoInstante, String nuevoTipo) {
        this.instanteAnterior = instanteAnterior;
        this.tipoAnterior = tipoAnterior; 
        this.nuevoInstante = nuevoInstante;
        this.nuevoTipo = nuevoTipo;
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
