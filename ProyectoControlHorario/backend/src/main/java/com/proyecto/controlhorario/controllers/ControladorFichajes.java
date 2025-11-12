package com.proyecto.controlhorario.controllers;

import com.proyecto.controlhorario.dto.FichajeDto;
import com.proyecto.controlhorario.security.JwtUtil;
import com.proyecto.controlhorario.service.FichajesService;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class ControladorFichajes {
    

    private final FichajesService servicio;

     public ControladorFichajes(FichajesService servicio) {
        this.servicio = servicio;
    }


    // =============================================================
    // ✅ ENDPOINT: FICHAR ENTRADA / SALIDA (usa formato dd/MM/yyyy HH:mm:ss)
    // =============================================================
    @PostMapping("/fichar")
    public String fichar(@RequestHeader("Authorization") String authHeader) {
        try {
            // 1️⃣ Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            // 2️⃣ Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);
            String username = (String) claims.get("username");
            String departamento = (String) claims.get("departamento");

            FichajeDto fichaje = new FichajeDto(username, departamento);  
            System.out.println("Fichaje recibido: " + fichaje.getUsername() + ", " + fichaje.getDepartamento());
            // 3️⃣ Registrar fichaje en la tabla correspondiente
            servicio.ficharUsuario(fichaje);

            return "✅ Fichaje registrado correctamente para " + username
                    + " en departamento " + departamento;
        } catch (Exception e) {
            e.printStackTrace();      
            return "❌ Token inválido o expirado";
        }
    }

 




    // // =============================================================
    // // ✅ ENDPOINT: VERIFICAR INTEGRIDAD DE FICHAJES
    // // =============================================================
    // @GetMapping("/verificar")
    // public String verificar(@RequestParam String departamento) {
    //     final String[] toret = {"Integridad verificada correctamente"};
    //     String dbPath = getDbPath(departamento);
    //     try {
    //         DatabaseManager.withConnection(dbPath, conn -> {
    //             boolean stop=false;
    //             String sql = "SELECT id, usuario, tipo, fecha_hora, huella FROM fichajes ORDER BY id ASC";
    //             try (Statement st = conn.createStatement();
    //                 ResultSet rs = st.executeQuery(sql)) {

    //                 String huellaAnterior = null;
    //                 while (rs.next() && !stop) {
    //                     String usuario = rs.getString("usuario");
    //                     String tipo = rs.getString("tipo");
    //                     String fechaHora = rs.getString("fecha_hora");
    //                     String huellaGuardada = rs.getString("huella");

    //                     String base = usuario + "|" + fechaHora + "|" + tipo + "|" + (huellaAnterior != null ? huellaAnterior : "GENESIS");
    //                     String huellaCalculada = generarHash(base);

    //                     if (!huellaCalculada.equals(huellaGuardada)) {
    //                         toret[0]="Integridad comprometida en el registro ID=" + rs.getInt("id");
    //                         stop=true;
    //                     } else {
    //                         huellaAnterior = huellaGuardada;
    //                     }                   
    //                 }
    //             }
    //         });

    //         return toret[0];

    //     } catch (SQLException e) {
    //         e.printStackTrace();
    //         return "⚠️ Error al verificar integridad: " + e.getMessage();
    //     }
    // }


    //  // =============================================================
    // // ✅ ENDPOINT: LISTAR FICHAJES
    // // =============================================================
    // @GetMapping("/fichajes/{empresa}")
    // public List<Map<String, Object>> listar(@PathVariable String empresa) {
    //     String dbPath = getDbPath(empresa);
    //     List<Map<String, Object>> fichajes = new ArrayList<>();

    //     try {
    //         DatabaseManager.withConnection(dbPath, conn -> {
    //             String sql = "SELECT * FROM fichajes ORDER BY id DESC";
    //             try (PreparedStatement stmt = conn.prepareStatement(sql);
    //                 ResultSet rs = stmt.executeQuery()) {

    //                 while (rs.next()) {
    //                     Map<String, Object> fila = new HashMap<>();
    //                     fila.put("id", rs.getInt("id"));
    //                     fila.put("usuario", rs.getString("usuario"));
    //                     fila.put("tipo", rs.getString("tipo"));
    //                     fila.put("fecha_hora", rs.getString("fecha_hora"));
    //                     fila.put("huella", rs.getString("huella"));
    //                     fila.put("id_edicion", rs.getObject("id_edicion"));
    //                     fichajes.add(fila);
    //                 }
    //             }
    //         });
    //     } catch (SQLException e) {
    //         e.printStackTrace();
    //     }

    //     return fichajes;
    // }

}
