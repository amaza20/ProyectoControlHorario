package com.proyecto.controlhorario.controllers.dto;

import com.proyecto.controlhorario.dao.entity.Fichaje;

public class FichajeResponse {
     // Response DTO (lo que devuelves al frontend)

    private Integer idFichaje;
    private String instante;
    private String tipo;
    private String username;
    private String departamento;
    private String mensaje;

    public FichajeResponse() {}

    public FichajeResponse(String msg) {   
        this.mensaje = msg;
    }

    // Constructor desde Entity
    public FichajeResponse(Fichaje fichaje) {   
        this.instante = fichaje.getInstante();
        this.tipo = fichaje.getTipo();
        this.username = fichaje.getUsername();
    }

    public FichajeResponse(String instante, String tipo, String username) {
        this.instante = instante;
        this.tipo = tipo;
        this.username = username;              
    }

    public FichajeResponse(String instante, String tipo, String username, String departamento) {
        this.instante = instante;
        this.tipo = tipo;
        this.username = username;       
        this.departamento = departamento;
    }

    public String getInstante() {
        return instante;
    }   

    public String getTipo() {
        return tipo;
    } 

    public String getUsername() {
        return username;
    }

    public void setInstante(String instante) {
        this.instante = instante;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
    public String getDepartamento() {
        return departamento;
    }
    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public Integer getIdFichaje() {
        return idFichaje;
    }

    public void setIdFichaje(Integer idFichaje) {
        this.idFichaje = idFichaje;
    }
}
