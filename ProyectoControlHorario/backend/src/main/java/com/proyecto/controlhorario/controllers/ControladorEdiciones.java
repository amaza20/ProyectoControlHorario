package com.proyecto.controlhorario.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.proyecto.controlhorario.controllers.dto.AprobarSolicitudResponse;
import com.proyecto.controlhorario.controllers.dto.IntegridadEdicionesResponse;
import com.proyecto.controlhorario.controllers.dto.ListarSolicitudesResponse;
import com.proyecto.controlhorario.controllers.dto.SolicitudEdicionRequest;
import com.proyecto.controlhorario.controllers.dto.SolicitudEdicionResponse;
import com.proyecto.controlhorario.exceptions.ForbiddenException;
import com.proyecto.controlhorario.security.JwtUtil;
import com.proyecto.controlhorario.service.EdicionesService;

import io.jsonwebtoken.JwtException;
import jakarta.validation.Valid;

@RestController
public class ControladorEdiciones {

    private final EdicionesService servicio;

     public ControladorEdiciones(EdicionesService servicio) {
        this.servicio = servicio;
    }

    @PostMapping("/solicitarEdicion")
    public ResponseEntity<SolicitudEdicionResponse> editarFichaje(@RequestHeader("Authorization") String authHeader,@Valid @RequestBody SolicitudEdicionRequest dto) {

        try {
            String token = authHeader.replace("Bearer ", "");
            Map<String, Object> claims = JwtUtil.validateToken(token);

            String username = (String) claims.get("username");
            String departamento = (String) claims.get("departamento");
            String rol = (String) claims.get("rol");

            //  Solo los roles de empleado y supervisor podran 
            // solicitar una edicion de fichaje
            
            // 3️⃣ Registrar solicitud en la tabla correspondiente
            SolicitudEdicionResponse response = servicio.solicitarEdicion(dto,username,departamento,rol);
            response.setMsg("Solicitud de edición registrada correctamente");

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);
        }catch (JwtException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new SolicitudEdicionResponse("Error: " + e.getMessage()));
        }catch (ForbiddenException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new SolicitudEdicionResponse("Error: " + e.getMessage()));  
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new SolicitudEdicionResponse("Error: " + e.getMessage()));      
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SolicitudEdicionResponse("Error interno: " + e.getMessage()));
        }
    }


    @PostMapping("/aprobarSolicitud")
    public ResponseEntity<AprobarSolicitudResponse> aprobarSolicitud(@RequestHeader("Authorization") String authHeader,@Valid @RequestParam int solicitudId) {

        try {
            String token = authHeader.replace("Bearer ", "");
            Map<String, Object> claims = JwtUtil.validateToken(token);

            //  Solo el rol 'supervisor' podra aprobar la solicitud de edicion de fichaje
            //  El supervisor es un empleado que pertenece al mismo departamento que el fichaje
            String rol = (String) claims.get("rol");
            String departamento = (String) claims.get("departamento");

                   
            // 3️⃣ Aprobar la solicitud en las tablas correspondientes
            AprobarSolicitudResponse response = servicio.aprobarSolicitud(solicitudId, departamento, rol);
            response.setMsg("Solicitud de edición aprobada correctamente");

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);
        }catch (JwtException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new AprobarSolicitudResponse("Error: " + e.getMessage()));
        }catch (ForbiddenException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new AprobarSolicitudResponse("Error: " + e.getMessage()));  
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new AprobarSolicitudResponse("Error: " + e.getMessage()));      
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AprobarSolicitudResponse("Error interno: " + e.getMessage()));
        }
    }



    @GetMapping("/listarSolicitudes")
    public ResponseEntity<?> listarSolicitudes(@RequestHeader("Authorization") String authHeader) {
       try {
            // 1️⃣ Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            // 2️⃣ Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);
            String departamento = (String) claims.get("departamento");
            String rol = (String) claims.get("rol");


            // 3️⃣ Listar toda las solicitudes del departamento correspondiente
            List<ListarSolicitudesResponse> response = servicio.listarSolicitudes(departamento, rol);  

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.OK)                                                                         
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
    // // ✅ ENDPOINT: VERIFICAR INTEGRIDAD DE EDICIONES
    // // =============================================================
    @GetMapping("/verificarIntegridadEdiciones") // deberia recibir el numero de pagina y el numero de elementos por pagina
    public ResponseEntity<?> verificarIntegridadEdiciones(@RequestHeader("Authorization") String authHeader, @RequestParam String departamento,@RequestParam(required = true, defaultValue = "0") int pagina,
                                                            @RequestParam(required = true, defaultValue = "10") int elementosPorPagina) {
        try {
            // 1️⃣ Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            // 2️⃣ Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);

            //  Solo los roles de administrador y auditor podran 
            // comprobar la integridad en las tablas de los departamentos
            String rol = (String) claims.get("rol");     

        

            // 3️⃣ Llamar al servicio para comprobar integridad
            List<IntegridadEdicionesResponse> response = servicio.comprobarIntegridadEdiciones(departamento, rol, pagina,elementosPorPagina);;
        

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(response);
        } catch (JwtException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new IntegridadEdicionesResponse("Error: " + e.getMessage()));
        }catch (ForbiddenException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new IntegridadEdicionesResponse("Error: " + e.getMessage()));
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new IntegridadEdicionesResponse("Error: " + e.getMessage()));
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new IntegridadEdicionesResponse("Error interno: " + e.getMessage()));
        }
    }

    
}
