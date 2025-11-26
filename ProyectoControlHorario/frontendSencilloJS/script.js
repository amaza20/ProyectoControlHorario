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
            rol: payload.rol, // ← Sin normalizar, tal cual viene
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
    
    const rolUsuario = datos.rol; // "Administrador", "Empleado", etc.
    
    // Comparar directamente (sensible a mayúsculas)
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
// FUNCIÓN: REGISTRAR USUARIO (CORREGIDA)
// ============================================
async function registrarUsuario(event) {
    if (event) event.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('regResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const departamento = document.getElementById('regDepartamento').value;
    const rol = document.getElementById('regRol').value; // ← Convertir a minúsculas

    if (!username || !password || !rol) {
        mostrarRespuesta('regResponse', '⚠️ Por favor completa todos los campos obligatorios', 'error');
        return;
    }

    const departamentoFinal = (rol === 'administrador' || rol === 'auditor') ? '' : departamento;

    if ((rol === 'empleado' || rol === 'supervisor') && !departamentoFinal) {
        mostrarRespuesta('regResponse', '⚠️ Los empleados y supervisores deben tener un departamento', 'error');
        return;
    }

    console.log('📤 Enviando registro:', {
        username,
        password: '***',
        departamento: departamentoFinal,
        rol
    });

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
            mostrarRespuesta('regResponse', data.msg || '✅ Usuario registrado correctamente', 'success');
            document.getElementById('registroForm').reset();
        } else {
            mostrarRespuesta('regResponse', data.msg || 'Error al registrar usuario', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        mostrarRespuesta('regResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN: LOGIN USUARIO
// ============================================
async function loginUsuario(event) {
    if (event) event.preventDefault();
    
    console.log('🚀 Iniciando login...');
    
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
                
                mostrarRespuesta('loginResponse', '✅ Login exitoso. Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
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
// FUNCIÓN: FICHAR
// ============================================
async function fichar() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('ficharResponse', '⚠️ No estás autenticado', 'error');
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
            mostrarRespuesta('ficharResponse', data.mensaje || '✅ Fichaje registrado correctamente', 'success');
        } else {
            mostrarRespuesta('ficharResponse', data.mensaje || 'Error al fichar', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        mostrarRespuesta('ficharResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// REEMPLAZAR esta función en script.js

// ============================================
// FUNCIÓN: LISTAR FICHAJES DEL USUARIO
// ============================================
async function listarFichajes() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('listarResponse', '⚠️ No estás autenticado', 'error');
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

        if (response. ok) {
            const fichajes = await response.json();
            mostrarRespuesta('listarResponse', `✅ Se encontraron ${fichajes.length} fichajes`, 'success');
            // Usar la función con botón editar
            mostrarTablaFichajesConEditar(fichajes);
        } else {
            const data = await response.json();
            mostrarRespuesta('listarResponse', data.mensaje || 'Error al listar fichajes', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        mostrarRespuesta('listarResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN: APROBAR SOLICITUD (SUPERVISOR)
// ============================================
async function aprobarSolicitud(solicitudId) {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        alert('⚠️ No estás autenticado');
        window.location.href = 'login.html';
        return;
    }

    if (!confirm('¿Estás seguro de que deseas aprobar esta solicitud?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/aprobarSolicitud?solicitudId=${solicitudId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
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
        alert('❌ Error de conexión: ' + error.message);
    }
}


// ============================================
// FUNCIÓN: SOLICITAR EDICIÓN (ACTUALIZADA - USA ID CORRECTO)
// ============================================
async function solicitarEdicion(event) {
    if (event) event.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('edicionResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    // Obtener el ID del fichaje desde el campo oculto
    const fichajeId = document.getElementById('fichajeIdHidden')?.value;
    const nuevoInstanteInput = document.getElementById('nuevoInstante'). value;
    const usoHorario = document.getElementById('usoHorario').value;

    if (!fichajeId) {
        mostrarRespuesta('edicionResponse', '⚠️ No se ha seleccionado un fichaje válido', 'error');
        return;
    }

    if (!nuevoInstanteInput || !usoHorario) {
        mostrarRespuesta('edicionResponse', '⚠️ Por favor completa todos los campos', 'error');
        return;
    }

    // Convertir el formato datetime-local (YYYY-MM-DDTHH:mm) a formato backend (YYYY-MM-DD HH:mm:ss)
    const nuevoInstante = nuevoInstanteInput.replace('T', ' ') + ':00';

    console.log('📤 Enviando solicitud de edición:', {
        id_fichaje: parseInt(fichajeId),
        nuevoInstante: nuevoInstante,
        usoHorario: usoHorario
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
                usoHorario: usoHorario
            })
        });

        const data = await response.json();
        
        console.log('📥 Respuesta del servidor:', data);
        
        if (response.ok) {
            mostrarRespuesta('edicionResponse', data.msg || '✅ Solicitud de edición registrada correctamente.  Redirigiendo a tus fichajes... ', 'success');
            
            // Redirigir a fichajes después de 2 segundos
            setTimeout(() => {
                window. location.href = 'fichajes.html';
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
// FUNCIÓN: LISTAR SOLICITUDES PENDIENTES (SIN LÍNEA VERDE)
// ============================================
async function listarSolicitudesPendientes() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('solicitudesResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/listarSolicitudes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const solicitudes = await response.json();
            
            if (solicitudes && solicitudes.length > 0) {
                // Ocultar el mensaje de respuesta
                const responseElement = document.getElementById('solicitudesResponse');
                if (responseElement) {
                    responseElement.style.display = 'none';
                }
                mostrarTablaSolicitudes(solicitudes);
            } else {
                mostrarRespuesta('solicitudesResponse', 'ℹ️ No hay solicitudes en tu departamento', 'success');
                const tableContainer = document.getElementById('solicitudesTable');
                if (tableContainer) {
                    tableContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay solicitudes en tu departamento</p>';
                }
            }
        } else {
            const data = await response.json();
            mostrarRespuesta('solicitudesResponse', data.mensaje || data.msg || 'Error al listar solicitudes', 'error');
            if (response.status === 401) {
                cerrarSesion();
            } else if (response.status === 403) {
                mostrarRespuesta('solicitudesResponse', '⚠️ No tienes permisos para ver las solicitudes (solo supervisores)', 'error');
            }
        }
    } catch (error) {
        console.error('Error al listar solicitudes:', error);
        mostrarRespuesta('solicitudesResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN: CERRAR SESIÓN
// ============================================
function cerrarSesion() {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
}

// ============================================
// FUNCIÓN: VERIFICAR INTEGRIDAD (MEJORADA)
// ============================================
async function verificarIntegridad(event) {
    if (event) event.preventDefault();
    
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('verificarResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    const departamento = document.getElementById('departamento').value;

    if (!departamento) {
        mostrarRespuesta('verificarResponse', '⚠️ Por favor ingresa un departamento', 'error');
        return;
    }

    mostrarRespuesta('verificarResponse', '🔄 Verificando integridad, por favor espera... ', 'success');

    try {
        const response = await fetch(`${API_BASE_URL}/verificarIntegridadFichajes?departamento=${encodeURIComponent(departamento)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        console.log('📦 Respuesta de verificación:', data);
        
        if (response.ok) {
            // Ocultar el mensaje de respuesta para mostrar solo la tabla
            const responseElement = document.getElementById('verificarResponse');
            if (responseElement) {
                responseElement. style.display = 'none';
            }
            
            // Mostrar la tabla con los detalles de cada fichaje
            mostrarTablaIntegridad(data.fichajes || data, departamento);
        } else {
            mostrarRespuesta('verificarResponse', data.mensaje || data.msg || 'Error al verificar integridad', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        console.error('Error al verificar integridad:', error);
        mostrarRespuesta('verificarResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN: MOSTRAR TABLA DE INTEGRIDAD (ORDENADA POR ID)
// ============================================
function mostrarTablaIntegridad(fichajes, departamento) {
    const container = document.getElementById('detallesVerificacion');
    
    if (! container) return;
    
    if (! fichajes || fichajes.length === 0) {
        container. innerHTML = `
            <div style="padding: 20px; text-align: center; color: #666;">
                <p>No hay fichajes en el departamento <strong>${departamento}</strong></p>
            </div>
        `;
        return;
    }
    
    // Ordenar fichajes por ID descendente (más alto primero)
    const fichajesOrdenados = [... fichajes].sort((a, b) => {
        return (b.id || 0) - (a.id || 0);
    });
    
    // Contar fichajes corruptos y válidos
    let corruptos = 0;
    let validos = 0;
    
    fichajesOrdenados.forEach(f => {
        const mensaje = (f.mensaje || f.estado || '').toUpperCase();
        
        if (mensaje.includes('INCONSISTENCIA') || 
            mensaje.includes('CORRUPTO') || 
            mensaje. includes('COMPROMETID') ||
            mensaje.includes('INVÁLIDO') ||
            mensaje. includes('ERROR') ||
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
        const instante = fichaje.instante || fichaje.fecha || 'N/A';
        const tipo = fichaje.tipo || 'N/A';
        const mensaje = fichaje.mensaje || fichaje.estado || 'Estado desconocido';
        
        // Determinar si está corrupto
        const mensajeUpper = mensaje.toUpperCase();
        const esCorrupto = mensajeUpper.includes('INCONSISTENCIA') || 
                          mensajeUpper.includes('CORRUPTO') || 
                          mensajeUpper.includes('COMPROMETID') ||
                          mensajeUpper. includes('INVÁLIDO') ||
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
    
    // Agregar resumen al final
    const porcentajeValidos = totalFichajes > 0 ? ((validos / totalFichajes) * 100).toFixed(1) : 0;
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
// FUNCIÓN: MOSTRAR DETALLES DE VERIFICACIÓN
// ============================================
function mostrarDetallesIntegridad(integra, departamento) {
    const container = document.getElementById('detallesVerificacion');
    
    if (!container) return;
    
    if (integra) {
        container.innerHTML = `
            <div class="card-exito">
                <div class="icon-grande">✅</div>
                <h2>¡Integridad Verificada!</h2>
                <p>Todos los fichajes del departamento <strong>${departamento}</strong> son válidos.</p>
                <ul style="text-align: left; margin-top: 20px;">
                    <li>✓ Ningún registro ha sido modificado</li>
                    <li>✓ La cadena de hashes es consistente</li>
                    <li>✓ Todos los fichajes son auténticos</li>
                </ul>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="card-error">
                <div class="icon-grande">⚠️</div>
                <h2>¡Integridad Comprometida!</h2>
                <p>Se detectaron inconsistencias en el departamento <strong>${departamento}</strong>.</p>
                <ul style="text-align: left; margin-top: 20px;">
                    <li>⚠️ Uno o más registros fueron modificados</li>
                    <li>⚠️ La cadena de hashes está rota</li>
                    <li>⚠️ Contacta al administrador del sistema</li>
                </ul>
            </div>
        `;
    }
    
    container.style.display = 'block';
}

// ============================================
// FUNCIÓN: MOSTRAR TABLA DE FICHAJES (CORREGIDA)
// ============================================
function mostrarTablaFichajes(fichajes) {
    const tableContainer = document.getElementById('fichajesTable');
    
    if (!tableContainer) return;
    
    if (!fichajes || fichajes.length === 0) {
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
                </tr>
            </thead>
            <tbody>
    `;

    fichajes.forEach(fichaje => {
        const instanteAnterior = fichaje.instanteAnterior || 'N/A';
        const tipoAnterior = fichaje.tipoAnterior || 'N/A';
        const nuevoInstante = fichaje.nuevoInstante;
        const nuevoTipo = fichaje.nuevoTipo;
        
        // Verificar si el fichaje fue editado
        const fueEditado = nuevoInstante && nuevoInstante !== null && nuevoInstante !== '';
        
        let celdaFechaHora = '';
        let celdaTipo = '';
        let celdaEstado = '';
        
        if (fueEditado) {
            // Fichaje editado: mostrar valor original tachado y nuevo valor
            celdaFechaHora = `
                <div>
                    <div style="color: #dc3545; text-decoration: line-through; font-size: 0.85em;">
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
            
            celdaEstado = '<span style="background: #fff3cd; padding: 4px 8px; border-radius: 4px; color: #856404; font-size: 0.85em; font-weight: bold;">✏️ Editado</span>';
        } else {
            // Fichaje normal: sin ediciones (solo mostrar valores originales)
            celdaFechaHora = instanteAnterior;
            celdaTipo = `<strong>${tipoAnterior}</strong>`;
            celdaEstado = '<span style="color: #6c757d; font-size: 0.85em;">📋 Original</span>';
        }
        
        tableHTML += `
            <tr style="${fueEditado ? 'background-color: #fffbf0; border-left: 3px solid #ffc107;' : ''}">
                <td>${celdaFechaHora}</td>
                <td>${celdaTipo}</td>
                <td>${celdaEstado}</td>
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
// FUNCIÓN: MOSTRAR TABLA DE SOLICITUDES (CORREGIDA PARA TU BACKEND)
// ============================================
function mostrarTablaSolicitudes(solicitudes) {
    const tableContainer = document.getElementById('solicitudesTable');
    
    if (!tableContainer) return;
    
    if (!solicitudes || solicitudes.length === 0) {
        tableContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay solicitudes pendientes</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID Solicitud</th>
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
        const nuevoInstante = sol.nuevo_instante || 'N/A';
        const tipo = sol.tipo || 'N/A';
        const aprobado = sol.aprobado;
        
        // Verificar si está aprobado
        // Tu backend devuelve "VERDADERO" o "FALSO"
        let estaAprobado = false;
        
        if (typeof aprobado === 'boolean') {
            estaAprobado = aprobado === true;
        } else if (typeof aprobado === 'string') {
            const aprobadoUpper = aprobado.toUpperCase().trim();
            estaAprobado = aprobadoUpper === 'VERDADERO' || 
                          aprobadoUpper === 'TRUE' || 
                          aprobadoUpper === 'SI' || 
                          aprobadoUpper === 'YES' ||
                          aprobadoUpper === '1';
        } else if (typeof aprobado === 'number') {
            estaAprobado = aprobado === 1;
        }
        
        // Determinar qué mostrar en la columna de acción
        const botonAprobar = !estaAprobado
            ? `<button class="btn btn-success btn-sm" onclick="aprobarSolicitud(${id})">✓ Aprobar</button>`
            : `<span style="color: #28a745; font-weight: bold;">✅ Aprobada</span>`;
        
        const estadoTexto = !estaAprobado 
            ? '<span style="color: #ffc107;">⏳ Pendiente</span>' 
            : '<span style="color: #28a745;">✅ Aprobada</span>';
        
        // Estilo diferente para solicitudes aprobadas
        const estiloFila = estaAprobado ? 'style="opacity: 0.6; background-color: #f0f0f0;"' : '';
        
        tableHTML += `
            <tr ${estiloFila}>
                <td>${id}</td>
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
    
    if (! fichajes || fichajes.length === 0) {
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
        const instanteAnterior = fichaje.instanteAnterior || 'N/A';
        const tipoAnterior = fichaje.tipoAnterior || 'N/A';
        const nuevoInstante = fichaje.nuevoInstante;
        const nuevoTipo = fichaje.nuevoTipo;
        const idFichaje = fichaje.id_fichaje || fichaje.id;
        const aprobadoEdicion = fichaje.aprobadoEdicion;
        
        // Determinar el estado basado en aprobadoEdicion
        let estadoAprobacion = null; // null, 'pendiente', 'aprobado'
        
        if (aprobadoEdicion === null || aprobadoEdicion === undefined) {
            estadoAprobacion = null; // Nunca se solicitó edición
        } else if (typeof aprobadoEdicion === 'boolean') {
            estadoAprobacion = aprobadoEdicion ? 'aprobado' : 'pendiente';
        } else if (typeof aprobadoEdicion === 'string') {
            const aprobadoUpper = aprobadoEdicion. toUpperCase(). trim();
            if (aprobadoUpper === 'VERDADERO' || aprobadoUpper === 'TRUE') {
                estadoAprobacion = 'aprobado';
            } else if (aprobadoUpper === 'FALSO' || aprobadoUpper === 'FALSE') {
                estadoAprobacion = 'pendiente';
            }
        }
        
        // Verificar si el fichaje fue editado Y aprobado
        const fueEditado = nuevoInstante && nuevoInstante !== null && nuevoInstante !== '' && estadoAprobacion === 'aprobado';
        
        let celdaFechaHora = '';
        let celdaTipo = '';
        let celdaEstado = '';
        let botonEditar = '';
        
        if (estadoAprobacion === 'aprobado') {
            // ✅ EDICIÓN APROBADA: Mostrar valor original tachado y nuevo valor
            celdaFechaHora = `
                <div>
                    <div style="color: #dc3545; text-decoration: line-through; font-size: 0.85em;">
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
            
            // Permitir nueva solicitud de edición
            const instanteEscapado = nuevoInstante.replace(/'/g, "\\'");
            const tipoEscapado = nuevoTipo.replace(/'/g, "\\'");
            botonEditar = `<button class="btn btn-secondary btn-sm" onclick="abrirFormularioEdicion('${idFichaje}', '${instanteEscapado}', '${tipoEscapado}')" style="font-size: 0.85em; white-space: nowrap;">✏️ Editar</button>`;
            
        } else if (estadoAprobacion === 'pendiente') {
            // ⏳ PENDIENTE DE APROBACIÓN: No mostrar cambios aún
            celdaFechaHora = `
                <div>
                    <div>${instanteAnterior}</div>
                    <small style="color: #856404; font-style: italic; display: block; margin-top: 5px;">
                        → ${nuevoInstante}
                    </small>
                </div>
            `;
            
            celdaTipo = `
                <div>
                    <div><strong>${tipoAnterior}</strong></div>
                    <small style="color: #856404; font-style: italic; display: block; margin-top: 5px;">
                        → ${nuevoTipo}
                    </small>
                </div>
            `;
            
            celdaEstado = '<span style="background: #fff3cd; padding: 6px 10px; border-radius: 4px; color: #856404; font-size: 0.85em; font-weight: bold; display: inline-block;">⏳ Pendiente</span>';
            
            // Deshabilitar botón mientras está pendiente
            botonEditar = `<button class="btn btn-secondary btn-sm" disabled style="font-size: 0. 85em; opacity: 0.5; cursor: not-allowed; white-space: nowrap;">⏳ En trámite</button>`;
            
        } else {
            // 📋 ORIGINAL: Sin ediciones
            celdaFechaHora = instanteAnterior;
            celdaTipo = `<strong>${tipoAnterior}</strong>`;
            celdaEstado = '<span style="color: #6c757d; font-size: 0.85em; display: inline-block;">📋 Original</span>';
            
            // Botón normal para solicitar edición
            const instanteEscapado = instanteAnterior.replace(/'/g, "\\'");
            const tipoEscapado = tipoAnterior.replace(/'/g, "\\'");
            botonEditar = `<button class="btn btn-secondary btn-sm" onclick="abrirFormularioEdicion('${idFichaje}', '${instanteEscapado}', '${tipoEscapado}')" style="font-size: 0. 85em; white-space: nowrap;">✏️ Editar</button>`;
        }
        
        // Estilo de fila según el estado
        let estiloFila = '';
        if (estadoAprobacion === 'aprobado') {
            estiloFila = 'background-color: #f0fff4; border-left: 3px solid #28a745;'; // Verde para aprobado
        } else if (estadoAprobacion === 'pendiente') {
            estiloFila = 'background-color: #fffbf0; border-left: 3px solid #ffc107;'; // Amarillo para pendiente
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
    // Guardar los datos del fichaje en localStorage para usarlos en la página de edición
    localStorage.setItem('fichajeParaEditar', JSON.stringify({
        id: idFichaje,
        instante: instante,
        tipo: tipo
    }));
    
    // Redirigir a la página de edición
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
    
    // Ordenar fichajes por instante descendente (más reciente primero)
    const fichajesOrdenados = [... fichajes].sort((a, b) => {
        const fechaA = new Date(a. instanteAnterior || a.instante || 0);
        const fechaB = new Date(b.instanteAnterior || b.instante || 0);
        return fechaB - fechaA;
    });
    
    // Construir las opciones del select
    let optionsHTML = '<option value="">Selecciona un fichaje</option>';
    
    fichajesOrdenados.forEach(fichaje => {
        // Usar el id_fichaje que viene del backend (el ID real de la BD)
        const idFichaje = fichaje. id_fichaje || fichaje. id;
        
        // Mostrar el instante y tipo del fichaje (SIN mostrar el ID)
        const instante = fichaje.instanteAnterior || fichaje.instante || 'N/A';
        const tipo = fichaje.tipoAnterior || fichaje.tipo || 'N/A';
        
        // Verificar si fue editado
        const fueEditado = fichaje.nuevoInstante && fichaje.nuevoInstante !== null && fichaje.nuevoInstante !== '';
        const badge = fueEditado ? ' ✏️ [Editado]' : '';
        
        // Crear la opción con el id_fichaje real como value (el usuario NO lo ve)
        optionsHTML += `<option value="${idFichaje}">${instante} - ${tipo}${badge}</option>`;
    });
    
    select.innerHTML = optionsHTML;
}