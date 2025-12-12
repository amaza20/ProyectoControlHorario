package com.proyecto.controlhorario.dao.entity;

public class SolicitudEdicion {

    private int fichajeId;
    private String nuevoInstante;
    private String tipo;        // 'ENTRA' o 'SALE'
    private String aprobado;    // // Valores posibles: "PENDIENTE", "APROBADO", "RECHAZADO"

    // --- Constructores ---
    public SolicitudEdicion(int fichajeId, String nuevoInstante, String tipo) {
        this.fichajeId = fichajeId;
        this.nuevoInstante = nuevoInstante;
        this.tipo = tipo;
        this.aprobado = "PENDIENTE";
    }

    public SolicitudEdicion() {
    }

    // --- Getters y Setters ---
    public int getFichajeId() { return fichajeId; }
    public void setFichajeId(int fichajeId) { this.fichajeId = fichajeId; }

    public String getNuevoInstante() { return nuevoInstante; }
    public void setNuevoInstante(String nuevoInstante) { this.nuevoInstante = nuevoInstante; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public String getAprobado() { return aprobado; }
    public void setAprobado(String aprobado) { this.aprobado = aprobado; }

    // --- Métodos auxiliares ---
    public boolean isAprobado() {
        return "VERDADERO".equalsIgnoreCase(this.aprobado);
    }

    public boolean isRechazado() {
        return "RECHAZADO".equalsIgnoreCase(this.aprobado);
    }

    public void aprobar() {
        this.aprobado = "APROBADO";
    }

    public void rechazar() {
        this.aprobado = "RECHAZADO";
    }

    public void marcarPendiente() {
        this.aprobado = "PENDIENTE";
    }

}
