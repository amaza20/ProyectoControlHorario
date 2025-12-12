package com.proyecto.controlhorario.dao;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import com.proyecto.controlhorario.controllers.dto.AprobarSolicitudResponse;
import com.proyecto.controlhorario.controllers.dto.IntegridadEdicionesResponse;
import com.proyecto.controlhorario.controllers.dto.ListarSolicitudesResponse;
import com.proyecto.controlhorario.controllers.dto.SolicitudEdicionResponse;
import com.proyecto.controlhorario.dao.entity.Edicion;
import com.proyecto.controlhorario.dao.entity.SolicitudEdicion;
import com.proyecto.controlhorario.db.DatabaseManager;

@Repository
public class EdicionesDAO {
    @Value("${app.db.folder}")
    private String dbFolder;


    public SolicitudEdicionResponse solicitarEdicion(SolicitudEdicion solicitudEdicion, String departamento) {

        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        System.out.println("Ruta DB para solicitud de edición: " + dbPath);
        final SolicitudEdicionResponse response = new SolicitudEdicionResponse(solicitudEdicion);

        try {
            DatabaseManager.withConnection(dbPath, conn -> {

                // Comprobar que ya existe un fichaje con ese id en la tabla Fichajes
                boolean existeFichaje = existeFichajeId(solicitudEdicion.getFichajeId(), departamento);
                if (!existeFichaje) {
                    throw new IllegalArgumentException("No existe un fichaje con el id proporcionado en el departamento " + departamento);
                }

                // Obtener el tipo y el instante que se pretende cambiar, del fichaje original para la solicitud
                String tipoFichaje = null;
                String instanteOriginal = null;
                String queryTipo = "SELECT tipo, instante FROM fichajes WHERE id = ?";
                try (PreparedStatement st = conn.prepareStatement(queryTipo)) {
                    st.setInt(1, solicitudEdicion.getFichajeId());
                    try (ResultSet rs = st.executeQuery()) {
                        if (rs.next()) {
                            tipoFichaje = rs.getString("tipo");
                            instanteOriginal = rs.getString("instante");
                        }
                    }
                }
                solicitudEdicion.setTipo(tipoFichaje);  
                
                   

                // Insertar la solicitud de edición en la tabla 'solicitudes_edicion'
                String sql = "INSERT INTO solicitud_edicion (fichaje_id, nuevo_instante, tipo, aprobado) VALUES (?, ?, ?, ?)";
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    stmt.setInt(1, solicitudEdicion.getFichajeId());
                    stmt.setString(2, solicitudEdicion.getNuevoInstante());
                    stmt.setString(3, solicitudEdicion.getTipo());
                    stmt.setString(4, solicitudEdicion.getAprobado());
                    stmt.executeUpdate();
                }

                response.setTipo(tipoFichaje);
                response.setViejoInstante(instanteOriginal);
                
            }); 
   
            System.out.println("✅ Solicitud de edición registrada correctamente en " + departamento);
            
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return response;
    }

    // Metodo para comprobar si existe un fichaje con el id proporcionado
    private boolean existeFichajeId(int fichajeId, String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        final boolean[] existe = {false};

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String query = "SELECT COUNT(*) AS count FROM fichajes WHERE id = ?";
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    st.setInt(1, fichajeId);
                    try (ResultSet rs = st.executeQuery()) {
                        if (rs.next()) {
                            int count = rs.getInt("count");
                            existe[0] = (count > 0);
                        }
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return existe[0];
    }



    // Metodo para dar el aprobado a la solicitud de edicion
    // - Insertar la edicion en la tabla ediciones
    public AprobarSolicitudResponse aprobarSolicitudEdicion(Edicion edicion, String departamento, int solicitudId) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";

        try {
            DatabaseManager.withTransaction(dbPath, conn -> {
                // Obtener huella del fichaje original en la tabla Fichajes
                String huella_fichaje = null;
                String query1 = "SELECT huella FROM fichajes WHERE id = ?";
                try (PreparedStatement st = conn.prepareStatement(query1)) {
                    st.setInt(1, edicion.getFichajeId());
                    try (ResultSet rs = st.executeQuery()) {
                        if (rs.next()) {
                            huella_fichaje = rs.getString("huella");
                        }
                    }
                }
                edicion.setHuellaTablaFichaje(huella_fichaje);

                 // - Calcular la nueva huella
                //  Obtener la última huella registrada
                //  Usamos 'id' en lugar de 'instante' para consistencia
                String ultimaHuella = null;
                String query2 = "SELECT huella FROM ediciones ORDER BY id DESC LIMIT 1";
                try (PreparedStatement st = conn.prepareStatement(query2);
                    ResultSet rs = st.executeQuery()) {
                    if (rs.next()) {
                        ultimaHuella = rs.getString("huella");
                    }
                }

                String base = edicion.getFichajeId() + "|" + edicion.getNuevoInstante() + "|" + edicion.getTipo() + "|" + huella_fichaje + "|" + (ultimaHuella != null ? ultimaHuella : "GENESIS");
                String nuevaHuella = FichajesDAO.generarHash(base);
                edicion.setHuella(nuevaHuella);

                // Insertando la edicion en la tabla 'ediciones'
                int id_edicion;;
                String sqlEdicion = "INSERT INTO ediciones (fichaje_id, instante, tipo, huella_fichaje, huella) VALUES (?, ?, ?, ?, ?)";
                try (PreparedStatement stmtEdicion = conn.prepareStatement(sqlEdicion, PreparedStatement.RETURN_GENERATED_KEYS)) {
                    stmtEdicion.setInt(1, edicion.getFichajeId());
                    stmtEdicion.setString(2, edicion.getNuevoInstante());
                    stmtEdicion.setString(3, edicion.getTipo());
                    stmtEdicion.setString(4, huella_fichaje);
                    stmtEdicion.setString(5, edicion.getHuella());
                    stmtEdicion.executeUpdate();

                    try (ResultSet generatedKeys = stmtEdicion.getGeneratedKeys()) {
                        if (generatedKeys.next()) {
                            id_edicion = generatedKeys.getInt(1);
                        } else {
                            throw new SQLException("No se pudo obtener el ID generado para la edición.");
                        }
                    }
                }       

                // Poniendo a verdadero el campo 'aprobado' en la tabla 'solicitud_edicion'
                String sqlUpdateSolicitud = "UPDATE solicitud_edicion SET aprobado = 'VERDADERO' WHERE id = ? AND aprobado = 'FALSO'";
                try (PreparedStatement stmtUpdate = conn.prepareStatement(sqlUpdateSolicitud)) {    
                    stmtUpdate.setInt(1, solicitudId);
                    int rowsUpdated = stmtUpdate.executeUpdate();
                    if (rowsUpdated == 0) {
                        throw new SQLException("No se encontró una solicitud pendiente para aprobar.");
                    }
                }

                 // Actualizando el 'id_edicion' en la tabla 'fichajes'
                String sqlUpdateFichaje = "UPDATE fichajes SET id_edicion = ? WHERE id = ?";
                try (PreparedStatement stmtUpdate = conn.prepareStatement(sqlUpdateFichaje)) {    
                    stmtUpdate.setInt(1, id_edicion);
                    stmtUpdate.setInt(2, edicion.getFichajeId());
                    int rowsUpdated = stmtUpdate.executeUpdate();
                    if (rowsUpdated == 0) {
                        throw new SQLException("No se encontró una solicitud pendiente para aprobar.");
                    }
                }
                
                
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
      return new AprobarSolicitudResponse(edicion);
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // Metodo para copiar los campos necesarios de la solicitud de edicion a la entidad Edicion

    // - fichajeId;
    // - nuevoInstante;
    // - tipo;      
    public Edicion copiarCampos(Edicion edicion, String departamento, int solicitudId) throws IllegalArgumentException {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                String query = "SELECT fichaje_id, nuevo_instante, tipo, aprobado FROM solicitud_edicion WHERE id = ?";
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    String estado_aprobacion=null;
                    st.setInt(1, solicitudId);
                    try (ResultSet rs = st.executeQuery()) {
                        if(!rs.next()) {
                            throw new IllegalArgumentException("La solicitud no existe.");
                        }
                        else {
                            estado_aprobacion = rs.getString("aprobado");
                            if (!estado_aprobacion.equals("FALSO")) {
                                throw new IllegalArgumentException("La solicitud ya ha sido procesada.");
                            }
                        }

                        edicion.setFichajeId(rs.getInt("fichaje_id"));
                        edicion.setNuevoInstante(rs.getString("nuevo_instante"));
                        edicion.setTipo(rs.getString("tipo"));
                    }            
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return edicion;
    }


    // Metodo para listar todas las solicitudes de edicion de un departamento
    public List<ListarSolicitudesResponse> listarSolicitudes(String departamento) {
        String dbPath = dbFolder+"departamento_"+departamento.toLowerCase()+".db";
        List<ListarSolicitudesResponse> solicitudesList = new ArrayList<>();

        try {
            DatabaseManager.withConnection(dbPath, conn -> {
                // 1 - Listar todos las solicitudes de edicion
                String query = """ 
                                    SELECT solicitud_edicion.id, username, nuevo_instante, solicitud_edicion.tipo, aprobado
                                    FROM solicitud_edicion LEFT JOIN fichajes ON solicitud_edicion.fichaje_id = fichajes.id
                                    ORDER BY solicitud_edicion.id DESC ; 
                                """;
                try (PreparedStatement st = conn.prepareStatement(query)) {
                    ResultSet rst = st.executeQuery();
                    while (rst.next()) {
                        solicitudesList.add(new ListarSolicitudesResponse(
                            rst.getInt("id"),
                            rst.getString("username"),
                            rst.getString("nuevo_instante"),
                            rst.getString("tipo"),
                            rst.getString("aprobado")
                        ));
                    }
                }
            });
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return solicitudesList;
    }



    // La cadena de hashes se construye en orden ASC (del más antiguo al más reciente)
    // Cuando inserto un fichaje, cada huella depende de la anterior cronológicamente.
    public List<IntegridadEdicionesResponse> verificarIntegridadEdiciones(String departamentoConsultado, int pagina, int elementosPorPagina) {
        String dbPath = dbFolder+"departamento_"+departamentoConsultado.toLowerCase()+".db";
        List<IntegridadEdicionesResponse> toret = new ArrayList<>();
        List<IntegridadEdicionesResponse> toret2 = new ArrayList<>();
        
        try {
            // ✅ IMPORTANTE: Para la verificación de integridad, necesitamos calcular la huella
            // desde el primer fichaje, pero solo devolver los de la página solicitada. 

            DatabaseManager.withConnection(dbPath, conn -> {

                String sql = """ 
                                 SELECT  ediciones.id, fichaje_id, username,  ediciones.instante as instante_editado, 
                                         fichajes.instante as instante_original,  ediciones.tipo,  huella_fichaje,  ediciones.huella
                                            FROM ediciones 
                                                  "LEFT JOIN fichajes ON ediciones.fichaje_id = fichajes.id ORDER BY id ASC ;  
                                                       """; 
                                                                     // Del más antiguo al más reciente
                                                                   
                try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                    ResultSet rs = stmt.executeQuery();

                    String huellaAnterior = null;
                    while (rs.next()) {  
                        int id = rs.getInt("id");
                        int fichajeId = rs.getInt("fichaje_id");
                        String usuario = rs.getString("username");
                        String fechaHora_editado = rs.getString("instante_editado");
                        String fechaHora_original = rs.getString("instante_original");

                        String tipo = rs.getString("tipo");
                        String huellaFichajeOriginal = rs.getString("huella_fichaje");

                        String huellaGuardada = rs.getString("huella");

                        String base = fichajeId + "|" + fechaHora_editado + "|" + tipo + "|" + huellaFichajeOriginal + "|" + (huellaAnterior != null ? huellaAnterior : "GENESIS");
                        String huellaCalculada = FichajesDAO.generarHash(base);
       
                        toret.add(new IntegridadEdicionesResponse(id, usuario, fechaHora_editado, fechaHora_original, tipo, huellaCalculada)); 

                        if (!huellaCalculada.equals(huellaGuardada)) {
                            toret.get(toret.size()-1).setMensaje("INCONSISTENCIA DETECTADA");
                        } else {
                            toret.get(toret.size()-1).setMensaje("Huella válida");
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

}

