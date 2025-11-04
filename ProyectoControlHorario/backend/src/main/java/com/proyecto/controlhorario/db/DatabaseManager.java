package com.proyecto.controlhorario.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.concurrent.ConcurrentHashMap;

/**
 * DatabaseManager mejorado:
 * - Gestiona conexiones SQLite con cierre automático.
 * - Evita problemas de concurrencia usando bloqueos por base de datos.
 * - Facilita el uso de try-with-resources.
 */
public class DatabaseManager {

    // Mapa de bloqueos por base de datos (para operaciones sincronizadas)
    private static final ConcurrentHashMap<String, Object> dbLocks = new ConcurrentHashMap<>();

    static {
        try {
            // Registrar el driver JDBC de SQLite
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException e) {
            throw new ExceptionInInitializerError("❌ No se encontró el driver JDBC de SQLite.");
        }
    }

    /**
     * Devuelve una conexión SQLite a la base de datos indicada.
     * El llamante es responsable de cerrarla (idealmente con try-with-resources).
     */
    public static Connection getConnection(String dbPath) throws SQLException {
        String url = "jdbc:sqlite:" + dbPath;
        return DriverManager.getConnection(url);
    }

    /**
     * Devuelve un objeto de bloqueo específico para cada base de datos.
     * Se usa para sincronizar operaciones de escritura concurrentes.
     */
    public static Object getLock(String dbPath) {
        return dbLocks.computeIfAbsent(dbPath, k -> new Object());
    }

    /**
     * Ejecuta una operación con una conexión gestionada automáticamente.
     * Usa try-with-resources para garantizar el cierre.
     *
     * Ejemplo de uso:
     * DatabaseManager.withConnection("db/control_general.db", conn -> {
     *     try (PreparedStatement ps = conn.prepareStatement("SELECT * FROM usuarios")) {
     *         ResultSet rs = ps.executeQuery();
     *         while (rs.next()) {
     *             System.out.println(rs.getString("nombre"));
     *         }
     *     }
     * });
     */
    public static void withConnection(String dbPath, DatabaseOperation operation) throws SQLException {
        synchronized (getLock(dbPath)) {
            try (Connection conn = getConnection(dbPath)) {
                operation.execute(conn);
            }
        }
    }

    /**
     * Interfaz funcional para operaciones SQL sobre una conexión.
     */
    @FunctionalInterface
    public interface DatabaseOperation {
        void execute(Connection conn) throws SQLException;
    }
}
