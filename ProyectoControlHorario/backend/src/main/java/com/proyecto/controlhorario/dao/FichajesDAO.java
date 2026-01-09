package com.proyecto.controlhorario.dao;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;

import com.proyecto.controlhorario.controllers.dto.IntegridadResponse;
import com.proyecto.controlhorario.controllers.dto.ListarFichajeUsuarioResponse;
import com.proyecto.controlhorario.dao.entity.Fichaje;
import com.proyecto.controlhorario.db.DatabaseManager;
import org.springframework.stereotype.Repository;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.*;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

@Repository
public class FichajesDAO { 
    @Value("${app.db.folder}")
    private String dbFolder;

    // Todo dentro del mismo withConnection(): Obtención de ultima huella + cálculo + inserción en un solo bloque atómico
    public int ficharUsuario(Fichaje fichaje, String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        final int[] idGenerado = {-1};

        try {
            DatabaseManager.withConnection(dbPath, conn -> {           
                // ISO 8601  
                // Todos los instantes de tiempo se guardan en 'UTC+00:00'
                String ahoraUTC = ZonedDateTime.now(ZoneOffset.UTC).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
                fichaje.setInstante(ahoraUTC);
                
                // - Calcular la nueva huella
                //  Obtener la última huella registrada
                //  Usamos 'id' en lugar de 'instante' para consistencia
                String ultimaHuella = null;
                String queryUltima = "SELECT huella FROM fichajes ORDER BY id DESC LIMIT 1";
                try (Statement st = conn.createStatement();
                    ResultSet rs = st.executeQuery(queryUltima)) {
                    if (rs.next()) {
                        ultimaHuella = rs.getString("huella");
                    }
                }

                String base = fichaje.getUsername() + "|" + fichaje.getInstante() + "|" + fichaje.getTipo() + "|" + (ultimaHuella != null ? ultimaHuella : "GENESIS");
                String nuevaHuella = generarHash(base);
                fichaje.setHuella(nuevaHuella);

                //  Insertar el nuevo fichaje con su huella y obtener el ID generado
                String sql = "INSERT INTO fichajes (username, tipo, instante, huella) VALUES (?, ?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    stmt.setString(1, fichaje.getUsername());
                    stmt.setString(2, fichaje.getTipo());
                    stmt.setString(3, fichaje.getInstante());
                    stmt.setString(4, fichaje.getHuella());
                    stmt.executeUpdate();
                    
                    // Obtener el ID generado
                    try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                        if (generatedKeys.next()) {
                            idGenerado[0] = generatedKeys.getInt(1);
                        }
                    }
                }
            });
            System.out.println("✅ Fichaje registrado correctamente en " + departamento + " con ID: " + idGenerado[0]);
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return idGenerado[0];
    }

    /**
     * Genera un hash SHA-256 a partir de una cadena.
     */
    public static String generarHash(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hash) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error al generar hash", e);
        }
    }



    // Método para obtener el tipo de fichaje siguiente (ENTRA o SALE) según el último fichaje del usuario
    public String obtenerTipoFichajeSig(String username, String departamento){
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        final String[] toret = {null};

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                //  Ver si el ultimo fichaje fue de entrada o salida
                String ultimoTipo = null;
                String query = """ 
                                    SELECT instante, tipo
                                    FROM fichajes
                                    WHERE username = ?
                                    ORDER BY instante DESC
                                    LIMIT 1; 
                                """;
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    st.setString(1, username);
                    ResultSet rst = st.executeQuery();
                    if (rst.next()) {
                        ultimoTipo = rst.getString("tipo");
                    }

                    if(ultimoTipo == null || ultimoTipo.equals("SALE")) {
                        toret[0] = "ENTRA";
                    } else {
                        toret[0] = "SALE";
                    }               
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
      return toret[0];
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    public List<ListarFichajeUsuarioResponse> listarFichajesUsuario(String username, String departamento, int pagina, int elementosPorPagina, String fechaDesde, String fechaHasta) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        List<ListarFichajeUsuarioResponse> fichajesList = new ArrayList<>();

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                // 1 - Listar todos los fichajes del usuario
                String instante, tipo, nuevoInstante, nuevoTipo;
                int idFichaje;
                
                // ✅ Construir query dinámica según si hay filtros de fecha
                StringBuilder queryBuilder = new StringBuilder(""" 
                                    SELECT 
                                    f.id AS id_fichaje,
                                    f.instante AS instante_original,
                                    f.tipo AS tipo_original,
                                    e.instante AS edicion_instante,
                                    e.tipo AS edicion_tipo
                                FROM fichajes f
                                LEFT JOIN ediciones e ON f.id_edicion = e.id
                                WHERE f.username = ?
                                """);
                
                // ✅ Añadir filtros de fecha si existen
                if (fechaDesde != null && !fechaDesde.isEmpty()) {
                    queryBuilder.append(" AND f.instante >= ?");
                }
                if (fechaHasta != null && !fechaHasta.isEmpty()) {
                    queryBuilder.append(" AND f.instante <= ?");
                }
                
                queryBuilder.append(" ORDER BY id_fichaje DESC LIMIT ? OFFSET ?;");
                
                String query = queryBuilder.toString();
                
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    int paramIndex = 1;
                    st.setString(paramIndex++, username);
                    
                    // ✅ Establecer parámetros de fecha si existen
                    if (fechaDesde != null && !fechaDesde.isEmpty()) {
                        st.setString(paramIndex++, fechaDesde);
                    }
                    if (fechaHasta != null && !fechaHasta.isEmpty()) {
                        // Incluir todo el día: agregar hora 23:59:59 si solo viene la fecha
                        String fechaHastaCompleta = fechaHasta.length() == 10 ? fechaHasta + "T23:59:59" : fechaHasta;
                        st.setString(paramIndex++, fechaHastaCompleta);
                    }
                    
                    st.setInt(paramIndex++, elementosPorPagina);
                    st.setInt(paramIndex++, pagina * elementosPorPagina);
                    
                    ResultSet rst = st.executeQuery();
                    while (rst.next()) {
                        idFichaje = rst.getInt("id_fichaje");
                        instante = rst.getString("instante_original");
                        tipo = rst.getString("tipo_original");

                        // 'nuevoInstante' y 'nuevoTipo' solo existen si el fichaje fue editado (son los valores modificados)
                        nuevoInstante = rst.getString("edicion_instante");
                        nuevoTipo = rst.getString("edicion_tipo");
                        fichajesList.add(new ListarFichajeUsuarioResponse(idFichaje, instante, tipo, nuevoInstante, nuevoTipo));

                        // ✅ Determinar el estado real del fichaje buscando la solicitud más reciente:
                        String aprobado = null;
                        String solicitudInstante = null;
                        String solicitudTipo = null;
                        boolean tieneEdicionAplicada = (nuevoInstante != null && !nuevoInstante.isEmpty());
                        
                        String query2 = """ 
                                    SELECT 
                                     aprobado,nuevo_instante,tipo
                                    FROM solicitud_edicion 
                                    WHERE fichaje_id = ?
                                    ORDER BY id DESC
                                    LIMIT 1;
                                """;
                        try (PreparedStatement st2 = conn.prepareStatement(query2)) {
                            st2.setInt(1, idFichaje);
                            ResultSet rst2 = st2.executeQuery();
                            if (rst2.next()) {
                                String estadoSolicitud = rst2.getString("aprobado");
                                solicitudInstante = rst2.getString("nuevo_instante");
                                solicitudTipo = rst2.getString("tipo");
                                
                                // ✅ Lógica de prioridad:
                                // 1. Si la última solicitud es PENDIENTE → mostrar PENDIENTE (prioridad máxima)
                                // 2. Si la última solicitud es APROBADA y hay edición aplicada → mostrar APROBADO
                                // 3. Si la última solicitud es RECHAZADA pero hay edición aplicada → mostrar APROBADO (ignorar rechazo)
                                // 4. Si la última solicitud es RECHAZADA y NO hay edición → no mostrar (será Original)
                                
                                if ("PENDIENTE".equalsIgnoreCase(estadoSolicitud)) {
                                    aprobado = "PENDIENTE";
                                } else if ("APROBADO".equalsIgnoreCase(estadoSolicitud) && tieneEdicionAplicada) {
                                    aprobado = "APROBADO";
                                } else if ("RECHAZADO".equalsIgnoreCase(estadoSolicitud) && tieneEdicionAplicada) {
                                    // Hay una edición aprobada anterior, ignorar el rechazo más reciente
                                    aprobado = "APROBADO";
                                    solicitudInstante = nuevoInstante;
                                    solicitudTipo = nuevoTipo;
                                }
                                // Si es RECHAZADO sin edición aplicada, aprobado queda null (se muestra como Original)
                            } else if (tieneEdicionAplicada) {
                                // No hay solicitudes pero sí hay edición aplicada (caso raro, pero posible)
                                aprobado = "APROBADO";
                                solicitudInstante = nuevoInstante;
                                solicitudTipo = nuevoTipo;
                            }
                        }
                        
                        fichajesList.get(fichajesList.size()-1).setAprobadoEdicion(aprobado); 
                        fichajesList.get(fichajesList.size()-1).setSolicitudInstante(solicitudInstante);
                        fichajesList.get(fichajesList.size()-1).setSolicitudTipo(solicitudTipo);                  
                    }
                }     
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
      return fichajesList;
    }


    // La cadena de hashes se construye en orden ASC (del más antiguo al más reciente)
    // Cuando inserto un fichaje, cada huella depende de la anterior cronológicamente.
    public List<IntegridadResponse> verificarIntegridadFichajes(String departamentoConsultado, int pagina, int elementosPorPagina, String fechaDesde, String fechaHasta) {
        String dbPath = dbFolder+"departamento_"+departamentoConsultado.toLowerCase()+".db";
        List<IntegridadResponse> toret = new ArrayList<>();
        List<IntegridadResponse> toret2 = new ArrayList<>();
        
        try {
            // ✅ IMPORTANTE: Para la verificación de integridad, necesitamos calcular la huella
            // desde el primer fichaje de TODA la base de datos (sin filtros de fecha),
            // porque cada huella depende de la anterior. Luego filtramos por fecha.

            DatabaseManager.withConnection(dbPath, conn -> {

                // ✅ NO aplicar filtros de fecha en la query SQL para integridad
                // La cadena de hashes requiere todos los registros en orden
                String sql = "SELECT fichajes.id, username, fichajes.instante as fich_inst, ediciones.instante as edic_inst, fichajes.tipo, fichajes.huella FROM fichajes "+
                                    "LEFT JOIN ediciones ON fichajes.id_edicion = ediciones.id ORDER BY fichajes.id ASC";
                                                                     // Del más antiguo al más reciente
                                                                     // Si dos fichajes tienen el mismo instante (milisegundo igual), el 
                                                                     // orden por instante podría ser inconsistente. El id autoincremental 
                                                                     // garantiza el orden de inserción.
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    ResultSet rs = stmt.executeQuery();

                    String huellaAnterior = null;
                    while (rs.next()) {  
                        int id = rs.getInt("id");
                        String usuario = rs.getString("username");
                        String fechaHora_Original = rs.getString("fich_inst");
                        String fechaHora_Editada = rs.getString("edic_inst");
                        String tipo = rs.getString("tipo");
                        String huellaGuardada = rs.getString("huella");

                        String base = usuario + "|" + fechaHora_Original + "|" + tipo + "|" + (huellaAnterior != null ? huellaAnterior : "GENESIS");
                        String huellaCalculada = generarHash(base);
                        
                        // ✅ Filtrar por fechas DESPUÉS de calcular las huellas (en memoria)
                        boolean incluir = true;
                        if (fechaDesde != null && !fechaDesde.isEmpty()) {
                            // Comparar solo la parte de fecha (YYYY-MM-DD) para incluir desde las 00:00:00
                            String fechaRegistro = fechaHora_Original.substring(0, Math.min(10, fechaHora_Original.length()));
                            if (fechaRegistro.compareTo(fechaDesde) < 0) {
                                incluir = false;
                            }
                        }
                        if (fechaHasta != null && !fechaHasta.isEmpty()) {
                            // Comparar solo la parte de fecha (YYYY-MM-DD) para incluir hasta las 23:59:59
                            String fechaRegistro = fechaHora_Original.substring(0, Math.min(10, fechaHora_Original.length()));
                            if (fechaRegistro.compareTo(fechaHasta) > 0) {
                                incluir = false;
                            }
                        }
                        
                        if (incluir) {
                            // La huella Guardada en la BD debe coincidir con la huella Calculada
                            // Si coinciden, el registro es íntegro
                            toret.add(new IntegridadResponse(id, usuario, fechaHora_Original, fechaHora_Editada, tipo, huellaGuardada, huellaCalculada)); 

                            if (!huellaCalculada.equals(huellaGuardada)) {
                                toret.get(toret.size()-1).setMensaje("INCONSISTENCIA DETECTADA");
                            } else {
                                toret.get(toret.size()-1).setMensaje("Huella válida");
                            }
                        }
                        
                        huellaAnterior = huellaCalculada;                  
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }  
        
        if(toret.size() - (pagina+1)*elementosPorPagina < 0){
            toret2 = toret.subList( 0 , toret.size() - pagina*elementosPorPagina );
        } else{
            toret2 = toret.subList( toret.size() - (pagina+1)*elementosPorPagina , toret.size() - pagina*elementosPorPagina );
        }
        
        // ✅ Invertir la lista para mostrar los más recientes primero
        Collections.reverse(toret2);
        return toret2;
    }

   ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Necesito este método para la paginación
    public int contarFichajesUsuario(String username, String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        final int[] count = {0};

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String query = "SELECT COUNT(*) AS total FROM fichajes WHERE username = ?";
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    st.setString(1, username);
                    ResultSet rst = st.executeQuery();
                    if (rst.next()) {
                        count[0] = rst.getInt("total");
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return count[0];
    }


    // Necesito este método para la paginación
    public int contarFichajesTotales(String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        final int[] count = {0};

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String query = "SELECT COUNT(*) AS total FROM fichajes";
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    ResultSet rst = st.executeQuery();
                    if (rst.next()) {
                        count[0] = rst.getInt("total");
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return count[0];
    }

    // Necesito este método para la paginación
    public int contarEdicionesTotales(String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        final int[] count = {0};

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String query = "SELECT COUNT(*) AS total FROM ediciones";
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    ResultSet rst = st.executeQuery();
                    if (rst.next()) {
                        count[0] = rst.getInt("total");
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return count[0]; 
    }

    // Necesito este método para la paginación
    public int contarSolicitudesTotales(String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        final int[] count = {0};

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String query = "SELECT COUNT(*) AS total FROM solicitud_edicion";
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    ResultSet rst = st.executeQuery();
                    if (rst.next()) {
                        count[0] = rst.getInt("total");
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return count[0];
    }
    // Método para obtener el último fichaje del usuario
    public Map<String, Object> obtenerUltimoFichaje(String username, String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        @SuppressWarnings("unchecked")
        final Map<String, Object>[] resultado = new Map[1];

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String query = """ 
                    SELECT instante, tipo
                    FROM fichajes
                    WHERE username = ?
                    ORDER BY instante DESC
                    LIMIT 1
                """;
                
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    st.setString(1, username);
                    ResultSet rs = st.executeQuery();
                    
                    if (rs.next()) {
                        Map<String, Object> fichaje = new java.util.HashMap<>();
                        fichaje.put("instante", rs.getString("instante"));
                        fichaje.put("tipo", rs.getString("tipo"));
                        resultado[0] = fichaje;
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
        
        return resultado[0];
    }}