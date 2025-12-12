package com.proyecto.controlhorario.controllers.dto;

public class ListarSolicitudesResponse {
    
    private int id;
    private String username;
     private String instante_original;  // ✅ NUEVO
    private String nuevo_instante;
    private String tipo;
    private String aprobado;

    public ListarSolicitudesResponse(int id, String username, String instante_original, String nuevo_instante, String tipo, String aprobado) {
        this.id = id;
        this.username = username;
        this.instante_original = instante_original;
        this.nuevo_instante = nuevo_instante;
        this.tipo = tipo;
        this.aprobado = aprobado;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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
    public String getInstante_original() {
        return instante_original;
    }
    public void setInstante_original(String instante_original) {
        this.instante_original = instante_original;
    }

}
