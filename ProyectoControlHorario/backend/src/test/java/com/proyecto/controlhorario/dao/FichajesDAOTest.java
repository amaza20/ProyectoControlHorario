package com.proyecto.controlhorario.dao;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FichajesDAOTest {

//     Patrón AAA:

//  Arrange (Preparar) - Configurar datos de entrada
//  Act (Actuar) - Ejecutar el método
//  Assert (Verificar) - Comprobar el resultado
    
    @Test
    void testGenerarHash() {
        // Given (Dado) - Preparar datos de entrada
        String input = "usuario1|2025-01-01 10:00:00|ENTRA|GENESIS";
        
        // When (Cuando) - Ejecutar el método a probar
        String hash = FichajesDAO.generarHash(input);
        
        // Then (Entonces) - Verificar el resultado
        assertNotNull(hash, "El hash no debe ser null");
        assertEquals(64, hash.length(), "El hash SHA-256 debe tener 64 caracteres");
        
        // Verificar que siempre genera el mismo hash para la misma entrada
        String hash2 = FichajesDAO.generarHash(input);
        assertEquals(hash, hash2, "El hash debe ser determinístico");
    }
    
    @Test
    void testGenerarHashConDiferentesEntradas() {
        String hash1 = FichajesDAO.generarHash("entrada1");
        String hash2 = FichajesDAO.generarHash("entrada2");
        
        assertNotEquals(hash1, hash2, "Hashes de entradas diferentes deben ser distintos");
    }

    
    @Test
    void testGenerarHash_DiferentesInputsGeneranDiferentesHashes() {
        // Arrange & Act
        String hash1 = FichajesDAO.generarHash("input1");
        String hash2 = FichajesDAO.generarHash("input2");
        
        // Assert
        assertNotEquals(hash1, hash2, "Diferentes inputs deben generar diferentes hashes");
    }
}
