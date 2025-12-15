package com.proyecto.controlhorario.controllers.dto;

public class ListarUsuarioResponse {
    private String username;
    private String rol;
    private String departamento;

    public ListarUsuarioResponse() {}

    public ListarUsuarioResponse(String username, String rol, String departamento) {
        this.username = username;
        this.rol = rol;
        this.departamento = departamento;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }
}
