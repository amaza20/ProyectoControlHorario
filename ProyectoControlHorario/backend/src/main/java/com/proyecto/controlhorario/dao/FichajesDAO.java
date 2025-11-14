package com.proyecto.controlhorario.dao;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import com.proyecto.controlhorario.dao.entity.Fichajes;
import com.proyecto.controlhorario.db.DatabaseManager;
import com.proyecto.controlhorario.dto.FichajeDto;
import org.springframework.stereotype.Repository;

import java.sql.*;

@Repository
public class FichajesDAO { 
    @Value("${app.db.folder}")
    private String dbFolder;


    public String ficharUsuario(FichajeDto fichajeDto) {
        Fichajes fichaje=new Fichajes();
        String dbPath = dbFolder+"departamento_"+fichajeDto.getDepartamento().toLowerCase()+".db";
        System.out.println("Ruta DB para fichaje: " + dbPath);

        // ISO 8601  
        // Todos los instantes de tiempo se guardan en 'UTC+00:00'
        String ahoraUTC = ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        fichaje.setUsername(fichajeDto.getUsername());
        fichaje.setInstante(ahoraUTC);

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                // 1 - Obtener la última huella registrada
                String ultimaHuella = null;
                String queryUltima = "SELECT huella FROM fichajes ORDER BY id DESC LIMIT 1";
                try (Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery(queryUltima)) {
                    if (rs.next()) {
                        ultimaHuella = rs.getString("huella");
                    }
                }

                // 2 - Ver si el ultimo fichaje fue de entrada o salida
                String ultimoTipo = null;
                String query = """ 
                                    SELECT instante, tipo
                                    FROM fichajes
                                    WHERE username = ?
                                    ORDER BY instante DESC
                                    LIMIT 1; 
                                """;
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    st.setString(1, fichaje.getUsername());
                    ResultSet rst = st.executeQuery();
                    if (rst.next()) {
                        ultimoTipo = rst.getString("tipo");
                    }

                    if(ultimoTipo == null || ultimoTipo.equals("SALE")) {
                        fichaje.setTipo("ENTRA");
                    } else {
                        fichaje.setTipo("SALE");
                    }               
                }

                // 2️⃣ Calcular la nueva huella
                String base = fichaje.getUsername() + "|" + fichaje.getInstante() + "|" + fichaje.getTipo() + "|" + (ultimaHuella != null ? ultimaHuella : "GENESIS");
                String nuevaHuella = generarHash(base);

                // 3️⃣ Insertar el nuevo fichaje con su huella
                String sql = "INSERT INTO fichajes (username, tipo, instante, huella) VALUES (?, ?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, fichaje.getUsername());
                    stmt.setString(2, fichaje.getTipo());
                    stmt.setString(3, fichaje.getInstante());
                    stmt.setString(4, nuevaHuella);
                    stmt.executeUpdate();
                }
            });

            return "✅ Fichaje registrado correctamente en " + fichajeDto.getDepartamento();

        } catch (SQLException e) {
            e.printStackTrace();
            return "⚠️ Error al registrar fichaje en " + fichajeDto.getDepartamento() + ": " + e.getMessage();
        }
    }

    /**
     * Genera un hash SHA-256 a partir de una cadena.
     */
    private String generarHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al generar hash", e);
        }
    }






    public List<FichajeDto> listarFichajes(FichajeDto fichajeDto) {
        String dbPath = dbFolder+"departamento_"+fichajeDto.getDepartamento().toLowerCase()+".db";
        List<FichajeDto> fichajesList = new ArrayList<>();

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                // 1 - Listar todos los fichajes del usuario
                String instante, tipo, huella;
                String query = """ 
                                    SELECT instante, tipo, huella
                                    FROM fichajes
                                    WHERE username = ?
                                    ORDER BY instante DESC ; 
                                """;
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    st.setString(1, fichajeDto.getUsername());
                    ResultSet rst = st.executeQuery();
                    while (rst.next()) {
                        instante = rst.getString("instante");
                        tipo = rst.getString("tipo");
                        huella = rst.getString("huella");

                        fichajesList.add(new FichajeDto(instante, tipo, huella));
                    }
                }
            });

        } catch (SQLException e) {
            e.printStackTrace();
        }
      return fichajesList;
    }



    public String verificarIntegridadFichajes(FichajeDto fichajeDto) {
        String dbPath = dbFolder+"departamento_"+fichajeDto.getDepartamento().toLowerCase()+".db";
        final String[] toret = { "✅ Integridad verificada: todos los fichajes son válidos." };

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                boolean stop=false;
                String sql = "SELECT id, username, instante, tipo, huella FROM fichajes ORDER BY id ASC";
                try (Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery(sql)) {

                    String huellaAnterior = null;
                    while (rs.next() && !stop) {
                        String usuario = rs.getString("username");
                        String fechaHora = rs.getString("instante");
                        String tipo = rs.getString("tipo");
                        String huellaGuardada = rs.getString("huella");

                        String base = usuario + "|" + fechaHora + "|" + tipo + "|" + (huellaAnterior != null ? huellaAnterior : "GENESIS");
                        String huellaCalculada = generarHash(base);

                        if (!huellaCalculada.equals(huellaGuardada)) {
                            toret[0]="Integridad comprometida en el registro ID=" + rs.getInt("id");
                            stop=true;
                        } else {
                            huellaAnterior = huellaGuardada;
                        }                   
                    }
                }
            });

            return toret[0];
        } catch (SQLException e) {
            e.printStackTrace();
            return "⚠️ Error al verificar integridad: " + e.getMessage();
        }
    }
}