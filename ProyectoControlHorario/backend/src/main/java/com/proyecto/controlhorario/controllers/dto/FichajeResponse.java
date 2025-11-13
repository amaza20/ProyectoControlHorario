package com.proyecto.controlhorario.controllers.dto;


public class FichajeResponse {

    private String instante;
    private String tipo;
    private String huella;

    public FichajeResponse() {}

    public FichajeResponse(String instante, String tipo, String huella) {
        this.instante = instante;
        this.tipo = tipo;
        this.huella = huella;       
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

    public void setInstante(String instante) {
        this.instante = instante;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public void setHuella(String huella) {
        this.huella = huella;
    }
    
}
