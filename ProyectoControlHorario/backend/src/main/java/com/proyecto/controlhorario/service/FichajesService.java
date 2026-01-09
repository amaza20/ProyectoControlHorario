package com.proyecto.controlhorario.service;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.proyecto.controlhorario.controllers.dto.FichajeResponse;
import com.proyecto.controlhorario.controllers.dto.IntegridadResponse;
import com.proyecto.controlhorario.controllers.dto.ListarFichajeUsuarioResponse;
import com.proyecto.controlhorario.dao.FichajesDAO;
import com.proyecto.controlhorario.dao.entity.Fichaje;
import com.proyecto.controlhorario.exceptions.ForbiddenException;

@Service
public class FichajesService {

    private final FichajesDAO fichajeDAO;

    public  FichajesService(FichajesDAO fichajeDAO) {
        this.fichajeDAO = fichajeDAO;
    }

    public FichajeResponse ficharUsuario(String username, String departamento) {

        if (departamento == null || departamento.isEmpty()) {
            throw new IllegalArgumentException("El departamento no puede estar vacío");
        }

        // Creamos la entidad Fichaje y la rellenamos
        Fichaje fichaje=new Fichaje();

        fichaje.setUsername(username);
        fichaje.setTipo(fichajeDAO.obtenerTipoFichajeSig(username,departamento)); // "ENTRA" o "SALE"

        // Si llamara a un metodo obtenerUltimaHuella() y luego insertara por separado tendria un problema de concurrencia.
        fichajeDAO.ficharUsuario(fichaje,departamento);

        FichajeResponse response= new FichajeResponse(fichaje); 
        response.setDepartamento(departamento);

        return response;
    }


    // Nuevo método para listar fichajes de un usuario en concreto
    public List<ListarFichajeUsuarioResponse> listarFichajesUsuario(String username, String departamento, String rolUsuarioActual, int pagina, int elementosPorPagina, String fechaDesde, String fechaHasta) {

        // Solo los roles de Supervisor y Empleado pueden listar sus propios fichajes
        if (rolUsuarioActual.equals("Administrador") || rolUsuarioActual.equals("Auditor")) {
            throw new ForbiddenException("Los administradores y auditores no fichan en el sistema");
        }

        List<ListarFichajeUsuarioResponse> response = fichajeDAO.listarFichajesUsuario(username, departamento, pagina, elementosPorPagina, fechaDesde, fechaHasta);
        return response;
    }



    // Nuevo método para verificar integridad de fichajes
    // Cadena de hashes (similar a blockchain) para detectar manipulaciones no autorizadas en los registros de fichajes
    public List<IntegridadResponse> comprobarIntegridadFichajes(String departamentoConsultado, String rolUsuarioActual, int pagina, int elementosPorPagina, String departamentoUsuario, String fechaDesde, String fechaHasta) {

        // ✅ VALIDAR QUE EL USUARIO ACTUAL SEA ADMINISTRADOR O AUDITOR O SUPERVISOR
        if (!rolUsuarioActual.equals("Administrador") && !rolUsuarioActual.equals("Auditor") && !rolUsuarioActual.equals("Supervisor")) {
                throw new ForbiddenException("Solo los administradores, auditores y supervisores pueden comprobar la integridad de los fichajes");
        }

        // ✅ NUEVO: Validar que Auditor y Supervisor solo puedan ver su propio departamento
        if ((rolUsuarioActual.equals("Auditor") || rolUsuarioActual.equals("Supervisor")) && ! departamentoConsultado.equalsIgnoreCase(departamentoUsuario)) {
            throw new ForbiddenException("Los auditores y supervisores solo pueden verificar la integridad de su propio departamento");
        }

        return fichajeDAO.verificarIntegridadFichajes(departamentoConsultado, pagina, elementosPorPagina, fechaDesde, fechaHasta);
    }


    public long contarFichajesUsuario(String username, String departamento) {
        return fichajeDAO.contarFichajesUsuario(username, departamento);
    }

    public long contarFichajesTotales(String departamento) {
        return fichajeDAO.contarFichajesTotales(departamento);
    }

    public long contarEdicionesTotales(String departamento) {
        return fichajeDAO.contarEdicionesTotales(departamento);
    }

    public long contarSolicitudesTotales(String departamento) {
        return fichajeDAO.contarSolicitudesTotales(departamento);
    }   

    // Nuevo método para obtener el último fichaje del usuario
    public Map<String, Object> obtenerUltimoFichaje(String username, String departamento) {
        return fichajeDAO.obtenerUltimoFichaje(username, departamento);
    }

}
