package com.proyecto.controlhorario.controllers.dto;

public class IntegridadEdicionesResponse {

    private int id;
    private String usuario; 
    private String fechaHora_editado; 
    private String fechaHora_original; 
    private String tipo; 
    private String huellaGuardada;
    private String huellaCalculada;

    private String mensaje;


    public IntegridadEdicionesResponse() {
    }

    public IntegridadEdicionesResponse(int id, String usuario, String fechaHora_editado, String fechaHora_original, String tipo, String huellaGuardada, String huellaCalculada) {
        this.id = id;
        this.usuario = usuario;
        this.fechaHora_editado = fechaHora_editado;
        this.fechaHora_original = fechaHora_original;
        this.tipo = tipo;
        this.huellaGuardada = huellaGuardada;
        this.huellaCalculada = huellaCalculada;
    }

    public String getHuellaGuardada() {
        return huellaGuardada;
    }
    public String getHuellaCalculada() {
        return huellaCalculada;
    }
    public void setHuellaGuardada(String huellaGuardada) {
        this.huellaGuardada = huellaGuardada;
    }
    public void setHuellaCalculada(String huellaCalculada) {
        this.huellaCalculada = huellaCalculada;
    }
    public IntegridadEdicionesResponse(String mensaje) {
        this.mensaje = mensaje;
    }

    public int getId() {
        return id;
    }
    public String getUsuario() {
        return usuario;
    }
    public String getFechaHora_editado() {
        return fechaHora_editado;
    }
    public String getFechaHora_original() {
        return fechaHora_original;
    }
    public String getTipo() {
        return tipo;
    }
    public String getMensaje() {
        return mensaje;
    }
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
