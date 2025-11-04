package com.proyecto.controlhorario.db;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

/**
 * Inicializa las bases de datos SQLite leyendo los esquemas desde ficheros SQL.
 * Usa la propiedad app.db.folder para definir la ubicación de las bases.
 */
@Component
public class DatabaseInitializer {

    // 📁 Leemos la ruta base desde application.properties
    @Value("${app.db.folder}")
    private String dbFolder;

    private static final String GENERAL_DB_NAME = "control_general.db";

    // Bases de datos por departamento
    private static final List<String> DEPARTAMENTOS = List.of(
            "departamento_it.db",
            "departamento_rrhh.db",
            "departamento_finanzas.db"
    );

    @PostConstruct
    public void init() {
        try {
            // Crear carpeta si no existe
            Files.createDirectories(Path.of(dbFolder));

            // Crear base general
            createDatabaseIfNotExists(dbFolder + GENERAL_DB_NAME, "schema_general.sql");

            // Crear bases de departamentos
            for (String dbName : DEPARTAMENTOS) {
                createDatabaseIfNotExists(dbFolder + dbName, "schema_departamento.sql");
            }

            // Insertar datos iniciales
            insertInitialData(dbFolder + GENERAL_DB_NAME);

            System.out.println("✅ Todas las bases SQLite se han inicializado correctamente en: " + dbFolder);

        } catch (Exception e) {
            System.err.println("❌ Error al inicializar las bases de datos: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Crea la base de datos si no existe y ejecuta su esquema SQL.
     */
    private void createDatabaseIfNotExists(String dbPath, String schemaFile) throws SQLException, IOException {
        synchronized (DatabaseManager.getLock(dbPath)) {
            Path path = Path.of(dbPath);
            boolean exists = Files.exists(path);

            if (!exists) {
                Files.createFile(path);
            }

            DatabaseManager.withConnection(dbPath, conn -> {
                try {
                    executeSqlScript(conn, schemaFile);
                } catch (IOException e) {
                    throw new SQLException("Error al leer el fichero SQL: " + schemaFile, e);
                }
            });

            if (!exists) {
                System.out.println("🆕 Base creada a partir de " + schemaFile + ": " + dbPath);
            }
        }
    }

    /**
     * Ejecuta un script SQL almacenado en resources.
     */
    private void executeSqlScript(Connection conn, String resourcePath) throws IOException, SQLException {
        var resource = new ClassPathResource(resourcePath);
        String sql = Files.readString(resource.getFile().toPath(), StandardCharsets.UTF_8);

        try (Statement stmt = conn.createStatement()) {
            for (String command : sql.split(";")) {
                String trimmed = command.trim();
                if (!trimmed.isEmpty()) {
                    stmt.execute(trimmed);
                }
            }
        }
    }

    /**
     * Inserta datos iniciales en control_general.db.
     */
    private void insertInitialData(String generalDbPath) {
        try {
            DatabaseManager.withConnection(generalDbPath, conn -> {
                try (Statement stmt = conn.createStatement()) {

                    stmt.executeUpdate("""
                        INSERT OR IGNORE INTO departamentos (nombre)
                        VALUES ('IT'), ('RRHH'), ('Finanzas');
                    """);

                    stmt.executeUpdate("""
                        INSERT OR IGNORE INTO roles (nombre)
                        VALUES ('Administrador'), ('Empleado'), ('Supervisor');
                    """);

                    System.out.println("🧩 Datos iniciales insertados en control_general.db");
                }
            });
        } catch (Exception e) {
            System.err.println("⚠️ No se pudieron insertar los datos iniciales: " + e.getMessage());
        }
    }
}
