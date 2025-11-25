package com.proyecto.controlhorario.dao;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;

import com.proyecto.controlhorario.controllers.dto.IntegridadResponse;
import com.proyecto.controlhorario.controllers.dto.ListarFichajeUsuarioResponse;
import com.proyecto.controlhorario.dao.entity.Fichaje;
import com.proyecto.controlhorario.db.DatabaseManager;
import org.springframework.stereotype.Repository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.*;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Repository
public class FichajesDAO { 
    @Value("${app.db.folder}")
    private String dbFolder;

    // Todo dentro del mismo withConnection(): Obtención de ultima huella + cálculo + inserción en un solo bloque atómico
    public void ficharUsuario(Fichaje fichaje, String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";

        try {
            DatabaseManager.withConnection(dbPath, conn -> {           
                // ISO 8601  
                // Todos los instantes de tiempo se guardan en 'UTC+00:00'
                String ahoraUTC = ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                fichaje.setInstante(ahoraUTC);
                
                // - Calcular la nueva huella
                //  Obtener la última huella registrada
                //  Usamos 'id' en lugar de 'instante' para consistencia
                String ultimaHuella = null;
                String queryUltima = "SELECT huella FROM fichajes ORDER BY id DESC LIMIT 1";
                try (Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery(queryUltima)) {
                    if (rs.next()) {
                        ultimaHuella = rs.getString("huella");
                    }
                }

                String base = fichaje.getUsername() + "|" + fichaje.getInstante() + "|" + fichaje.getTipo() + "|" + (ultimaHuella != null ? ultimaHuella : "GENESIS");
                String nuevaHuella = generarHash(base);
                fichaje.setHuella(nuevaHuella);

                //  Insertar el nuevo fichaje con su huella
                String sql = "INSERT INTO fichajes (username, tipo, instante, huella) VALUES (?, ?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, fichaje.getUsername());
                    stmt.setString(2, fichaje.getTipo());
                    stmt.setString(3, fichaje.getInstante());
                    stmt.setString(4, fichaje.getHuella());
                    stmt.executeUpdate();
                }
            });
            System.out.println("✅ Fichaje registrado correctamente en " + departamento);
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /**
     * Genera un hash SHA-256 a partir de una cadena.
     */
    public static String generarHash(String input) {
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



    // Método para obtener el tipo de fichaje siguiente (ENTRA o SALE) según el último fichaje del usuario
    public String obtenerTipoFichajeSig(String username, String departamento){
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        final String[] toret = {null};

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                //  Ver si el ultimo fichaje fue de entrada o salida
                String ultimoTipo = null;
                String query = """ 
                                    SELECT instante, tipo
                                    FROM fichajes
                                    WHERE username = ?
                                    ORDER BY instante DESC
                                    LIMIT 1; 
                                """;
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    st.setString(1, username);
                    ResultSet rst = st.executeQuery();
                    if (rst.next()) {
                        ultimoTipo = rst.getString("tipo");
                    }

                    if(ultimoTipo == null || ultimoTipo.equals("SALE")) {
                        toret[0] = "ENTRA";
                    } else {
                        toret[0] = "SALE";
                    }               
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
      return toret[0];
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public List<ListarFichajeUsuarioResponse> listarFichajesUsuario(String username, String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        List<ListarFichajeUsuarioResponse> fichajesList = new ArrayList<>();

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                // 1 - Listar todos los fichajes del usuario
                String instante, tipo;
                String query = """ 
                                    SELECT instante, tipo
                                    FROM fichajes
                                    WHERE username = ?
                                    ORDER BY instante DESC ; 
                                """;
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    st.setString(1, username);
                    ResultSet rst = st.executeQuery();
                    while (rst.next()) {
                        instante = rst.getString("instante");
                        tipo = rst.getString("tipo");
                        fichajesList.add(new ListarFichajeUsuarioResponse(instante, tipo));
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
      return fichajesList;
    }


    // La cadena de hashes se construye en orden ASC (del más antiguo al más reciente)
    // Cuando inserto un fichaje, cada huella depende de la anterior cronológicamente.
    public IntegridadResponse verificarIntegridadFichajes(String departamentoConsultado) {
        String dbPath = dbFolder+"departamento_"+departamentoConsultado.toLowerCase()+".db";
        IntegridadResponse toret = new IntegridadResponse("✅ Integridad verificada: todos los fichajes son válidos.");
        

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                boolean stop=false;
                String sql = "SELECT id, username, instante, tipo, huella FROM fichajes ORDER BY id ASC";  // Del más antiguo al más reciente
                                                                     // Si dos fichajes tienen el mismo instante (milisegundo igual), el 
                                                                     // orden por instante podría ser inconsistente. El id autoincremental 
                                                                     // garantiza el orden de inserción.
                try (Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery(sql)) {

                    String huellaAnterior = null;
                    while (rs.next() && !stop ) {  
                        String usuario = rs.getString("username");
                        String fechaHora = rs.getString("instante");
                        String tipo = rs.getString("tipo");
                        String huellaGuardada = rs.getString("huella");

                        String base = usuario + "|" + fechaHora + "|" + tipo + "|" + (huellaAnterior != null ? huellaAnterior : "GENESIS");
                        String huellaCalculada = generarHash(base);

                        if (!huellaCalculada.equals(huellaGuardada)) {
                            toret.setMensaje("Integridad comprometida en el registro ID = " + rs.getInt("id"));
                            toret.setUsername(usuario);
                            toret.setInstante(fechaHora);
                            toret.setTipo(tipo);
                            toret.setHuella(huellaGuardada);
                            stop=true;
                        } else {
                            huellaAnterior = huellaGuardada;
                        }                   
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return toret;
    }
}