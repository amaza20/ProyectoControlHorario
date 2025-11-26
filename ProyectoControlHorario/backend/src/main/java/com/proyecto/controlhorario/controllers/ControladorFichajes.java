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
    // // ✅ ENDPOINT: LISTAR FICHAJES del USUARIO
    // // =============================================================
    @GetMapping("/listarFichajesUsuario")
    public ResponseEntity<?> listarFichajesUsuario(@RequestHeader("Authorization") String authHeader) {
       try {
            // 1️⃣ Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            // 2️⃣ Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);
            String username = (String) claims.get("username");
            String departamento = (String) claims.get("departamento");


            // 3️⃣ Listar todos fichajes del usuario correspondiente
            List<ListarFichajeUsuarioResponse> response = servicio.listarFichajesUsuario(username,departamento);  

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
    @GetMapping("/verificarIntegridadFichajes")
    public ResponseEntity<?> verificarIntegridadFichajes(@RequestHeader("Authorization") String authHeader, @RequestParam String departamento) {

        try {
            // 1️⃣ Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            // 2️⃣ Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);

            //  Solo los roles de administrador y auditor podran 
            // comprobar la integridad en las tablas de los departamentos
            String rol = (String) claims.get("rol");     

        

            // 3️⃣ Llamar al servicio para comprobar integridad
            List<IntegridadResponse> response = servicio.comprobarIntegridadFichajes(departamento, rol);
        

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.CREATED)
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



}
