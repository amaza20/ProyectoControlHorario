package com.proyecto.controlhorario.service;

import java.util.List;

import org.springframework.stereotype.Service;
import com.proyecto.controlhorario.dao.FichajesDAO;
import com.proyecto.controlhorario.dto.FichajeDto;

@Service
public class FichajesService {

    private final FichajesDAO fichajeDAO;

    public  FichajesService(FichajesDAO fichajeDAO) {
        this.fichajeDAO = fichajeDAO;
    }

    public void ficharUsuario(FichajeDto dto) {
        System.out.println(fichajeDAO.ficharUsuario(dto));
    }

    // Nuevo método para listar fichajes
    public List<FichajeDto> listarFichajesUsuario(FichajeDto dto) {
        return fichajeDAO.listarFichajes(dto);
    }

    // Nuevo método para verificar integridad de fichajes
    public String comprobarIntegridadFichajes(FichajeDto dto) {
        return fichajeDAO.verificarIntegridadFichajes(dto);
    }

}
