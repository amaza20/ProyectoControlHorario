// URL base de tu API
const API_BASE_URL = 'http://localhost:8080';

// ============================================
// FUNCIÓN: VERIFICAR SESIÓN
// ============================================
function verificarSesion() {
    const token = localStorage.getItem('authToken');
    return token !== null;
}

// ============================================
// FUNCIÓN: OBTENER DATOS DEL TOKEN
// ============================================
function obtenerDatosToken() {
    const token = localStorage.getItem('authToken');
    if (!token) return null;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            username: payload.username,
            rol: payload.rol,
            departamento: payload.departamento
        };
    } catch (e) {
        console.error('Error al decodificar token:', e);
        return null;
    }
}

// ============================================
// FUNCIÓN: VERIFICAR ROL
// ============================================
function verificarRol(rolesPermitidos) {
    const datos = obtenerDatosToken();
    if (!datos) {
        window.location.href = 'login.html';
        return false;
    }
    
    const rolUsuario = datos.rol;
    const permitido = rolesPermitidos.includes(rolUsuario);
    
    if (!permitido) {
        alert('⚠️ No tienes permisos para acceder a esta página');
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function mostrarRespuesta(elementId, mensaje, tipo) {
    const element = document.getElementById(elementId);
    if (element) {
        if (mensaje && mensaje.trim() !== '') {
            element.textContent = mensaje;
            element.className = `response ${tipo}`;
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    }
}

// ============================================
// FUNCIÓN: REGISTRAR USUARIO (MEJORADA)
// ============================================
// ============================================
// FUNCIÓN: REGISTRAR USUARIO
// ============================================
async function registrarUsuario(event) {
    if (event) event.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    
    if (! authToken) {
        alert('⚠️ No estás autenticado. Redirigiendo al login...');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const departamento = document.getElementById('regDepartamento').value;
    const rol = document.getElementById('regRol').value;

    // Validaciones
    if (!username || !password || !rol) {
        alert('⚠️ Por favor completa todos los campos obligatorios');
        return;
    }

    if (username.length < 3) {
        alert('⚠️ El nombre de usuario debe tener al menos 3 caracteres');
        return;
    }

    if (password.length < 8) {
        alert('⚠️ La contraseña debe tener al menos 8 caracteres');
        return;
    }

    const departamentoFinal = (rol === 'Administrador' || rol === 'Auditor') ? '' : departamento;

    if ((rol === 'Empleado' || rol === 'Supervisor') && !departamentoFinal) {
        alert('⚠️ Los empleados y supervisores deben tener un departamento');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/general/registro`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                departamento: departamentoFinal,
                rol
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Mostrar diálogo con los datos del usuario creado
            const datosUsuario = {
                'Usuario': username,
                'Rol': rol
            };
            
            if (departamentoFinal) {
                datosUsuario['Departamento'] = departamentoFinal;
            }
            
            mostrarDialogoExito('👤 USUARIO CREADO EXITOSAMENTE', datosUsuario);
            
            // Limpiar formulario
            document.getElementById('registroForm').reset();
            const deptGroup = document.getElementById('departamentoGroup');
            if (deptGroup) deptGroup.style.display = 'none';
            
            mostrarRespuesta('regResponse', data.msg || '✅ Usuario registrado correctamente', 'success');
        } else {
            alert('❌ ERROR AL CREAR USUARIO\n\n' + (data.msg || 'Error desconocido'));
            mostrarRespuesta('regResponse', data.msg || 'Error al registrar usuario', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        alert('❌ ERROR DE CONEXIÓN\n\n' + error.message);
        mostrarRespuesta('regResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}





// ============================================
// FUNCIÓN: LOGIN USUARIO
// ============================================
async function loginUsuario(event) {
    if (event) event. preventDefault();
    
    console.log('🚀 Iniciando login.. .');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('👤 Usuario:', username);

    if (!username || !password) {
        mostrarRespuesta('loginResponse', '⚠️ Por favor ingresa usuario y contraseña', 'error');
        return;
    }

    try {
        console.log('📡 URL:', `${API_BASE_URL}/general/login`);
        
        const response = await fetch(`${API_BASE_URL}/general/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        console.log('📥 Status:', response.status);

        const textResponse = await response.text();
        console.log('📄 Respuesta:', textResponse);

        let data;
        try {
            data = JSON.parse(textResponse);
            console.log('✅ JSON:', data);
        } catch (e) {
            console.error('❌ Error parseando JSON:', e);
            mostrarRespuesta('loginResponse', '❌ Respuesta inválida del servidor', 'error');
            return;
        }
        
        if (response.ok) {
            console.log('✅ Login OK');
            console.log('🔑 Token:', data.token);
            
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                console.log('💾 Token guardado');
                
                mostrarRespuesta('loginResponse', '✅ Login exitoso.  Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location. href = 'dashboard.html';
                }, 1500);
            } else {
                console.error('❌ No hay token');
                mostrarRespuesta('loginResponse', data.mensaje || 'Error: No se recibió el token', 'error');
            }
        } else {
            console.error('❌ Login fallido');
            mostrarRespuesta('loginResponse', data.mensaje || 'Error en el login', 'error');
        }
    } catch (error) {
        console.error('💥 Error:', error);
        mostrarRespuesta('loginResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN: FICHAR (MEJORADA CON FEEDBACK)
// ============================================
async function fichar() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        alert('⚠️ No estás autenticado. Redirigiendo al login...');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/fichar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            // Obtener datos del usuario del token
            const usuario = obtenerDatosToken();
            const ahora = new Date();
            const fecha = ahora.toLocaleDateString('es-ES');
            const hora = ahora.toLocaleTimeString('es-ES');
            
            // Mostrar diálogo con los datos del fichaje
            mostrarDialogoExito('🎉 FICHAJE REGISTRADO', {
                'Usuario': usuario.username,
                'Departamento': usuario.departamento || 'N/A',
                'Fecha': fecha,
                'Hora': hora,
                'Tipo': data.tipo || 'Entrada/Salida',
                'Estado': 'Guardado en blockchain'
            });
            
            mostrarRespuesta('ficharResponse', data.mensaje || '✅ Fichaje registrado correctamente', 'success');
        } else {
            alert('❌ ERROR AL FICHAR\n\n' + (data.mensaje || 'Error desconocido'));
            mostrarRespuesta('ficharResponse', data.mensaje || 'Error al fichar', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        alert('❌ ERROR DE CONEXIÓN\n\n' + error.message);
        mostrarRespuesta('ficharResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN:  LISTAR FICHAJES DEL USUARIO (CON PAGINACIÓN)
// ============================================
let paginaActual = 0;
let elementosPorPagina = 5;

async function listarFichajes(pagina = 0) {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('listarResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location. href = 'login.html', 2000);
        return;
    }

    paginaActual = pagina;

    try {
        const url = `${API_BASE_URL}/listarFichajesUsuario?pagina=${pagina}&elementosPorPagina=${elementosPorPagina}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const fichajes = await response.json();
            
            if (fichajes.length === 0 && pagina === 0) {
                mostrarRespuesta('listarResponse', 'ℹ️ No tienes fichajes registrados aún', 'success');
                document.getElementById('fichajesTable').innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay fichajes para mostrar</p>';
                document.getElementById('paginacionControles').style.display = 'none';
            } else {
                mostrarRespuesta('listarResponse', `✅ Mostrando fichajes de la página ${pagina + 1}`, 'success');
                mostrarTablaFichajesConEditar(fichajes);
                actualizarControlesPaginacion(fichajes. length);
            }
        } else {
            const data = await response.json();
            mostrarRespuesta('listarResponse', data.mensaje || 'Error al listar fichajes', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        mostrarRespuesta('listarResponse', '❌ Error de conexión:  ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN: ACTUALIZAR CONTROLES DE PAGINACIÓN
// ============================================
function actualizarControlesPaginacion(fichajesEnPagina) {
    const controles = document.getElementById('paginacionControles');
    
    if (! controles) return;
    
    controles.style.display = 'flex';
    
    const hayMasPaginas = fichajesEnPagina === elementosPorPagina;
    const esLaPrimeraPagina = paginaActual === 0;
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; gap: 15px;">
            <button 
                class="btn btn-secondary" 
                onclick="listarFichajes(${paginaActual - 1})" 
                ${esLaPrimeraPagina ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                ← Anterior
            </button>
            
            <span style="color: #666; font-weight: 500;">
                Página ${paginaActual + 1} 
                <span style="font-size: 0.9em; color: #999;">(${fichajesEnPagina} fichaje${fichajesEnPagina !== 1 ? 's' :  ''})</span>
            </span>
            
            <button 
                class="btn btn-secondary" 
                onclick="listarFichajes(${paginaActual + 1})" 
                ${! hayMasPaginas ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                Siguiente →
            </button>
        </div>
        
        <div style="text-align: center; margin-top: 15px;">
            <label for="elementosPorPaginaSelect" style="color: #666; margin-right: 10px;">Fichajes por página:</label>
            <select id="elementosPorPaginaSelect" onchange="cambiarElementosPorPagina(this.value)" style="padding: 5px 10px; border-radius: 5px; border: 1px solid #ddd;">
                <option value="5" ${elementosPorPagina === 5 ? 'selected' : ''}>5</option>
                <option value="10" ${elementosPorPagina === 10 ? 'selected' : ''}>10</option>
                <option value="20" ${elementosPorPagina === 20 ? 'selected' : ''}>20</option>
                <option value="50" ${elementosPorPagina === 50 ? 'selected' : ''}>50</option>
            </select>
        </div>
    `;
    
    controles.innerHTML = html;
}

// ============================================
// FUNCIÓN: CAMBIAR ELEMENTOS POR PÁGINA
// ============================================
function cambiarElementosPorPagina(nuevoValor) {
    elementosPorPagina = parseInt(nuevoValor);
    listarFichajes(0); // Volver a la primera página
}

// ============================================
// FUNCIÓN: APROBAR SOLICITUD (SUPERVISOR)
// ============================================
async function aprobarSolicitud(solicitudId) {
    console.log('📤 Intentando aprobar solicitud ID:', solicitudId);
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        alert('⚠️ No estás autenticado');
        window.location.href = 'login.html';
        return;
    }

    // Validar que solicitudId sea un número válido
    if (! solicitudId || isNaN(solicitudId)) {
        alert('❌ Error: ID de solicitud inválido');
        console.error('solicitudId inválido:', solicitudId);
        return;
    }

    if (! confirm('¿Estás seguro de que deseas aprobar esta solicitud?')) {
        return;
    }

    // ✅ CORRECCIÓN: Usar URLSearchParams para construir la URL correctamente
    const params = new URLSearchParams();
    params.append('solicitudId', solicitudId);
    
    const url = `${API_BASE_URL}/aprobarSolicitud?${params. toString()}`;
    console.log('📡 URL de la petición:', url);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        console.log('📥 Status de la respuesta:', response.status);

        const data = await response.json();
        console.log('📦 Respuesta del servidor:', data);
        
        if (response.ok) {
            alert(data.msg || '✅ Solicitud aprobada correctamente');
            listarSolicitudesPendientes();
        } else {
            alert(data.msg || 'Error al aprobar solicitud');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        console.error('💥 Error en aprobarSolicitud:', error);
        alert('❌ Error de conexión: ' + error.message);
    }
}

// ============================================
// FUNCIÓN: SOLICITAR EDICIÓN
// ============================================
async function solicitarEdicion(event) {
    if (event) event.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('edicionResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    const fichajeId = document.getElementById('fichajeIdHidden')?.value;
    const nuevoInstanteInput = document.getElementById('nuevoInstante').value;

    if (!fichajeId) {
        mostrarRespuesta('edicionResponse', '⚠️ No se ha seleccionado un fichaje válido', 'error');
        return;
    }

    if (!nuevoInstanteInput) {
        mostrarRespuesta('edicionResponse', '⚠️ Por favor completa todos los campos', 'error');
        return;
    }

    // ✅ NUEVO:  Convertir de hora local a UTC
    const nuevoInstante = convertirLocalAUTC(nuevoInstanteInput);

    if (!nuevoInstante) {
        mostrarRespuesta('edicionResponse', '❌ Fecha inválida', 'error');
        return;
    }

    console.log('📤 Enviando solicitud de edición:', {
        id_fichaje: parseInt(fichajeId),
        nuevoInstante: nuevoInstante,
    });

    try {
        const response = await fetch(`${API_BASE_URL}/solicitarEdicion`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_fichaje: parseInt(fichajeId),
                nuevoInstante: nuevoInstante,
            })
        });

        const data = await response.json();
        
        console.log('📥 Respuesta del servidor:', data);
        
        if (response.ok) {
            mostrarRespuesta('edicionResponse', data.msg || '✅ Solicitud de edición registrada correctamente. Redirigiendo a tus fichajes...', 'success');
            
            setTimeout(() => {
                window.location.href = 'fichajes.html';
            }, 2000);
        } else {
            mostrarRespuesta('edicionResponse', data.msg || data.mensaje || 'Error al solicitar edición', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        console.error('💥 Error al solicitar edición:', error);
        mostrarRespuesta('edicionResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN:  LISTAR SOLICITUDES PENDIENTES (CON PAGINACIÓN)
// ============================================
let paginaActualSolicitudes = 0;
let elementosPorPaginaSolicitudes = 5;

async function listarSolicitudesPendientes(pagina = 0) {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('solicitudesResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    paginaActualSolicitudes = pagina;

    try {
        const url = `${API_BASE_URL}/listarSolicitudes?pagina=${pagina}&elementosPorPagina=${elementosPorPaginaSolicitudes}`;
        
        console.log('📡 Listando solicitudes:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const solicitudes = await response.json();
            console.log('📦 Solicitudes recibidas:', solicitudes);
            
            if (solicitudes.length === 0 && pagina === 0) {
                mostrarSolicitudes([]);
                const controles = document.getElementById('paginacionControlesSolicitudes');
                if (controles) {
                    controles.style.display = 'none';
                }
            } else if (solicitudes.length === 0 && pagina > 0) {
                // Volver a la página anterior si no hay resultados
                listarSolicitudesPendientes(pagina - 1);
            } else {
                mostrarSolicitudes(solicitudes);
                actualizarControlesPaginacionSolicitudes(solicitudes.length);
            }
        } else {
            const error = await response.text();
            mostrarRespuesta('solicitudesResponse', error || 'Error al cargar solicitudes', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        console.error('Error al listar solicitudes:', error);
        mostrarRespuesta('solicitudesResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN:  MOSTRAR SOLICITUDES EN TABLA
// ============================================
function mostrarSolicitudes(solicitudes) {
    const container = document.getElementById('solicitudesContainer');
    
    if (! container) return;
    
    if (! solicitudes || solicitudes.length === 0) {
        container. innerHTML = `
            <p style="text-align: center; color: #666; padding: 20px;">
                No hay solicitudes pendientes en este momento.
            </p>
        `;
        return;
    }
    
    let tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <thead>
                <tr style="background:  #5e72e4; color: white;">
                    <th style="padding: 12px; text-align: left; border:  1px solid #ddd;">ID Solicitud</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Usuario</th>
                    <th style="padding: 12px; text-align: left; border:  1px solid #ddd;">Instante Original</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Nuevo Instante</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Tipo</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Estado</th>
                    <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Acción</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    solicitudes.forEach((solicitud, index) => {
        const estadoAprobado = solicitud.aprobado || 'FALSO';
        let estadoHTML = '';
        let accionHTML = '';
        const bgColor = index % 2 === 0 ? '#f8f9fa' : 'white';
        
        if (estadoAprobado === 'VERDADERO') {
            estadoHTML = '<span style="color: #28a745; font-weight: bold;">✅ Aprobada</span>';
            accionHTML = '<span style="color: #28a745;">✅ Aprobada</span>';
        } else if (estadoAprobado === 'FALSO') {
            estadoHTML = '<span style="color: #6c757d;">⏳ Pendiente</span>';
            accionHTML = `<button class="btn btn-success btn-sm" onclick="aprobarSolicitud(${solicitud.id})">✅ Aprobar</button>`;
        } else {
            estadoHTML = '<span style="color: #999;">❓ Desconocido</span>';
            accionHTML = '<span style="color: #999;">-</span>';
        }
        
        const instanteOriginal = formatearFechaLocal(solicitud.instante_original) || 'N/A';
        const nuevoInstante = formatearFechaLocal(solicitud.nuevo_instante) || 'N/A';
        
        tableHTML += `
            <tr style="background: ${bgColor};">
                <td style="padding:  10px; border: 1px solid #ddd;"><strong>${solicitud.id}</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${solicitud.username || 'N/A'}</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #dc3545; text-decoration: line-through;">${instanteOriginal}</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #007bff; font-weight: 500;">${nuevoInstante}</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><span style="background: #e3f2fd; padding: 4px 8px; border-radius: 4px;">${solicitud.tipo || 'N/A'}</span></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${estadoHTML}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${accionHTML}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// ============================================
// FUNCIÓN:  ACTUALIZAR CONTROLES DE PAGINACIÓN SOLICITUDES
// ============================================
function actualizarControlesPaginacionSolicitudes(solicitudesEnPagina) {
    const controles = document.getElementById('paginacionControlesSolicitudes');
    
    if (!controles) {
        console.warn('⚠️ No se encontró el elemento paginacionControlesSolicitudes');
        return;
    }
    
    controles.style.display = 'block';
    
    const hayMasPaginas = solicitudesEnPagina === elementosPorPaginaSolicitudes;
    const esLaPrimeraPagina = paginaActualSolicitudes === 0;
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; gap: 15px; flex-wrap: wrap;">
            <button 
                class="btn btn-secondary" 
                onclick="listarSolicitudesPendientes(${paginaActualSolicitudes - 1})" 
                ${esLaPrimeraPagina ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' :  ''}>
                ← Anterior
            </button>
            
            <span style="color: #666; font-weight: 500;">
                Página ${paginaActualSolicitudes + 1} 
                <span style="font-size: 0.9em; color: #999;">(${solicitudesEnPagina} solicitud${solicitudesEnPagina !== 1 ? 'es' : ''})</span>
            </span>
            
            <button 
                class="btn btn-secondary" 
                onclick="listarSolicitudesPendientes(${paginaActualSolicitudes + 1})" 
                ${! hayMasPaginas ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                Siguiente →
            </button>
        </div>
        
        <div style="text-align: center; margin-top: 15px;">
            <label for="elementosPorPaginaSolicitudesSelect" style="color: #666; margin-right: 10px;">Solicitudes por página:</label>
            <select id="elementosPorPaginaSolicitudesSelect" onchange="cambiarElementosPorPaginaSolicitudes(this.value)" style="padding: 5px 10px; border-radius: 5px; border: 1px solid #ddd;">
                <option value="5" ${elementosPorPaginaSolicitudes === 5 ? 'selected' : ''}>5</option>
                <option value="10" ${elementosPorPaginaSolicitudes === 10 ? 'selected' : ''}>10</option>
                <option value="20" ${elementosPorPaginaSolicitudes === 20 ? 'selected' : ''}>20</option>
                <option value="50" ${elementosPorPaginaSolicitudes === 50 ? 'selected' :  ''}>50</option>
            </select>
        </div>
    `;
    
    controles.innerHTML = html;
}

// ============================================
// FUNCIÓN: CAMBIAR ELEMENTOS POR PÁGINA SOLICITUDES
// ============================================
function cambiarElementosPorPaginaSolicitudes(nuevoValor) {
    elementosPorPaginaSolicitudes = parseInt(nuevoValor);
    console.log('📊 Elementos por página (solicitudes) cambiados a:', elementosPorPaginaSolicitudes);
    listarSolicitudesPendientes(0); // Volver a la primera página
}

// ============================================
// FUNCIÓN: CERRAR SESIÓN
// ============================================
function cerrarSesion() {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
}

// ============================================
// FUNCIÓN:  VERIFICAR INTEGRIDAD (CON PAGINACIÓN)
// ============================================
let paginaActualIntegridad = 0;
let elementosPorPaginaIntegridad = 5;

async function verificarIntegridad(event, pagina = 0) {
    if (event) event.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('verificarResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    const departamento = document.getElementById('regDepartamento').value;

    if (!departamento) {
        mostrarRespuesta('verificarResponse', '⚠️ Por favor ingresa un departamento', 'error');
        return;
    }

    paginaActualIntegridad = pagina;

    mostrarRespuesta('verificarResponse', '🔄 Verificando integridad, por favor espera...', 'success');

    // Limpiar tabla antes de cargar
    const container = document.getElementById('detallesVerificacion');
    if (container) {
        container. innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">🔄 Verificando integridad... </p>';
    }

    try {
        const url = `${API_BASE_URL}/verificarIntegridadFichajes?departamento=${encodeURIComponent(departamento)}&pagina=${pagina}&elementosPorPagina=${elementosPorPaginaIntegridad}`;
        
        console.log('📡 Verificando integridad:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        console.log('📦 Respuesta de verificación:', data);
        
        if (response.ok) {
            const responseElement = document.getElementById('verificarResponse');
            if (responseElement) {
                responseElement.style.display = 'none';
            }
            
            if (data.length === 0 && pagina === 0) {
                mostrarRespuesta('verificarResponse', 'ℹ️ No hay fichajes en este departamento', 'success');
                if (container) {
                    container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay fichajes para verificar</p>';
                }
                const controles = document.getElementById('paginacionControlesIntegridad');
                if (controles) {
                    controles.style.display = 'none';
                }
            } else if (data.length === 0 && pagina > 0) {
                // Si estamos en una página mayor que 0 y no hay resultados, volver a la página anterior
                verificarIntegridad(null, pagina - 1);
            } else {
                mostrarTablaIntegridad(data, departamento);
                actualizarControlesPaginacionIntegridad(data.length, departamento);
            }
        } else {
            mostrarRespuesta('verificarResponse', data.mensaje || data.msg || 'Error al verificar integridad', 'error');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 20px;">❌ Error al verificar integridad</p>';
            }
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        console.error('Error al verificar integridad:', error);
        mostrarRespuesta('verificarResponse', '❌ Error de conexión:  ' + error.message, 'error');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding:  20px;">❌ Error de conexión</p>';
        }
    }
}

// ============================================
// FUNCIÓN:  ACTUALIZAR CONTROLES DE PAGINACIÓN INTEGRIDAD
// ============================================
function actualizarControlesPaginacionIntegridad(fichajesEnPagina, departamento) {
    const controles = document.getElementById('paginacionControlesIntegridad');
    
    if (! controles) {
        console.warn('⚠️ No se encontró el elemento paginacionControlesIntegridad');
        return;
    }
    
    controles.style.display = 'block';
    
    const hayMasPaginas = fichajesEnPagina === elementosPorPaginaIntegridad;
    const esLaPrimeraPagina = paginaActualIntegridad === 0;
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; gap: 15px; flex-wrap: wrap;">
            <button 
                class="btn btn-secondary" 
                onclick="verificarIntegridad(null, ${paginaActualIntegridad - 1})" 
                ${esLaPrimeraPagina ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' :  ''}>
                ← Anterior
            </button>
            
            <span style="color: #666; font-weight: 500;">
                Página ${paginaActualIntegridad + 1} 
                <span style="font-size: 0.9em; color: #999;">(${fichajesEnPagina} fichaje${fichajesEnPagina !== 1 ? 's' :  ''})</span>
            </span>
            
            <button 
                class="btn btn-secondary" 
                onclick="verificarIntegridad(null, ${paginaActualIntegridad + 1})" 
                ${! hayMasPaginas ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                Siguiente →
            </button>
        </div>
        
        <div style="text-align: center; margin-top: 15px;">
            <label for="elementosPorPaginaIntegridadSelect" style="color: #666; margin-right: 10px;">Fichajes por página:</label>
            <select id="elementosPorPaginaIntegridadSelect" onchange="cambiarElementosPorPaginaIntegridad(this.value, '${departamento}')" style="padding: 5px 10px; border-radius: 5px; border: 1px solid #ddd;">
                <option value="5" ${elementosPorPaginaIntegridad === 5 ? 'selected' : ''}>5</option>    
                <option value="10" ${elementosPorPaginaIntegridad === 10 ? 'selected' : ''}>10</option>
                <option value="20" ${elementosPorPaginaIntegridad === 20 ? 'selected' : ''}>20</option>
                <option value="50" ${elementosPorPaginaIntegridad === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${elementosPorPaginaIntegridad === 100 ? 'selected' : ''}>100</option>
            </select>
        </div>
    `;
    
    controles.innerHTML = html;
}

// ============================================
// FUNCIÓN:  CAMBIAR ELEMENTOS POR PÁGINA INTEGRIDAD
// ============================================
function cambiarElementosPorPaginaIntegridad(nuevoValor, departamento) {
    elementosPorPaginaIntegridad = parseInt(nuevoValor);
    console.log('📊 Elementos por página (integridad) cambiados a:', elementosPorPaginaIntegridad);
    verificarIntegridad(null, 0); // Volver a la primera página
}


// ============================================
// FUNCIÓN: MOSTRAR TABLA DE INTEGRIDAD
// ============================================
function mostrarTablaIntegridad(fichajes, departamento) {
    const container = document.getElementById('detallesVerificacion');
    
    if (!container) return;
    
    if (! fichajes || fichajes.length === 0) {
        container. innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                <p>No hay fichajes en el departamento <strong>${departamento}</strong></p>
            </div>
        `;
        return;
    }
    
    const fichajesOrdenados = [... fichajes].sort((a, b) => {
        return (b.id || 0) - (a.id || 0);
    });
    
    let corruptos = 0;
    let validos = 0;
    
    fichajesOrdenados. forEach(f => {
        const mensaje = (f.mensaje || f.estado || '').toUpperCase();
        
        if (mensaje.includes('INCONSISTENCIA') || 
            mensaje.includes('CORRUPTO') || 
            mensaje. includes('COMPROMETID') ||
            mensaje.includes('INVÁLIDO') ||
            mensaje.includes('ERROR') ||
            mensaje.includes('DETECTADA')) {
            corruptos++;
        } else {
            validos++;
        }
    });
    
    const totalFichajes = fichajesOrdenados.length;
    const integridadOK = corruptos === 0;
    
    let headerHTML = '';
    if (integridadOK) {
        headerHTML = `
            <div style="background: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 3em; margin-bottom: 10px;">✅</div>
                <h2 style="color: #155724; margin: 0;">¡Integridad Verificada!</h2>
                <p style="color: #155724; margin-top: 10px;">
                    Todos los <strong>${totalFichajes}</strong> fichajes del departamento 
                    <strong>${departamento}</strong> son válidos y auténticos.
                </p>
            </div>
        `;
    } else {
        headerHTML = `
            <div style="background: #f8d7da; border: 2px solid #dc3545; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
                <div style="font-size: 3em; margin-bottom: 10px;">⚠️</div>
                <h2 style="color: #721c24; margin: 0;">¡Integridad Comprometida!</h2>
                <p style="color: #721c24; margin-top: 10px;">
                    Se detectaron <strong>${corruptos}</strong> fichaje(s) con inconsistencias de un total de 
                    <strong>${totalFichajes}</strong> en el departamento <strong>${departamento}</strong>.
                </p>
            </div>
        `;
    }
    
    let tableHTML = `
        ${headerHTML}
        <h3 style="margin-bottom: 15px;">📊 Detalle de Fichajes (ordenados por ID):</h3>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Fecha y Hora</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    fichajesOrdenados.forEach(fichaje => {
        const id = fichaje.id || '-';
        const username = fichaje.username || fichaje.usuario || 'N/A';

        const instanteUTC = fichaje.instante || fichaje.fecha || 'N/A';
        const instante = formatearFechaLocal(instanteUTC);

        const tipo = fichaje.tipo || 'N/A';
        const mensaje = fichaje.mensaje || fichaje.estado || 'Estado desconocido';
        
        const mensajeUpper = mensaje.toUpperCase();
        const esCorrupto = mensajeUpper.includes('INCONSISTENCIA') || 
                          mensajeUpper.includes('CORRUPTO') || 
                          mensajeUpper.includes('COMPROMETID') ||
                          mensajeUpper.includes('INVÁLIDO') ||
                          mensajeUpper.includes('ERROR') ||
                          mensajeUpper.includes('DETECTADA');
        
        const estadoHTML = esCorrupto 
            ? `<span style="background: #f8d7da; color: #721c24; padding: 6px 12px; border-radius: 4px; font-weight: bold; display: inline-block;">⚠️ ${mensaje}</span>`
            : `<span style="background: #d4edda; color: #155724; padding: 6px 12px; border-radius: 4px; font-weight: bold; display: inline-block;">✅ ${mensaje}</span>`;
        
        const estiloFila = esCorrupto 
            ? 'style="background-color: #fff5f5; border-left: 4px solid #dc3545;"'
            : '';
        
        tableHTML += `
            <tr ${estiloFila}>
                <td><strong>${id}</strong></td>
                <td>${username}</td>
                <td>${instante}</td>
                <td><strong>${tipo}</strong></td>
                <td>${estadoHTML}</td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    const porcentajeValidos = totalFichajes > 0 ?  ((validos / totalFichajes) * 100).toFixed(1) : 0;
    const porcentajeCorruptos = totalFichajes > 0 ?  ((corruptos / totalFichajes) * 100).toFixed(1) : 0;
    
    tableHTML += `
        <div style="margin-top: 20px; padding: 20px; background-color: ${integridadOK ? '#e7f3ff' : '#fff3cd'}; border-radius: 8px; border-left: 4px solid ${integridadOK ? '#2196F3' : '#ffc107'};">
            <strong>📈 Resumen de Verificación:</strong>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
                <div>
                    <div style="font-size: 0.9em; color: #666;">Fichajes válidos</div>
                    <div style="font-size: 1. 5em; font-weight: bold; color: #28a745;">✅ ${validos} (${porcentajeValidos}%)</div>
                </div>
                <div>
                    <div style="font-size: 0.9em; color: #666;">Fichajes con inconsistencias</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #dc3545;">⚠️ ${corruptos} (${porcentajeCorruptos}%)</div>
                </div>
                <div>
                    <div style="font-size: 0.9em; color: #666;">Total de fichajes</div>
                    <div style="font-size: 1.5em; font-weight: bold; color: #333;">📊 ${totalFichajes}</div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = tableHTML;
    container.style.display = 'block';
}



// ============================================
// FUNCIÓN: MOSTRAR TABLA DE SOLICITUDES
// ============================================
function mostrarTablaSolicitudes(solicitudes) {
    const tableContainer = document.getElementById('solicitudesTable');
    
    if (!tableContainer) return;
    
    if (! solicitudes || solicitudes.length === 0) {
        tableContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay solicitudes pendientes</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID Solicitud</th>
                    <th>Usuario</th>
                    <th>Nuevo Instante</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    solicitudes.forEach(sol => {
        const id = sol.id || '-';
        const username = sol.username || sol.usuario || 'N/A';  // ← NUEVO CAMPO

        const nuevoInstanteUTC = sol.nuevo_instante || sol.nuevoInstante || 'N/A';
        const nuevoInstante = formatearFechaLocal(nuevoInstanteUTC);

        const tipo = sol. tipo || 'N/A';
        const aprobado = sol.aprobado;
        
        let estaAprobado = false;
        
        if (typeof aprobado === 'boolean') {
            estaAprobado = aprobado === true;
        } else if (typeof aprobado === 'string') {
            const aprobadoUpper = aprobado.toUpperCase(). trim();
            estaAprobado = aprobadoUpper === 'VERDADERO' || 
                          aprobadoUpper === 'TRUE' || 
                          aprobadoUpper === 'SI' || 
                          aprobadoUpper === 'YES' ||
                          aprobadoUpper === '1';
        } else if (typeof aprobado === 'number') {
            estaAprobado = aprobado === 1;
        }
        
        const botonAprobar = ! estaAprobado
            ? `<button class="btn btn-success btn-sm" onclick="aprobarSolicitud(${id})">✓ Aprobar</button>`
            : `<span style="color: #28a745; font-weight: bold;">✅ Aprobada</span>`;
        
        const estadoTexto = ! estaAprobado 
            ? '<span style="color: #ffc107;">⏳ Pendiente</span>' 
            : '<span style="color: #28a745;">✅ Aprobada</span>';
        
        const estiloFila = estaAprobado ?  'style="opacity: 0.6; background-color: #f0f0f0;"' : '';
        
        tableHTML += `
            <tr ${estiloFila}>
                <td>${id}</td>
                <td><strong style="color: #495057;">${username}</strong></td>
                <td>${nuevoInstante}</td>
                <td><strong>${tipo}</strong></td>
                <td>${estadoTexto}</td>
                <td>${botonAprobar}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}

// ============================================
// FUNCIÓN: MOSTRAR TABLA DE FICHAJES DEL USUARIO (CON BOTÓN EDITAR Y ESTADOS)
// ============================================
function mostrarTablaFichajesConEditar(fichajes) {
    const tableContainer = document.getElementById('fichajesTable');
    
    if (!tableContainer) return;
    
    if (!fichajes || fichajes. length === 0) {
        tableContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay fichajes registrados</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Fecha y Hora</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    fichajes.forEach(fichaje => {

        const instanteAnteriorUTC = fichaje.instanteAnterior || 'N/A';
        const instanteAnterior = formatearFechaLocal(instanteAnteriorUTC);
        
        const nuevoInstanteUTC = fichaje.nuevoInstante;
        const nuevoInstante = nuevoInstanteUTC ?  formatearFechaLocal(nuevoInstanteUTC) : null;

        const tipoAnterior = fichaje.tipoAnterior || 'N/A';
 
        const nuevoTipo = fichaje.nuevoTipo;
        const idFichaje = fichaje.id_fichaje || fichaje.id;
        const aprobadoEdicion = fichaje.aprobadoEdicion;
        
        // Determinar el estado basado en aprobadoEdicion
        let estadoAprobacion = null;
        
        if (aprobadoEdicion === null || aprobadoEdicion === undefined) {
            estadoAprobacion = null;
        } else if (typeof aprobadoEdicion === 'boolean') {
            estadoAprobacion = aprobadoEdicion ? 'aprobado' : 'pendiente';
        } else if (typeof aprobadoEdicion === 'string') {
            const aprobadoUpper = aprobadoEdicion.toUpperCase().trim();
            if (aprobadoUpper === 'VERDADERO' || aprobadoUpper === 'TRUE') {
                estadoAprobacion = 'aprobado';
            } else if (aprobadoUpper === 'FALSO' || aprobadoUpper === 'FALSE') {
                estadoAprobacion = 'pendiente';
            }
        }
        
        const fueEditado = nuevoInstante && nuevoInstante !== null && nuevoInstante !== '' && estadoAprobacion === 'aprobado';
        
        let celdaFechaHora = '';
        let celdaTipo = '';
        let celdaEstado = '';
        let botonEditar = '';
        
        if (estadoAprobacion === 'aprobado') {
            // ✅ EDICIÓN APROBADA
            celdaFechaHora = `
                <div>
                    <div style="color: #dc3545; text-decoration: line-through; font-size: 0. 85em;">
                        ${instanteAnterior}
                    </div>
                    <div style="color: #28a745; font-weight: bold;">
                        ${nuevoInstante}
                    </div>
                </div>
            `;
            
            celdaTipo = `
                <div>
                    <div style="color: #dc3545; text-decoration: line-through; font-size: 0.85em;">
                        ${tipoAnterior}
                    </div>
                    <div style="color: #28a745; font-weight: bold;">
                        ${nuevoTipo}
                    </div>
                </div>
            `;
            
            celdaEstado = '<span style="background: #d4edda; padding: 6px 10px; border-radius: 4px; color: #155724; font-size: 0.85em; font-weight: bold; display: inline-block;">✏️ Editado</span>';
            
            const instanteEscapado = String(nuevoInstante).replace(/'/g, "\\'");
            const tipoEscapado = String(nuevoTipo).replace(/'/g, "\\'");
            botonEditar = `<button class="btn btn-secondary btn-sm" onclick="abrirFormularioEdicion(${idFichaje}, '${instanteEscapado}', '${tipoEscapado}')" style="font-size: 0.85em; white-space: nowrap;">✏️ Editar</button>`;
            
        } else if (estadoAprobacion === 'pendiente') {
            // ⏳ PENDIENTE: Determinar el valor efectivo actual
            // Si nuevoInstante existe → última edición aprobada es el valor efectivo
            // Si nuevoInstante es null → el valor original es el valor efectivo

            const valorEfectivoActualUTC = fichaje.nuevoInstante || fichaje.instanteAnterior;
            const valorEfectivoActual = formatearFechaLocal(valorEfectivoActualUTC);

            const tipoEfectivoActual = fichaje.nuevoTipo || fichaje.tipoAnterior;
            
            // El valor solicitado viene de solicitudInstante (solo existe cuando aprobado=FALSO)
            const solicitudInstanteUTC = fichaje.solicitudInstante;
            const valorSolicitado = solicitudInstanteUTC ? formatearFechaLocal(solicitudInstanteUTC) : null;
            const tipoSolicitado = fichaje.solicitudTipo;
            
            celdaFechaHora = `
                <div style="line-height: 1.6;">
                    <div style="color: #333; font-weight: 500;">${valorEfectivoActual}</div>
                    <div style="display: flex; align-items: center; gap: 5px; margin-top: 5px;">
                        <span style="color: #856404; font-size: 0.9em;">→</span>
                        <span style="color: #856404; font-weight: 600; font-size: 0.95em;">${valorSolicitado}</span>
                    </div>
                </div>
            `;
            
            celdaTipo = `
                <div style="line-height: 1.6;">
                    <div style="color: #333;"><strong>${tipoEfectivoActual}</strong></div>
                    <div style="display: flex; align-items: center; gap: 5px; margin-top: 5px;">
                        <span style="color: #856404; font-size: 0.9em;">→</span>
                        <span style="color: #856404; font-weight: 600; font-size: 0.95em;">${tipoSolicitado}</span>
                    </div>
                </div>
            `;
            
            celdaEstado = '<span style="background: #fff3cd; padding: 6px 10px; border-radius: 4px; color: #856404; font-size: 0.85em; font-weight: bold; display: inline-block;">⏳ Pendiente</span>';
            
            botonEditar = `<button class="btn btn-secondary btn-sm" disabled style="font-size: 0. 85em; opacity: 0.5; cursor: not-allowed; white-space: nowrap;">⏳ En trámite</button>`;
            
        } else {
            // 📋 ORIGINAL
            celdaFechaHora = instanteAnterior;
            celdaTipo = `<strong>${tipoAnterior}</strong>`;
            celdaEstado = '<span style="color: #6c757d; font-size: 0.85em; display: inline-block;">📋 Original</span>';
            
            const instanteEscapado = String(instanteAnterior).replace(/'/g, "\\'");
            const tipoEscapado = String(tipoAnterior).replace(/'/g, "\\'");
            botonEditar = `<button class="btn btn-secondary btn-sm" onclick="abrirFormularioEdicion(${idFichaje}, '${instanteEscapado}', '${tipoEscapado}')" style="font-size: 0.85em; white-space: nowrap;">✏️ Editar</button>`;
        }
        
        let estiloFila = '';
        if (estadoAprobacion === 'aprobado') {
            estiloFila = 'background-color: #f0fff4; border-left: 3px solid #28a745;';
        } else if (estadoAprobacion === 'pendiente') {
            estiloFila = 'background-color: #fffbf0; border-left: 3px solid #ffc107;';
        }
        
        tableHTML += `
            <tr style="${estiloFila}">
                <td>${celdaFechaHora}</td>
                <td>${celdaTipo}</td>
                <td style="text-align: center;">${celdaEstado}</td>
                <td style="text-align: center;">${botonEditar}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}

// ============================================
// FUNCIÓN: ABRIR FORMULARIO DE EDICIÓN
// ============================================
function abrirFormularioEdicion(idFichaje, instante, tipo) {
    localStorage.setItem('fichajeParaEditar', JSON.stringify({
        id: idFichaje,
        instante: instante,
        tipo: tipo
    }));
    
    window.location.href = 'editar.html';
}

// ============================================
// FUNCIÓN: CARGAR FICHAJES PARA EDITAR
// ============================================
async function cargarFichajesParaEditar() {
    const authToken = localStorage.getItem('authToken');
    
    if (! authToken) {
        mostrarRespuesta('edicionResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/listarFichajesUsuario`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const fichajes = await response.json();
            poblarSelectFichajes(fichajes);
        } else {
            const data = await response.json();
            const select = document.getElementById('fichajeSelect');
            if (select) {
                select.innerHTML = '<option value="">Error al cargar fichajes</option>';
            }
            mostrarRespuesta('edicionResponse', 'Error al cargar fichajes: ' + (data.mensaje || 'Error desconocido'), 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        console.error('Error al cargar fichajes:', error);
        const select = document.getElementById('fichajeSelect');
        if (select) {
            select.innerHTML = '<option value="">Error de conexión</option>';
        }
        mostrarRespuesta('edicionResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN: POBLAR SELECT DE FICHAJES
// ============================================
function poblarSelectFichajes(fichajes) {
    const select = document.getElementById('fichajeSelect');
    
    if (!select) return;
    
    if (! fichajes || fichajes.length === 0) {
        select. innerHTML = '<option value="">No tienes fichajes para editar</option>';
        return;
    }
    
    const fichajesOrdenados = [... fichajes].sort((a, b) => {
        const fechaA = new Date(a. instanteAnterior || a.instante || 0);
        const fechaB = new Date(b.instanteAnterior || b.instante || 0);
        return fechaB - fechaA;
    });
    
    let optionsHTML = '<option value="">Selecciona un fichaje</option>';
    
    fichajesOrdenados. forEach(fichaje => {
        const idFichaje = fichaje.id_fichaje || fichaje.id;

        const instanteUTC = fichaje.instanteAnterior || fichaje. instante || 'N/A';
        const instante = formatearFechaLocal(instanteUTC);

        const tipo = fichaje.tipoAnterior || fichaje. tipo || 'N/A';
        
        const fueEditado = fichaje.nuevoInstante && fichaje.nuevoInstante !== null && fichaje.nuevoInstante !== '';
        const badge = fueEditado ?  ' ✏️ [Editado]' : '';
        
        optionsHTML += `<option value="${idFichaje}">${instante} - ${tipo}${badge}</option>`;
    });
    
    select.innerHTML = optionsHTML;
}

// ============================================
// FUNCIÓN:  CARGAR DEPARTAMENTOS
// ============================================
async function cargarDepartamentos(selectId = 'regDepartamento') {
    try {
        const response = await fetch(`${API_BASE_URL}/general/listarDepartamentos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const departamentos = await response.json();
            
            // Llenar el select de departamentos
            const select = document.getElementById(selectId);
            
            if (! select) {
                console.warn(`⚠️ No se encontró el elemento con ID: ${selectId}`);
                return;
            }
            
            select.innerHTML = '<option value="">Selecciona un departamento</option>';
            
            departamentos.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                select.appendChild(option);
            });
        } else {
            console.error('Error al cargar departamentos:', response.status);
        }
    } catch (error) {
        console.error('Error al cargar departamentos:', error);
    }
}

// ============================================
// FUNCIÓN: CARGAR ROLES
// ============================================
async function cargarRoles() {
    try {
        const response = await fetch(`${API_BASE_URL}/general/listarRoles`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const roles = await response.json();
            
            // Llenar el select de roles
            const select = document.getElementById('regRol');
            select.innerHTML = '<option value="">Seleccionar rol</option>';
            
            roles. forEach(rol => {
                const option = document.createElement('option');
                option.value = rol;
                option.textContent = rol;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar roles:', error);
    }
}


// ============================================
// FUNCIÓN: CREAR DEPARTAMENTO (MEJORADA CON FEEDBACK)
// ============================================
async function crearDepartamento(event) {
    if (event) event.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        alert('⚠️ No estás autenticado. Redirigiendo al login...');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    const nombreDepartamento = document.getElementById('nombreDepartamento').value.trim();

    // Validaciones
    if (!nombreDepartamento) {
        alert('⚠️ Por favor ingresa el nombre del departamento');
        return;
    }

    if (nombreDepartamento.length < 2) {
        alert('⚠️ El nombre debe tener al menos 2 caracteres');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/general/crearDepartamento?nombreDepartamento=${encodeURIComponent(nombreDepartamento)}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            // Mostrar diálogo con los datos del departamento creado
            mostrarDialogoExito('🏢 DEPARTAMENTO CREADO EXITOSAMENTE', {
                'Nombre': nombreDepartamento,
                'Base de datos': `departamento_${nombreDepartamento.toLowerCase()}.db`,
                'Estado': 'Activo y disponible para asignar usuarios'
            });
            
            // Limpiar formulario
            document.getElementById('crearDepartamentoForm').reset();
            
            // Actualizar lista de departamentos
            setTimeout(() => {
                cargarDepartamentosExistentes();
            }, 500);
            
            mostrarRespuesta('crearDeptResponse', data.msg || '✅ Departamento creado correctamente', 'success');
        } else {
            alert('❌ ERROR AL CREAR DEPARTAMENTO\n\n' + (data.msg || 'Error desconocido'));
            mostrarRespuesta('crearDeptResponse', data.msg || 'Error al crear departamento', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        alert('❌ ERROR DE CONEXIÓN\n\n' + error. message);
        mostrarRespuesta('crearDeptResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN: CARGAR DEPARTAMENTOS EXISTENTES
// ============================================
async function cargarDepartamentosExistentes() {
    const container = document.getElementById('listaDepartamentos');
    
    if (! container) return;
    
    container.innerHTML = '<p style="color: #666; text-align: center;">🔄 Cargando departamentos...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/general/listarDepartamentos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const departamentos = await response.json();
            
            if (departamentos && departamentos.length > 0) {
                let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">';
                
                departamentos. forEach(dept => {
                    html += `
                        <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #667eea; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                            <div style="font-weight: bold; color: #333;">🏢 ${dept}</div>
                        </div>
                    `;
                });
                
                html += '</div>';
                html += `<p style="margin-top: 15px; color: #666; font-size: 0.9em; text-align: center;">Total: ${departamentos.length} departamento(s)</p>`;
                
                container.innerHTML = html;
            } else {
                container.innerHTML = '<p style="color: #666; text-align: center;">No hay departamentos registrados aún</p>';
            }
        } else {
            container.innerHTML = '<p style="color: #e74c3c; text-align: center;">❌ Error al cargar departamentos</p>';
        }
    } catch (error) {
        console.error('Error al cargar departamentos:', error);
        container. innerHTML = '<p style="color: #e74c3c; text-align: center;">❌ Error de conexión</p>';
    }
}


// ============================================
// FUNCIÓN: MOSTRAR DIÁLOGO DE ÉXITO
// ============================================
function mostrarDialogoExito(titulo, datos) {
    let mensaje = titulo + '\n\n';
    
    // Agregar cada dato en una línea
    for (const [clave, valor] of Object.entries(datos)) {
        if (valor !== null && valor !== undefined && valor !== '') {
            mensaje += `${clave}: ${valor}\n`;
        }
    }
    
    mensaje += '\n✅ Operación completada exitosamente';
    
    alert(mensaje);
}




// ============================================
// FUNCIONES DE CONVERSIÓN DE TIMEZONE
// ============================================

/**
 * Parsea un timestamp del backend (formato "YYYY-MM-DD HH:mm:ss" en UTC+0)
 * y lo convierte a un objeto Date en UTC
 * 
 * @param {string} instanteBackend - Ejemplo: "2025-12-05 19:37:32"
 * @returns {Date|null} - Objeto Date o null si es inválido
 */
function parsearUTCBackend(instanteBackend) {
    if (!instanteBackend || instanteBackend === 'N/A' || instanteBackend === '-') {
        return null;
    }
    
    // El backend envía: "2025-12-05 19:37:32" (UTC+0 sin indicador)
    // Convertir a formato ISO 8601: "2025-12-05T19:37:32Z"
    const isoString = instanteBackend. replace(' ', 'T') + 'Z';
    const fecha = new Date(isoString);
    
    // Verificar si es válida
    if (isNaN(fecha.getTime())) {
        console.warn('Fecha inválida recibida:', instanteBackend);
        return null;
    }
    
    return fecha;
}

/**
 * Convierte un timestamp UTC del backend a la hora local del navegador
 * y lo formatea para mostrar al usuario
 * 
 * @param {string} instanteBackend - Ejemplo: "2025-12-05 19:37:32" (UTC+0)
 * @returns {string} - Fecha formateada en hora local.  Ejemplo: "05/12/2025, 20:37:32"
 */
function formatearFechaLocal(instanteBackend) {
    const fecha = parsearUTCBackend(instanteBackend);
    
    if (!fecha) {
        return instanteBackend; // Si falla, mostrar el original
    }
    
    // Convertir a hora local del navegador
    return fecha.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

/**
 * Obtiene la zona horaria del navegador (para debugging/logs)
 * 
 * @returns {string} - Ejemplo: "Europe/Madrid", "America/New_York"
 */
function obtenerTimezoneLocal() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Obtiene el offset UTC del navegador (para debugging)
 * 
 * @returns {string} - Ejemplo: "UTC+1", "UTC-5"
 */
function obtenerOffsetLocal() {
    const offset = -(new Date(). getTimezoneOffset() / 60);
    return `UTC${offset >= 0 ?  '+' : ''}${offset}`;
}






/**
 * Convierte una fecha/hora local (del input datetime-local) a UTC 0
 * para enviar al backend
 * 
 * @param {string} instanteLocal - Ejemplo: "2025-12-09T16:00" (del input)
 * @returns {string} - Formato backend: "2025-12-09 15:00:00" (UTC+0)
 */
function convertirLocalAUTC(instanteLocal) {
    if (!instanteLocal) return null;
    
    // El input datetime-local devuelve: "2025-12-09T16:00"
    // JavaScript lo interpreta como hora LOCAL del navegador
    const fechaLocal = new Date(instanteLocal);
    
    // Verificar si es válida
    if (isNaN(fechaLocal.getTime())) {
        console.error('Fecha inválida:', instanteLocal);
        return null;
    }
    
    // Convertir a UTC usando toISOString() y formatear
    const isoUTC = fechaLocal.toISOString(); // "2025-12-09T15:00:00.123Z"
    
    // Formato para el backend: "YYYY-MM-DD HH:mm:ss"
    const instanteUTC = isoUTC.replace('T', ' ').substring(0, 19);
    
    console.log('🕐 Hora local ingresada:', fechaLocal.toLocaleString('es-ES'));
    console.log('🌍 Hora UTC (para backend):', instanteUTC);
    
    return instanteUTC;
}




// ============================================
// FUNCIÓN:  CAMBIAR CONTRASEÑA DE USUARIO (SOLO ADMIN)
// ============================================
async function cambiarPassword(event) {
    if (event) event.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        alert('⚠️ No estás autenticado. Redirigiendo al login...');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    const username = document.getElementById('usernamePassword').value.trim();
    const nuevaPassword = document.getElementById('nuevaPassword').value;

    // Validaciones
    if (!username || !nuevaPassword) {
        alert('⚠️ Por favor completa todos los campos');
        return;
    }

    if (username.length < 3) {
        alert('⚠️ El nombre de usuario debe tener al menos 3 caracteres');
        return;
    }

    if (nuevaPassword.length < 8) {
        alert('⚠️ La contraseña debe tener al menos 8 caracteres');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/general/cambiarPassword`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body:  JSON.stringify({
                username: username,
                nuevaPassword:  nuevaPassword
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Mostrar diálogo con los datos del cambio exitoso
            mostrarDialogoExito('🔑 CONTRASEÑA CAMBIADA EXITOSAMENTE', {
                'Usuario': username,
                'Estado': 'Contraseña actualizada',
                'Información': 'El usuario debe usar la nueva contraseña en su próximo login'
            });
            
            // Limpiar formulario
            document.getElementById('cambiarPasswordForm').reset();
            
            mostrarRespuesta('cambiarPasswordResponse', data.msg || '✅ Contraseña cambiada correctamente', 'success');
        } else {
            alert('❌ ERROR AL CAMBIAR CONTRASEÑA\n\n' + (data.msg || 'Error desconocido'));
            mostrarRespuesta('cambiarPasswordResponse', data.msg || 'Error al cambiar la contraseña', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        alert('❌ ERROR DE CONEXIÓN\n\n' + error.message);
        mostrarRespuesta('cambiarPasswordResponse', '❌ Error de conexión:  ' + error.message, 'error');
    }
}



// ============================================
// FUNCIÓN:  VERIFICAR INTEGRIDAD DE EDICIONES (CON PAGINACIÓN)
// ============================================
let paginaActualIntegridadEdiciones = 0;
let elementosPorPaginaIntegridadEdiciones = 5;

async function verificarIntegridadEdiciones(event, pagina = 0) {
    if (event) event.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('verificarEdicionesResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    const departamento = document.getElementById('departamentoEdiciones').value;

    if (!departamento) {
        mostrarRespuesta('verificarEdicionesResponse', '⚠️ Por favor ingresa un departamento', 'error');
        return;
    }

    paginaActualIntegridadEdiciones = pagina;

    mostrarRespuesta('verificarEdicionesResponse', '🔄 Verificando integridad de ediciones, por favor espera...', 'success');

    // Limpiar tabla antes de cargar
    const container = document.getElementById('detallesVerificacionEdiciones');
    if (container) {
        container. innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">🔄 Verificando integridad... </p>';
    }

    try {
        const url = `${API_BASE_URL}/verificarIntegridadEdiciones?departamento=${encodeURIComponent(departamento)}&pagina=${pagina}&elementosPorPagina=${elementosPorPaginaIntegridadEdiciones}`;
        
        console.log('📡 Verificando integridad de ediciones:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        console.log('📦 Respuesta de verificación de ediciones:', data);
        
        if (response.ok) {
            const responseElement = document.getElementById('verificarEdicionesResponse');
            if (responseElement) {
                responseElement.style.display = 'none';
            }
            
            if (data.length === 0 && pagina === 0) {
                mostrarRespuesta('verificarEdicionesResponse', 'ℹ️ No hay ediciones en este departamento', 'success');
                if (container) {
                    container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay ediciones para verificar</p>';
                }
                const controles = document.getElementById('paginacionControlesIntegridadEdiciones');
                if (controles) {
                    controles.style.display = 'none';
                }
            } else if (data.length === 0 && pagina > 0) {
                // Si estamos en una página mayor que 0 y no hay resultados, volver a la página anterior
                verificarIntegridadEdiciones(null, pagina - 1);
            } else {
                mostrarTablaIntegridadEdiciones(data, departamento);
                actualizarControlesPaginacionIntegridadEdiciones(data.length, departamento);
            }
        } else {
            mostrarRespuesta('verificarEdicionesResponse', data.mensaje || data.msg || 'Error al verificar integridad de ediciones', 'error');
            if (container) {
                container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 20px;">❌ Error al verificar integridad</p>';
            }
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        console.error('Error al verificar integridad de ediciones:', error);
        mostrarRespuesta('verificarEdicionesResponse', '❌ Error de conexión:  ' + error.message, 'error');
        if (container) {
            container.innerHTML = '<p style="text-align: center; color: #e74c3c; padding: 20px;">❌ Error de conexión</p>';
        }
    }
}

// ============================================
// FUNCIÓN:  MOSTRAR TABLA DE INTEGRIDAD DE EDICIONES
// ============================================
function mostrarTablaIntegridadEdiciones(ediciones, departamento) {
    const container = document.getElementById('detallesVerificacionEdiciones');
    
    if (! container) return;
    
    if (! ediciones || ediciones.length === 0) {
        container. innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                <p>No hay ediciones en el departamento <strong>${departamento}</strong></p>
            </div>
        `;
        return;
    }
    
    const edicionesOrdenados = [... ediciones].sort((a, b) => {
        return (b.id || 0) - (a.id || 0);
    });
    
    let corruptos = 0;
    let validos = 0;
    
    edicionesOrdenados. forEach(e => {
        const mensaje = (e.mensaje || e.estado || '').toUpperCase();
        if (mensaje.includes('INCONSISTENCIA') || mensaje.includes('INVÁLIDA')) {
            corruptos++;
        } else {
            validos++;
        }
    });
    
    const total = edicionesOrdenados. length;
    const porcentajeValidos = total > 0 ? ((validos / total) * 100).toFixed(1) : 0;
    const porcentajeCorruptos = total > 0 ? ((corruptos / total) * 100).toFixed(1) : 0;
    
    let tableHTML = `
        <div style="margin-top: 20px;">
            <h3 style="color: #5e72e4; margin-bottom: 15px;">📊 Detalle de Ediciones (ordenados por ID):</h3>
            <div style="overflow-x: auto;">
                <table style="width:  100%; border-collapse: collapse; margin-top: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <thead>
                        <tr style="background:  #5e72e4; color: white;">
                            <th style="padding: 12px; text-align: left; border:  1px solid #ddd;">ID</th>
                            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Usuario</th>
                            <th style="padding: 12px; text-align: left; border:  1px solid #ddd;">Fecha Original</th>
                            <th style="padding: 12px; text-align: left; border:  1px solid #ddd;">Fecha Editada</th>
                            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Tipo</th>
                            <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    edicionesOrdenados.forEach((edicion, index) => {
        const esValido = !(edicion.mensaje || '').toUpperCase().includes('INCONSISTENCIA');
        const bgColor = index % 2 === 0 ? '#f8f9fa' : 'white';
        const estadoColor = esValido ? '#28a745' : '#dc3545';
        const estadoIcono = esValido ? '✅' : '⚠️';
        const estadoTexto = esValido ? 'Huella válida' : 'INCONSISTENCIA DETECTADA';
        
        // Formatear fechas
        const fechaOriginal = formatearFechaLocal(edicion.fechaHora_original) || 'N/A';
        const fechaEditada = formatearFechaLocal(edicion.fechaHora_editado) || 'N/A';
        
        tableHTML += `
            <tr style="background: ${bgColor};">
                <td style="padding:  10px; border: 1px solid #ddd;"><strong>${edicion.id}</strong></td>
                <td style="padding: 10px; border: 1px solid #ddd;">${edicion.usuario || 'N/A'}</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #6c757d;">${fechaOriginal}</td>
                <td style="padding: 10px; border: 1px solid #ddd; color: #007bff; font-weight: 500;">${fechaEditada}</td>
                <td style="padding: 10px; border: 1px solid #ddd;"><span style="background: #e3f2fd; padding: 4px 8px; border-radius: 4px; font-weight: 500;">${edicion. tipo || 'N/A'}</span></td>
                <td style="padding: 10px; border: 1px solid #ddd; color: ${estadoColor}; font-weight: bold;">
                    ${estadoIcono} ${estadoTexto}
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
                    </tbody>
                </table>
            </div>
        </div>
        
        <div style="margin-top: 30px; padding:  20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white;">
            <h3 style="margin-bottom: 15px;">📋 Resumen de Verificación:</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background:  rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.9em; opacity: 0.9;">Ediciones válidas</div>
                    <div style="font-size: 2em; font-weight: bold; margin-top: 5px;">✅ ${validos} (${porcentajeValidos}%)</div>
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.9em; opacity: 0.9;">Ediciones con inconsistencias</div>
                    <div style="font-size: 2em; font-weight: bold; margin-top: 5px;">⚠️ ${corruptos} (${porcentajeCorruptos}%)</div>
                </div>
                <div style="background:  rgba(255,255,255,0.2); padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 0.9em; opacity: 0.9;">Total de ediciones</div>
                    <div style="font-size:  2em; font-weight:  bold; margin-top: 5px;">📊 ${total}</div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

// ============================================
// FUNCIÓN: ACTUALIZAR CONTROLES DE PAGINACIÓN INTEGRIDAD EDICIONES
// ============================================
function actualizarControlesPaginacionIntegridadEdiciones(edicionesEnPagina, departamento) {
    const controles = document.getElementById('paginacionControlesIntegridadEdiciones');
    
    if (!controles) {
        console.warn('⚠️ No se encontró el elemento paginacionControlesIntegridadEdiciones');
        return;
    }
    
    controles.style.display = 'block';
    
    const hayMasPaginas = edicionesEnPagina === elementosPorPaginaIntegridadEdiciones;
    const esLaPrimeraPagina = paginaActualIntegridadEdiciones === 0;
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; gap: 15px; flex-wrap: wrap;">
            <button 
                class="btn btn-secondary" 
                onclick="verificarIntegridadEdiciones(null, ${paginaActualIntegridadEdiciones - 1})" 
                ${esLaPrimeraPagina ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' :  ''}>
                ← Anterior
            </button>
            
            <span style="color: #666; font-weight: 500;">
                Página ${paginaActualIntegridadEdiciones + 1} 
                <span style="font-size: 0.9em; color: #999;">(${edicionesEnPagina} edición${edicionesEnPagina !== 1 ? 'es' : ''})</span>
            </span>
            
            <button 
                class="btn btn-secondary" 
                onclick="verificarIntegridadEdiciones(null, ${paginaActualIntegridadEdiciones + 1})" 
                ${! hayMasPaginas ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                Siguiente →
            </button>
        </div>
        
        <div style="text-align: center; margin-top: 15px;">
            <label for="elementosPorPaginaIntegridadEdicionesSelect" style="color: #666; margin-right: 10px;">Ediciones por página:</label>
            <select id="elementosPorPaginaIntegridadEdicionesSelect" onchange="cambiarElementosPorPaginaIntegridadEdiciones(this.value, '${departamento}')" style="padding: 5px 10px; border-radius: 5px; border: 1px solid #ddd;">
                <option value="5" ${elementosPorPaginaIntegridadEdiciones === 5 ? 'selected' :  ''}>5</option>    
                <option value="10" ${elementosPorPaginaIntegridadEdiciones === 10 ? 'selected' :  ''}>10</option>
                <option value="20" ${elementosPorPaginaIntegridadEdiciones === 20 ? 'selected' : ''}>20</option>
                <option value="50" ${elementosPorPaginaIntegridadEdiciones === 50 ? 'selected' : ''}>50</option>
                <option value="100" ${elementosPorPaginaIntegridadEdiciones === 100 ? 'selected' : ''}>100</option>
            </select>
        </div>
    `;
    
    controles.innerHTML = html;
}

// ============================================
// FUNCIÓN: CAMBIAR ELEMENTOS POR PÁGINA INTEGRIDAD EDICIONES
// ============================================
function cambiarElementosPorPaginaIntegridadEdiciones(nuevoValor, departamento) {
    elementosPorPaginaIntegridadEdiciones = parseInt(nuevoValor);
    console.log('📊 Elementos por página (integridad ediciones) cambiados a:', elementosPorPaginaIntegridadEdiciones);
    verificarIntegridadEdiciones(null, 0); // Volver a la primera página
}
