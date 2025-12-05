package com.proyecto.controlhorario.controllers.dto;

public class CrearDepartamentoResponse {
    // Response DTO (lo que devuelves al frontend)

    private String departamento;
    private String msg;  // Mensaje adicional

    public CrearDepartamentoResponse(String msg) {   
        this.msg = msg;
    }
    
    public CrearDepartamentoResponse(String departamento, String msg) {
        this.departamento = departamento;
        this.msg = msg;
    }

    public String getDepartamento() {
        return departamento;
    }
    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }
    public String getMsg() {
        return msg;
    }
    public void setMsg(String msg) {
        this.msg = msg;
    }

}
