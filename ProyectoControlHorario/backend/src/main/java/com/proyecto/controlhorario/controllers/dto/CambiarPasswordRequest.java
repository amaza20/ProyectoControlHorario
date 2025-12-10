package com.proyecto.controlhorario.controllers.dto;

public class CambiarPasswordRequest {

    private String username;
    private String nuevaPassword;

    public CambiarPasswordRequest() {}

    public CambiarPasswordRequest(String username, String nuevaPassword) {
        this.username = username;
        this.nuevaPassword = nuevaPassword;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNuevaPassword() {
        return nuevaPassword;
    }

    public void setNuevaPassword(String nuevaPassword) {
        this.nuevaPassword = nuevaPassword;
    }
    
}
