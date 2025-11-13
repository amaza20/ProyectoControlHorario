package com.proyecto.controlhorario.dao;


import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;
import com.proyecto.controlhorario.dto.SolicitudFichajeDto;
import com.proyecto.controlhorario.dao.entity.SolicitudEdicion;
import com.proyecto.controlhorario.db.DatabaseManager;

@Repository
public class EdicionesDAO {
    @Value("${app.db.folder}")
    private String dbFolder;


    public String solicitarEdicion(SolicitudFichajeDto solicitudFichajeDto) {

        String dbPath = dbFolder+"departamento_"+solicitudFichajeDto.getDepartamento().toLowerCase()+".db";
        System.out.println("Ruta DB para solicitud de edición: " + dbPath);

        SolicitudEdicion solicitudEdicion=new SolicitudEdicion();
        solicitudEdicion.setNuevoInstante(solicitudFichajeDto.getNuevaFecha() + " " + solicitudFichajeDto.getNuevaHora());
        solicitudEdicion.setTipo(solicitudFichajeDto.getTipo());
        solicitudEdicion.rechazar();

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                // 1 - Obtener el 'fichaje-id' en la tabla fichajes del instante original
                String idFichaje = null;
                String query = """ 
                                    SELECT id AS fichaje_id
                                    FROM fichajes
                                    WHERE username = ? AND instante = ?  ; 
                                """;
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    st.setString(1, solicitudFichajeDto.getUsername());
                    st.setString(2, solicitudFichajeDto.getFecha() + " " + solicitudFichajeDto.getHora());
                    ResultSet rst = st.executeQuery();
                    if (rst.next()) {
                        idFichaje = rst.getString("fichaje_id");
                    }           
                }

                // 2️⃣ Insertar la solicitud de edición en la tabla 'solicitudes_edicion'
                String sql = "INSERT INTO solicitud_edicion (fichaje_id, nuevo_instante, tipo, aprobado) VALUES (?, ?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, idFichaje);
                    stmt.setString(2, solicitudEdicion.getNuevoInstante());
                    stmt.setString(3, solicitudEdicion.getTipo());
                    stmt.setString(4, solicitudEdicion.getAprobado());
                    stmt.executeUpdate();
                }
            });

            return "✅ Solicitud de edición registrada correctamente en " + solicitudFichajeDto.getDepartamento();

        } catch (SQLException e) {
            e.printStackTrace();
            return "⚠️ Error al registrar solicitud de edición en " + solicitudFichajeDto.getDepartamento() + ": " + e.getMessage();
        }
    }

}
