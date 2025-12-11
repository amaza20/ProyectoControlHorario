package com.proyecto.controlhorario.service;
import java.util.List;

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
    public List<ListarFichajeUsuarioResponse> listarFichajesUsuario(String username, String departamento, String rolUsuarioActual, int pagina, int elementosPorPagina) {

        // Solo los roles de Supervisor y Empleado pueden listar sus propios fichajes
        if (rolUsuarioActual.equals("Administrador") || rolUsuarioActual.equals("Auditor")) {
            throw new ForbiddenException("Los administradores y auditores no fichan en el sistema");
        }

        List<ListarFichajeUsuarioResponse> response = fichajeDAO.listarFichajesUsuario(username, departamento, pagina, elementosPorPagina);
        return response;
    }



    // Nuevo método para verificar integridad de fichajes
    // Cadena de hashes (similar a blockchain) para detectar manipulaciones no autorizadas en los registros de fichajes
    public List<IntegridadResponse> comprobarIntegridadFichajes(String departamentoConsultado, String rolUsuarioActual, int pagina, int elementosPorPagina) {

        // Administrador -->   es el unico rol que puede crear nuevos usuarios, solo estara en la base de datos general, 
        //                   puede comprobar integridad (departamento null).
        //       Auditor -->  solo estara en la base de datos general, puede comprobar integridad (departamento null).
        //    Supervisor -->  es el que da el OK de la edicion del fichaje.
        //      Empleado -->  es el que ficha sin mas.

        // ✅ VALIDAR QUE EL USUARIO ACTUAL SEA ADMINISTRADOR O AUDITOR
        if (!rolUsuarioActual.equals("Administrador") && !rolUsuarioActual.equals("Auditor")) {
                throw new ForbiddenException("Solo los administradores y auditores pueden comprobar la integridad de los fichajes");
        }


        return fichajeDAO.verificarIntegridadFichajes(departamentoConsultado, pagina, elementosPorPagina);
    }



}
