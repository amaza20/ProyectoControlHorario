package com.proyecto.controlhorario.controllers;

import com.proyecto.controlhorario.controllers.dto.CambiarPasswordRequest;
import com.proyecto.controlhorario.controllers.dto.CambiarPasswordResponse;
import com.proyecto.controlhorario.controllers.dto.CrearDepartamentoResponse;
import com.proyecto.controlhorario.controllers.dto.LoginRequest;
import com.proyecto.controlhorario.controllers.dto.LoginResponse;
import com.proyecto.controlhorario.controllers.dto.RegistroRequest;
import com.proyecto.controlhorario.controllers.dto.RegistroResponse;
import com.proyecto.controlhorario.exceptions.ForbiddenException;
import com.proyecto.controlhorario.exceptions.UnauthorizedException;
import com.proyecto.controlhorario.security.JwtUtil;
import com.proyecto.controlhorario.service.*;

import io.jsonwebtoken.JwtException;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/general")
public class ControladorUsuario {

    private final UsuarioService servicio;

    public ControladorUsuario(UsuarioService servicio) {
        this.servicio = servicio;
    }


    // ======================================
    // ✅ ENDPOINT: REGISTRAR NUEVO USUARIO 
    // ======================================
    @PostMapping("/registro")
    public ResponseEntity<RegistroResponse> crearRegistro(@Valid @RequestBody RegistroRequest dto, @RequestHeader("Authorization") String authHeader) {

        try {

            //  Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            //  Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);
            String rolUsuarioActual = (String) claims.get("rol");

            //  Llamar al servicio (aquí se valida el rol)
            RegistroResponse response = servicio.guardarRegistro(dto, rolUsuarioActual);
            response.setMsg("Usuario registrado correctamente");

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);
        }catch (JwtException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new RegistroResponse("Error: " + e.getMessage()));
        }catch (ForbiddenException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new RegistroResponse("Error: " + e.getMessage()));  
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new RegistroResponse("Error: " + e.getMessage()));      
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new RegistroResponse("Error interno: " + e.getMessage()));
        }
    }



    // =================
    // ✅ LOGIN USUARIO 
    // =================
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> loginUsuario(@Valid @RequestBody LoginRequest dto) {

        try {

            //  Llamar al servicio
            LoginResponse response = servicio.solicitarLogin(dto);

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(response);
        } catch (UnauthorizedException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse("Error: " + e.getMessage()));
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new LoginResponse("Error: " + e.getMessage()));      
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LoginResponse("Error interno: " + e.getMessage()));
        }
    }

    
    // ================================
    // ✅ REGISTRAR NUEVO DEPARTAMENTO    // solo los administradores pueden crear departamentos
    // ================================
    @PostMapping("/crearDepartamento")
    public ResponseEntity<CrearDepartamentoResponse> registrarDepartamento(@Valid @RequestParam String nombreDepartamento, @RequestHeader("Authorization") String authHeader) {

        try {

            //  Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            //  Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);
            String rolUsuarioActual = (String) claims.get("rol");

            //  Llamar al servicio
            CrearDepartamentoResponse response = servicio.crearDepartamento(nombreDepartamento,rolUsuarioActual);

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.OK)
                    .body(response);
        }catch (JwtException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new CrearDepartamentoResponse("Error: " + e.getMessage()));
        }catch (ForbiddenException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new CrearDepartamentoResponse("Error: " + e.getMessage()));
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new CrearDepartamentoResponse("Error: " + e.getMessage()));      
        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CrearDepartamentoResponse("Error interno: " + e.getMessage()));
        }
    }

    // ✅ ENDPOINT: LISTAR DEPARTAMENTOS
    @GetMapping("/listarDepartamentos")
    public ResponseEntity<?> listarDepartamentos() {
        try {
            List<String> departamentos = servicio.obtenerDepartamentos();
            return ResponseEntity.ok(departamentos);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                . body("Error al obtener departamentos: " + e.getMessage());
        }
    }

    // ✅ ENDPOINT: LISTAR ROLES
    @GetMapping("/listarRoles")
    public ResponseEntity<?> listarRoles() {
        try {
            List<String> roles = servicio.obtenerRoles();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus. INTERNAL_SERVER_ERROR)
                .body("Error al obtener roles: " + e.getMessage());
        }
    }



    // ==============================================
    // ✅ ENDPOINT: CAMBIAR CONTRASEÑA DE UN USUARIO 
    // ==============================================
    @PostMapping("/cambiarPassword")
    public ResponseEntity<CambiarPasswordResponse> cambiarPassword(@Valid @RequestBody CambiarPasswordRequest dto, @RequestHeader("Authorization") String authHeader) {

        try {

            //  Extraer el token (sin "Bearer ")
            String token = authHeader.replace("Bearer ", "");

            //  Validar token y obtener claims
            Map<String, Object> claims = JwtUtil.validateToken(token);
            String rolUsuarioActual = (String) claims.get("rol");

            //  Llamar al servicio (aquí se valida el rol)
            CambiarPasswordResponse response = servicio.cambiarPassword(dto, rolUsuarioActual);
            response.setMsg("Contraseña cambiada correctamente");

            // En Spring Boot, la conversión a JSON es automática gracias a Jackson
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(response);
        }catch (JwtException e) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new CambiarPasswordResponse("Error: " + e.getMessage()));
        }catch (ForbiddenException e) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(new CambiarPasswordResponse("Error: " + e.getMessage()));  
        }catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new CambiarPasswordResponse("Error: " + e.getMessage()));      
        }catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new CambiarPasswordResponse("Error interno: " + e.getMessage()));
        }
    }

   
}
