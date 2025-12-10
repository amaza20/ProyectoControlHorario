package com.proyecto.controlhorario.controllers.dto;

public class CambiarPasswordResponse {
    // Response DTO (lo que se envía al frontend)
    private String username;
    private String msg;

    public CambiarPasswordResponse() {}

    public CambiarPasswordResponse(String msg) {
        this.msg = msg;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }

    
}
