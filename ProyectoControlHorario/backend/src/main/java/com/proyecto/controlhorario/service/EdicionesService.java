package com.proyecto.controlhorario.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.proyecto.controlhorario.controllers.dto.AprobarSolicitudResponse;
import com.proyecto.controlhorario.controllers.dto.ListarFichajeUsuarioResponse;
import com.proyecto.controlhorario.controllers.dto.ListarSolicitudesResponse;
import com.proyecto.controlhorario.controllers.dto.SolicitudEdicionRequest;
import com.proyecto.controlhorario.controllers.dto.SolicitudEdicionResponse;
import com.proyecto.controlhorario.dao.EdicionesDAO;
import com.proyecto.controlhorario.dao.entity.Edicion;
import com.proyecto.controlhorario.dao.entity.SolicitudEdicion;
import com.proyecto.controlhorario.exceptions.ForbiddenException;

@Service
public class EdicionesService {
    
    private final EdicionesDAO solicitudEdicionDAO;

    public  EdicionesService(EdicionesDAO solicitudEdicionDAO) {
        this.solicitudEdicionDAO = solicitudEdicionDAO;
    }

    public SolicitudEdicionResponse solicitarEdicion(SolicitudEdicionRequest dto, String username, String departamento, String rol) {

        //  Solo los roles de empleado y supervisor podran 
        // solicitar una edicion de fichaje
        if (!rol.equals("Empleado") && !rol.equals("Supervisor")) {
            throw new ForbiddenException("Solo los roles de EMPLEADO y SUPERVISOR pueden solicitar ediciones de fichajes");
        }

        // Crear entidad SolicitudEdicion desde el DTO
        SolicitudEdicion solicitud = new SolicitudEdicion();
        solicitud.setFichajeId(dto.getId_fichaje());
        solicitud.setNuevoInstante(dto.getNuevoInstante());
        solicitud.rechazar(); // Por defecto, la solicitud se marca como "rechazada"
        // El tipo de la solicitud se deduce del fichaje original (ENTRA/SALE)
     

        SolicitudEdicionResponse response = solicitudEdicionDAO.solicitarEdicion(solicitud, departamento);
        response.setUsername(username);

        return response;
    }


    public AprobarSolicitudResponse aprobarSolicitud(int solicitudId, String departamento, String rol) {

        //   Solo el rol 'supervisor' podra aprobar la solicitud de edicion de fichaje
         //  El supervisor es un empleado que pertenece al mismo departamento que el fichaje
        if (!rol.equals("Supervisor")) {
            throw new ForbiddenException("Solo el rol de SUPERVISOR puede aprobar ediciones de fichajes");
        }

        // Crear entidad Edicion desde el DTO
        // Copiar los campos necesarios de la solicitud de edicion ( fichajeId, nuevoInstante, tipo )
        Edicion edicion =  solicitudEdicionDAO.copiarCampos(new Edicion(), departamento, solicitudId);
         
        AprobarSolicitudResponse response = solicitudEdicionDAO.aprobarSolicitudEdicion(edicion, departamento, solicitudId);
        
        return response;
    }

    // Nuevo método para listar solicitudes
    public List<ListarSolicitudesResponse> listarSolicitudes(String departamento, String rol) {

        // Solo el rol 'supervisor' podra listar las solicitudes de edicion de fichaje, ya que es el unico que puede aprobarlas
        // El supervisor es un empleado que pertenece al mismo departamento que el fichaje

        if (!rol.equals("Supervisor")) {
            throw new ForbiddenException("Solo el rol de SUPERVISOR puede listar las solicitudes de edicion de fichaje");
        }

        List<ListarSolicitudesResponse> response = solicitudEdicionDAO.listarSolicitudes(departamento);
        return response;
    }

}
