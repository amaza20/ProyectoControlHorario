package com.proyecto.controlhorario.service;

import com.proyecto.controlhorario.controllers.dto.CambiarPasswordRequest;
import com.proyecto.controlhorario.controllers.dto.CambiarPasswordResponse;
import com.proyecto.controlhorario.controllers.dto.CrearDepartamentoResponse;
import com.proyecto.controlhorario.controllers.dto.LoginRequest;
import com.proyecto.controlhorario.controllers.dto.LoginResponse;
import com.proyecto.controlhorario.controllers.dto.RegistroRequest;
import com.proyecto.controlhorario.controllers.dto.RegistroResponse;
import com.proyecto.controlhorario.dao.UsuarioDAO;
import com.proyecto.controlhorario.dao.entity.Usuario;
import com.proyecto.controlhorario.exceptions.ForbiddenException;
import com.proyecto.controlhorario.exceptions.UnauthorizedException;
import com.proyecto.controlhorario.security.JwtUtil;

import java.util.HashMap;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioDAO usuarioDAO;

    public  UsuarioService(UsuarioDAO registroDAO) {
        this.usuarioDAO = registroDAO;
    }

    public RegistroResponse guardarRegistro(RegistroRequest dto, String rolUsuarioActual) {

        // Administrador -->   es el unico rol que puede crear nuevos usuarios, nuevos departamentos y cambiar contraseñas, 
        //                    solo estara en la base de datos general (departamento null) 
        //                    puede comprobar integridad BlockChain de los fichajes y de las ediciones de todos los departamentos.
        //                    No ficha.
        
        //       Auditor -->   Pertenece a un departamento, puede comprobar integridad BlockChain de fichajes y de ediciones del departamento 
        //                    al que pertenece. No ficha.

        //    Supervisor -->   Pertenece a un departamento, es el que da el 'OK' o el 'Rechazado' de la edicion del fichaje. 
        //                    puede comprobar integridad BlockChain de fichajes y de ediciones del departamento al que pertenece.
        //                     Ficha normalmente.

        //      Empleado -->    Pertenece a un departamento. Ficha normalmente.

        // ✅ VALIDAR QUE EL USUARIO ACTUAL SEA ADMINISTRADOR
        if (!"Administrador".equals(rolUsuarioActual)) {
            throw new ForbiddenException("Solo los administradores pueden crear usuarios");
        }
        
        //  Validar que el username no exista
        if (usuarioDAO.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("El username ya está registrado");
        }

        HashMap<String, Integer> rolesHashMap = new HashMap<>();
        rolesHashMap.put("Administrador", 1);
        rolesHashMap.put("Auditor", 2);
        rolesHashMap.put("Supervisor", 3);
        rolesHashMap.put("Empleado", 4);

        //  Validar que el rol sea válido
        if (!rolesHashMap.containsKey(dto.getRol())) {
            throw new IllegalArgumentException("El rol especificado no es válido");
        }
        //  Validar que el departamento sea válido (si el rol no es Auditor ni es Administrador)
        if (!dto.getRol().equals("Auditor") && !dto.getRol().equals("Administrador")) {
            if (!usuarioDAO.existsDepartamento(dto.getDepartamento())) {
                throw new IllegalArgumentException("El departamento especificado no existe");
            }
        } else {
            dto.setDepartamento(null);  // Los Auditores y Administradores no tienen departamento
        }

        
        // Crear entidad Usuario desde el DTO
        Usuario user = new Usuario();
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setDepartamento(dto.getDepartamento());
        user.setRol(dto.getRol());

        // Guardar en la BD
        usuarioDAO.registrarUsuario(user, rolesHashMap.get(dto.getRol()));
        
        return new RegistroResponse(user);
    }


    
    public LoginResponse solicitarLogin(LoginRequest dto) {

        //  Validar que el username ya existe
        if (!usuarioDAO.existsByUsername(dto.getUsername())) {
            throw new UnauthorizedException("El username no está registrado");
        }

        //  Validar que la password es correcta y obtener la entidad Usuario (devolvera un Usuario con username null si la password es incorrecta)
        Usuario user = usuarioDAO.existsPassword(dto.getUsername(), dto.getPassword());
 
        if(user.getUsername()==null){
            throw new UnauthorizedException("Contraseña incorrecta");
        }

        // ✅ Generar el token JWT
        // No pasa nada si un claim del JWT es null
        String token = JwtUtil.generateToken(user.getUsername(), user.getDepartamento(), user.getRol());
        LoginResponse response = new LoginResponse(user.getUsername(), token, "Login exitoso");
    

        return response;  
    }


    public CrearDepartamentoResponse crearDepartamento(String nombreDepartamento, String rolUsuarioActual) {

        // ✅ VALIDAR QUE EL USUARIO ACTUAL SEA ADMINISTRADOR
        if (!"Administrador".equals(rolUsuarioActual)) {
            throw new ForbiddenException("Solo los administradores pueden crear departamentos");
        }

        // Comprobar si el nombre de ese departamento ya existe
        if (usuarioDAO.existsDepartamento(nombreDepartamento)) {
            throw new IllegalArgumentException("El departamento '" + nombreDepartamento + "' ya existe.");
        }  
        
        // Comprobar si nombreDepartamento es null o vacio
        if (nombreDepartamento == null || nombreDepartamento.isEmpty()) {
            throw new IllegalArgumentException("No se pudo crear el departamento. Verifique la solicitud.");
        }

        // Llamar al DAO para crear el departamento
        CrearDepartamentoResponse nombreDepartamentoCreado = usuarioDAO.crearDepartamento(nombreDepartamento);

        return nombreDepartamentoCreado;
    }

    public List<String> obtenerDepartamentos() {
        return usuarioDAO.listarDepartamentos();
    }

    public List<String> obtenerRoles() {
        return usuarioDAO.listarRoles();
    }


    public CambiarPasswordResponse cambiarPassword(CambiarPasswordRequest dto, String rolUsuarioActual) {

        // ✅ VALIDAR QUE EL USUARIO ACTUAL SEA ADMINISTRADOR
        if (!"Administrador".equals(rolUsuarioActual)) {
            throw new ForbiddenException("Solo los administradores pueden cambiar contraseñas de otros usuarios");
        }

        //  Validar que el username ya existe
        if (!usuarioDAO.existsByUsername(dto.getUsername())) {
            throw new UnauthorizedException("El username no está registrado");
        }

        // Llamar al DAO para cambiar la contraseña
        CambiarPasswordResponse usuarioActualizado = usuarioDAO.cambiarPassword(dto.getUsername(), dto.getNuevaPassword());

        return usuarioActualizado;

    }
}

    