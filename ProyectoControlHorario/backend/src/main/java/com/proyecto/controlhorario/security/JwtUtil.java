package com.proyecto.controlhorario.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;
import java.util.Map;

public class JwtUtil {

    // 🔑 Clave secreta (puedes moverla a application.properties)
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // ⏳ Tiempo de expiración: 24 horas
    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24;

    /**
     * Genera un token JWT con los datos del usuario.
     */
    public static String generateToken(String username, String departamento, String rol) {
        return Jwts.builder()
                .setSubject(username)
                .addClaims(Map.of("departamento", departamento, "rol", rol))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();
    }

    /**
     * Valida y devuelve los claims del token.
     */
    public static Map<String, Object> validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
