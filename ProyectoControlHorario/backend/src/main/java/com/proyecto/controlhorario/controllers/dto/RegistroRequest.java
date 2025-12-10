package com.proyecto.controlhorario.controllers.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegistroRequest {
    // Request DTO (lo que llega del frontend)

    @NotBlank(message = "El nombre de usuario no puede estar vacío")
    @Size(min = 3, max = 30, message = "El nombre de usuario debe tener entre 3 y 30 caracteres")
    private String username;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

   
    private String departamento;  // El departamento puede ser NULL si el rol es 'Administrador'
                                  // Un Auditor, un Supervisor o un Empleado si deben de pertener a un departamento existente.

    @NotBlank(message = "El rol no puede estar vacío")
    private String rol;

    public RegistroRequest() {}

    public RegistroRequest(String username, String password, String departamento, String rol) {
        this.username = username;
        this.password = password;
        this.departamento = departamento;
        this.rol = rol;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }
}


