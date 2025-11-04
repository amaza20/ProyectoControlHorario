package com.proyecto.controlhorario.controller;

import com.proyecto.controlhorario.db.DatabaseManager;
import com.proyecto.controlhorario.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Paths;
import java.sql.*;
import java.util.*;


@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:4200")
public class Controlador {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // Leemos la ruta base de las bases de datos desde application.properties
    @Value("${app.db.folder}")
    private String dbFolder;

    // Devuelve la ruta completa a la base de datos
    private String getDbPath(String empresa) {
        if (!empresa.endsWith(".db")) {
            empresa = empresa + ".db";
        }
        // Usa Paths para evitar problemas con separadores de sistema
        return Paths.get(dbFolder, empresa).toString();
    }


    // =============================================================
    // ✅ ENDPOINT: REGISTRO DE USUARIO (usa control_general.db)
    // =============================================================
    @PostMapping("/registro")
    public String registrar(@RequestBody Map<String, String> body) {
        String usuario = body.get("usuario");
        String password = body.get("password");
        String departamento = body.get("departamento");
        String rol = body.get("rol");

        // La base general siempre es control_general.db
        String dbPath = Paths.get(dbFolder, "control_general.db").toString();

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                // 1️⃣ Obtener el ID del departamento
                Integer departamentoId = null;
                String sqlDept = "SELECT id FROM departamentos WHERE nombre = ?";
                try (PreparedStatement stmt = conn.prepareStatement(sqlDept)) {
                    stmt.setString(1, departamento);
                    ResultSet rs = stmt.executeQuery();
                    if (rs.next()) {
                        departamentoId = rs.getInt("id");
                    } else {
                        throw new SQLException("Departamento no encontrado: " + departamento);
                    }
                }

                // 2️⃣ Obtener el ID del rol
                Integer rolId = null;
                String sqlRol = "SELECT id FROM roles WHERE nombre = ?";
                try (PreparedStatement stmt = conn.prepareStatement(sqlRol)) {
                    stmt.setString(1, rol);
                    ResultSet rs = stmt.executeQuery();
                    if (rs.next()) {
                        rolId = rs.getInt("id");
                    } else {
                        throw new SQLException("Rol no encontrado: " + rol);
                    }
                }

                // 3️⃣ Insertar el nuevo usuario
                String sqlInsert = "INSERT INTO usuarios (nombre, password, departamento_id, rol_id) VALUES (?, ?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sqlInsert)) {
                    stmt.setString(1, usuario);
                    stmt.setString(2, encoder.encode(password));
                    stmt.setInt(3, departamentoId);
                    stmt.setInt(4, rolId);
                    stmt.executeUpdate();
                }
            });

            return "✅ Usuario '" + usuario + "' registrado correctamente en el departamento " + departamento;

        } catch (SQLException e) {
            if (e.getMessage().contains("UNIQUE constraint")) {
                return "⚠️ El usuario '" + usuario + "' ya existe.";
            }
            e.printStackTrace();
            return "❌ Error al registrar usuario: " + e.getMessage();
        }
    }


    // =============================================================
    // ✅ LOGIN CON TOKEN JWT
    // =============================================================
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body) {
        String usuario = body.get("usuario");
        String password = body.get("password");

        String dbPath = Paths.get(dbFolder, "control_general.db").toString();
        Map<String, Object> response = new HashMap<>();
        response.put("auth", false);

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String sql = """
                    SELECT u.password, d.nombre AS departamento, r.nombre AS rol
                    FROM usuarios u
                    LEFT JOIN departamentos d ON u.departamento_id = d.id
                    LEFT JOIN roles r ON u.rol_id = r.id
                    WHERE u.nombre = ?
                """;

                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, usuario);
                    ResultSet rs = stmt.executeQuery();

                    if (rs.next()) {
                        String hash = rs.getString("password");
                        if (encoder.matches(password, hash)) {
                            String departamento = rs.getString("departamento");
                            String rol = rs.getString("rol");

                            // ✅ Generar el token JWT
                            String token = JwtUtil.generateToken(usuario, departamento, rol);

                            response.put("auth", true);
                            response.put("usuario", usuario);
                            response.put("departamento", departamento);
                            response.put("rol", rol);
                            response.put("token", token);
                        }
                    }
                }
            });

        } catch (SQLException e) {
            e.printStackTrace();
            response.put("error", e.getMessage());
        }

        return response;
    }





    // =============================================================
    // ✅ ENDPOINT: FICHAR ENTRADA / SALIDA (usa formato dd/MM/yyyy HH:mm:ss)
    // =============================================================
    @PostMapping("/fichar")
    public String fichar(@RequestBody Map<String, String> body) {
        String usuario = body.get("usuario");
        String tipo = body.get("tipo");
        String empresa = body.get("empresa");
        String dbPath = getDbPath(empresa);

        // Formato de fecha/hora: dd/MM/yyyy HH:mm:ss
        String fechaHora = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                .format(java.time.LocalDateTime.now());

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String sql = "INSERT INTO fichajes (usuario, tipo, fecha_hora) VALUES (?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setString(1, usuario);
                    stmt.setString(2, tipo);
                    stmt.setString(3, fechaHora);
                    stmt.executeUpdate();
                }
            });

            return "✅ Fichaje registrado correctamente en " + empresa;

        } catch (SQLException e) {
            e.printStackTrace();
            return "⚠️ Error al registrar fichaje en " + empresa + ": " + e.getMessage();
        }
    }





    // =============================================================
    // ✅ ENDPOINT: LISTAR FICHAJES
    // =============================================================
    @GetMapping("/fichajes/{empresa}")
    public List<Map<String, Object>> listar(@PathVariable String empresa) {
        String dbPath = getDbPath(empresa);
        List<Map<String, Object>> fichajes = new ArrayList<>();

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String sql = "SELECT * FROM fichajes ORDER BY id DESC";
                try (PreparedStatement stmt = conn.prepareStatement(sql);
                    ResultSet rs = stmt.executeQuery()) {

                    while (rs.next()) {
                        Map<String, Object> fila = new HashMap<>();
                        fila.put("id", rs.getInt("id"));
                        fila.put("usuario", rs.getString("usuario"));
                        fila.put("tipo", rs.getString("tipo"));
                        fila.put("fecha_hora", rs.getString("fecha_hora"));
                        fila.put("huella", rs.getString("huella"));
                        fila.put("id_edicion", rs.getObject("id_edicion"));
                        fichajes.add(fila);
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return fichajes;
    }
}
