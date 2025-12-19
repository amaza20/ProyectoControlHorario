package com.proyecto.controlhorario.controllers;

import com.proyecto.controlhorario.controllers.dto.FichajeResponse;
import com.proyecto.controlhorario.controllers.dto.IntegridadResponse;
import com.proyecto.controlhorario.controllers.dto.ListarFichajeUsuarioResponse;
import com.proyecto.controlhorario.exceptions.ForbiddenException;
import com.proyecto.controlhorario.security.JwtUtil;
import com.proyecto.controlhorario.service.FichajesService;

import io.jsonwebtoken.JwtException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
public class ControladorFichajes {
    

    private final FichajesService servicio;

     public ControladorFichajes(FichajesService servicio) {
        this.servicio = servicio;
    }


    // ======================================
    // ✅ ENDPOINT: FICHAR ENTRADA / SALIDA 
    // ======================================
    @PostMapping("/fichar")
    public ResponseEntity<FichajeResponse> fichar(@RequestHeader("Authorization") String authHeader) {
        try {
            // 1️⃣ Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            // 2️⃣ Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);
            String username = (String) claims.get("username");
            String departamento = (String) claims.get("departamento"); 

            // 3️⃣ Llamar al servicio para fichar
            FichajeResponse response = servicio.ficharUsuario(username,departamento);;
            response.setMensaje("Usuario ha fichado correctamente");

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);
        }catch (JwtException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new FichajeResponse("Error: " + e.getMessage()));
        }catch (ForbiddenException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new FichajeResponse("Error: " + e.getMessage()));  
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new FichajeResponse("Error: " + e.getMessage()));      
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new FichajeResponse("Error interno: " + e.getMessage()));
        }
    }

 

    // // =============================================================
    // // ✅ ENDPOINT: LISTAR FICHAJES del USUARIO  ( deberia recibir el numero de pagina y el numero de elementos por pagina )
    // // =============================================================
    @GetMapping("/listarFichajesUsuario")
    public ResponseEntity<?> listarFichajesUsuario(@RequestHeader("Authorization") String authHeader, @RequestParam(required = true, defaultValue = "0") int pagina,
                                                   @RequestParam(required = true, defaultValue = "10") int elementosPorPagina) {
       try {
            // 1️⃣ Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            // 2️⃣ Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);
            String username = (String) claims.get("username");
            String departamento = (String) claims.get("departamento");
            String rolUsuarioActual = (String) claims.get("rol");


            // 3️⃣ Listar todos fichajes del usuario correspondiente
            List<ListarFichajeUsuarioResponse> response = servicio.listarFichajesUsuario(username,departamento,rolUsuarioActual,pagina,elementosPorPagina);;  

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.OK)         // En este caso devolveré un  List<ListarFichajeUsuarioResponse>                                                                  
                    .body(response);
        } catch (JwtException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Error: " + e.getMessage());
        }catch (ForbiddenException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Error: " + e.getMessage());
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno: " + e.getMessage());
        }
    }




    // // =============================================================
    // // ✅ ENDPOINT: VERIFICAR INTEGRIDAD DE FICHAJES
    // // =============================================================
    @GetMapping("/verificarIntegridadFichajes") // deberia recibir el numero de pagina y el numero de elementos por pagina
    public ResponseEntity<?> verificarIntegridadFichajes(@RequestHeader("Authorization") String authHeader, @RequestParam String departamento,@RequestParam(required = true, defaultValue = "0") int pagina,
                                                            @RequestParam(required = true, defaultValue = "10") int elementosPorPagina) {
        try {
            // 1️⃣ Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            // 2️⃣ Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);

            String rol = (String) claims.get("rol");     
            String departamentoUsuario = (String) claims.get("departamento"); // ✅ NUEVO: Obtener departamento del usuario
        

            // 3️⃣ Llamar al servicio para comprobar integridad
            List<IntegridadResponse> response = servicio.comprobarIntegridadFichajes(departamento, rol, pagina,elementosPorPagina, departamentoUsuario);
        

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(response);
        } catch (JwtException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new IntegridadResponse("Error: " + e.getMessage()));
        }catch (ForbiddenException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new IntegridadResponse("Error: " + e.getMessage()));
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new IntegridadResponse("Error: " + e.getMessage()));
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new IntegridadResponse("Error interno: " + e.getMessage()));
        }
    }


    // // =========================================================================================
    // // ✅ ENDPOINTs: para consultar el numero total de contarFichajesUsuario, 
    //                                                     contarFichajesTotales,
    //                                                     contarEdicionesTotales
    //                                                     contarSolicitudesTotales
    // // =========================================================================================
    @GetMapping("/contarFichajesUsuario")
    public ResponseEntity<?> contarFichajesUsuario(@RequestParam String username, @RequestParam String departamento) {
        try {

            // Llamar al servicio para contar fichajes del usuario
            long totalFichajes = servicio.contarFichajesUsuario(username,departamento);

            // Devolver el conteo en la respuesta
            Map<String, Long> response = new HashMap<>();
            response.put("totalFichajesUsuario", totalFichajes);

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno: " + e.getMessage());
        }
    }

    @GetMapping("/contarFichajesTotales")
    public ResponseEntity<?> contarFichajesTotales(@RequestParam String departamento) {
        try {
            // Llamar al servicio para contar fichajes del usuario
            long totalFichajes = servicio.contarFichajesTotales(departamento);

            // Devolver el conteo en la respuesta
            Map<String, Long> response = new HashMap<>();
            response.put("totalFichajesDepartamento", totalFichajes);

            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno: " + e.getMessage());
        }
    }

    @GetMapping("/contarEdicionesTotales")
    public ResponseEntity<?> contarEdicionesTotales(@RequestParam String departamento) {
        try {
            // Llamar al servicio para contar fichajes del usuario
            long totalEdiciones = servicio.contarEdicionesTotales(departamento);

            // Devolver el conteo en la respuesta
            Map<String, Long> response = new HashMap<>();
            response.put("totalEdicionesDepartamento", totalEdiciones);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno: " + e.getMessage());
        }
    }

    @GetMapping("contarSolicitudesTotales")
    public ResponseEntity<?> contarSolicitudesTotales(@RequestParam String departamento) {
        try {
            // Llamar al servicio para contar fichajes del usuario
            long totalSolicitudes = servicio.contarSolicitudesTotales(departamento);

            // Devolver el conteo en la respuesta
            Map<String, Long> response = new HashMap<>();
            response.put("totalSolicitudesDepartamento", totalSolicitudes);
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(response);
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error interno: " + e.getMessage());
        }
    }



}
