package com.proyecto.controlhorario.controllers.dto;

public class ListarSolicitudesResponse {
    
    private int id;
    private String nuevo_instante;
    private String tipo;
    private String aprobado;

    public ListarSolicitudesResponse(int id, String nuevo_instante, String tipo, String aprobado) {
        this.id = id;
        this.nuevo_instante = nuevo_instante;
        this.tipo = tipo;
        this.aprobado = aprobado;
    }
    
    public int getId() {
        return id;
    }
    public String getNuevo_instante() {
        return nuevo_instante;
    }
    public String getTipo() {
        return tipo;
    }
    public String getAprobado() {
        return aprobado;
    }
    public void setId(int id) {
        this.id = id;
    }
    public void setNuevo_instante(String nuevo_instante) {
        this.nuevo_instante = nuevo_instante;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public void setAprobado(String aprobado) {
        this.aprobado = aprobado;
    }
}
