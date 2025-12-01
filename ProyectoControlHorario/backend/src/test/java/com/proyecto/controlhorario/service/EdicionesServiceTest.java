package com.proyecto.controlhorario.service;

import com.proyecto.controlhorario.dao.EdicionesDAO;
import com.proyecto.controlhorario.exceptions.ForbiddenException;
import org. junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Disabled;

@Disabled("Ignorar todos los tests de esta clase temporalmente")
@ExtendWith(MockitoExtension.class)
class EdicionesServiceTest {
    
    @Mock
    private EdicionesDAO edicionesDAO;  // Simulamos el DAO
    
    @InjectMocks
    private EdicionesService edicionesService;  // Inyectamos el mock
    
    @Test
    void testAprobarSolicitud_SoloSupervisor() {
        // Given
        int solicitudId = 1;
        String departamento = "ventas";
        String rol = "Empleado";  // Rol incorrecto
        
        // When & Then - Verificar que lanza excepción
        assertThrows(ForbiddenException.class, () -> {
            edicionesService.aprobarSolicitud(solicitudId, departamento, rol);
        }, "Solo el Supervisor puede aprobar solicitudes");
    }
    
    @Test
    void testAprobarSolicitud_SupervisorCorrecto() {
        // Given
        int solicitudId = 1;
        String departamento = "ventas";
        String rol = "Supervisor";  // Rol correcto
        
        // When & Then - No debe lanzar excepción
        assertDoesNotThrow(() -> {
            edicionesService. aprobarSolicitud(solicitudId, departamento, rol);
        });
    }
}
