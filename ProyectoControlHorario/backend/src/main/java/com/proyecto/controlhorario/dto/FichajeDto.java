package com.proyecto.controlhorario.dto;

public class FichajeDto {

    private String username;
    private String instante;  // formato: dd/MM/yyyy HH:mm:ss
    private String tipo;       // valores posibles: "ENTRA" o "SALE"
    private String huella;
    private Integer idEdicion;
    private String departamento;

    public FichajeDto(String username, String departamento) {
        this.username = username;
        this.departamento = departamento;
    }

     public FichajeDto(String instante, String tipo, String huella) {
        this.instante = instante;
        this.tipo = tipo;
        this.huella = huella;
    }


    // Getters y Setters

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

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }
}
