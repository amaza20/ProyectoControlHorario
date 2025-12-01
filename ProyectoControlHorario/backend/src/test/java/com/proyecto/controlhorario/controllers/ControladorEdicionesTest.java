package com.proyecto.controlhorario.controllers;

import com.proyecto.controlhorario.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ControladorEdicionesTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listarSolicitudes_conTokenValido_devuelve200_y_username_en_claims() throws Exception {

        //   Mockear JwtUtil con Mockito.mockStatic solo afecta a la validación del token; no impide 
        // que el flujo siga hasta el servicio/DAO si esos beans son reales.

        // Mock static de JwtUtil.validateToken(...) para devolver username, rol, departamento
        try (MockedStatic<JwtUtil> jwtMock = Mockito.mockStatic(JwtUtil.class)) {
            jwtMock.when(() -> JwtUtil.validateToken("mi-token"))
                   .thenReturn(Map.of(
                       "username", "cucoFlow102",
                       "rol", "Supervisor",
                       "departamento", "IT"
                   ));

            mockMvc.perform(get("/listarSolicitudes")
                    .header("Authorization", "Bearer mi-token"))
                    .andExpect(status().isOk())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
        }
    }

     @Test
    void listarSolicitudes_conTokenValido_pero_sinPermisos() throws Exception {

        //   Mockear JwtUtil con Mockito.mockStatic solo afecta a la validación del token; no impide 
        // que el flujo siga hasta el servicio/DAO si esos beans son reales.

        // Mock static de JwtUtil.validateToken(...) para devolver username, rol, departamento
        try (MockedStatic<JwtUtil> jwtMock = Mockito.mockStatic(JwtUtil.class)) {
            jwtMock.when(() -> JwtUtil.validateToken("mi-token"))
                   .thenReturn(Map.of(
                       "username", "cucoFlow101",
                       "rol", "Empleado",
                       "departamento", "IT"
                   ));

            mockMvc.perform(get("/listarSolicitudes")
                    .header("Authorization", "Bearer mi-token"))
                    .andExpect(status().isForbidden())
                    .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN));
        }
    }

    @Test
    void listarSolicitudes_conTokenInvalido_devuelve401() throws Exception {
        try (MockedStatic<JwtUtil> jwtMock = Mockito.mockStatic(JwtUtil.class)) {
            jwtMock.when(() -> JwtUtil.validateToken("token-mal"))
                   .thenThrow(new io.jsonwebtoken.JwtException("token inválido"));

            mockMvc.perform(get("/listarSolicitudes")
                    .header("Authorization", "Bearer token-mal"))
                    .andExpect(status().isUnauthorized());
        }
    }
}