package com.proyecto.controlhorario.dao.entity;


public class Fichajes {

    private String username;
    private String instante;
    private String tipo;    // ENTRA o SALE
    private String huella;
    private Integer idEdicion;  // Puede ser nulo


    public Fichajes() {
    }

    public Fichajes(String username, String instante, String tipo, String huella, Integer idEdicion) {
        this.username = username;
        this.instante = instante;
        this.tipo = tipo;
        this.huella = huella;
        this.idEdicion = idEdicion;
    }

    // ----- Getters y Setters -----
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getInstante() {
        return instante;
    }

    public void setInstante(String instante) {
        this.instante = instante;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getHuella() {
        return huella;
    }

    public void setHuella(String huella) {
        this.huella = huella;
    }

    public Integer getIdEdicion() {
        return idEdicion;
    }

    public void setIdEdicion(Integer idEdicion) {
        this.idEdicion = idEdicion;
    }
}
