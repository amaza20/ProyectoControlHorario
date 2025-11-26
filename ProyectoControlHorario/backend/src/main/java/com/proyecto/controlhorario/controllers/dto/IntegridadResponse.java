package com.proyecto.controlhorario.controllers.dto;

public class IntegridadResponse {

    private int id;
    private String username;
    private String instante;
    private String tipo;
    private String huella;
    private String mensaje;

    public IntegridadResponse() {}

    public IntegridadResponse(int id, String username, String instante, String tipo, String huella) {
        this.id = id;
        this.username = username;
        this.instante = instante;
        this.tipo = tipo;
        this.huella = huella;
    }
    
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }   

    public IntegridadResponse(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getUsername() {
        return username;
    }

    public String getInstante() {
        return instante;
    }

    public String getTipo() {
        return tipo;
    }

    public String getHuella() {
        return huella;
    }

    public String getMensaje() {
        return mensaje;
    }
    public void setUsername(String username) {
        this.username = username;
    }
    public void setInstante(String instante) {
        this.instante = instante;
    }
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    public void setHuella(String huella) {
        this.huella = huella;
    }
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}