package com.proyecto.controlhorario.controllers;

import com.proyecto.controlhorario.controllers.dto.FichajeResponse;
import com.proyecto.controlhorario.dto.FichajeDto;
import com.proyecto.controlhorario.security.JwtUtil;
import com.proyecto.controlhorario.service.FichajesService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:4200")
public class ControladorFichajes {
    

    private final FichajesService servicio;

     public ControladorFichajes(FichajesService servicio) {
        this.servicio = servicio;
    }


    // ======================================
    // ✅ ENDPOINT: FICHAR ENTRADA / SALIDA 
    // ======================================
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
    // // ✅ ENDPOINT: LISTAR FICHAJES
    // // =============================================================
    @GetMapping("/listarFichajes")
    public ResponseEntity<?> listarFichajes(@RequestHeader("Authorization") String authHeader) {
       try {
            // 1️⃣ Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            // 2️⃣ Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);
            String username = (String) claims.get("username");
            String departamento = (String) claims.get("departamento");

            FichajeDto fichaje = new FichajeDto(username, departamento);  

            // 3️⃣ Listar todos fichajes del usuario correspondiente
            List<FichajeDto> fichajes = servicio.listarFichajesUsuario(fichaje);
            List<FichajeResponse> response = new ArrayList<>();
            for (FichajeDto fich : fichajes) {
                response.add(new FichajeResponse(fich.getInstante(), fich.getTipo(), fich.getHuella()));
            }

            // Devolver JSON con la lista
            return ResponseEntity.ok(response);    // En este caso devolveré un  List<FichajeResponse>
        } catch (Exception e) {
            e.printStackTrace();      
            // Devolver mensaje de error en caso de token inválido
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                             .body("❌ Token inválido o expirado");
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



}
