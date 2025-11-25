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
    
    const rolNormalizado = datos.rol.toLowerCase().trim();
    const permitido = rolesPermitidos.map(r => r.toLowerCase()).includes(rolNormalizado);
    
    if (!permitido) {
        alert('⚠️ No tienes permisos para acceder a esta página');
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// ============================================
// FUNCIÓN: REGISTRAR USUARIO
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
    const rol = document.getElementById('regRol').value;

    if (!username || !password || !rol) {
        mostrarRespuesta('regResponse', '⚠️ Por favor completa todos los campos obligatorios', 'error');
        return;
    }

    // Si el rol es Administrador o Auditor, el departamento debe estar vacío o ser null
    const departamentoFinal = (rol === 'administrador' || rol === 'auditor') ? '' : departamento;

    if ((rol === 'empleado' || rol === 'supervisor') && !departamentoFinal) {
        mostrarRespuesta('regResponse', '⚠️ Los empleados y supervisores deben tener un departamento', 'error');
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
    
    console.log('🚀 Iniciando proceso de login...');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('👤 Usuario:', username);

    if (!username || !password) {
        mostrarRespuesta('loginResponse', '⚠️ Por favor ingresa usuario y contraseña', 'error');
        return;
    }

    try {
        console.log('📡 Enviando petición a:', `${API_BASE_URL}/general/login`);
        
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
            console.log('✅ JSON parseado:', data);
        } catch (e) {
            console.error('❌ Error al parsear JSON:', e);
            mostrarRespuesta('loginResponse', '❌ Respuesta inválida del servidor', 'error');
            return;
        }
        
        if (response.ok) {
            console.log('✅ Login exitoso');
            console.log('🔑 Token:', data.token);
            
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                console.log('💾 Token guardado');
                
                mostrarRespuesta('loginResponse', '✅ Login exitoso. Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                console.error('❌ No hay token en la respuesta');
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

        if (response.ok) {
            const fichajes = await response.json();
            mostrarRespuesta('listarResponse', `✅ Se encontraron ${fichajes.length} fichajes`, 'success');
            mostrarTablaFichajes(fichajes);
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

    const fichajeId = document.getElementById('fichajeId').value;
    const nuevaFecha = document.getElementById('edicionNuevaFecha').value;
    const nuevaHora = document.getElementById('edicionNuevaHora').value;
    const motivo = document.getElementById('edicionMotivo').value;

    if (!fichajeId || !nuevaFecha || !nuevaHora || !motivo) {
        mostrarRespuesta('edicionResponse', '⚠️ Por favor completa todos los campos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/solicitarEdicion`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fichajeId: parseInt(fichajeId),
                nuevaFecha,
                nuevaHora,
                motivo
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            mostrarRespuesta('edicionResponse', data.msg || '✅ Solicitud de edición registrada correctamente', 'success');
            document.getElementById('edicionForm').reset();
        } else {
            mostrarRespuesta('edicionResponse', data.msg || 'Error al solicitar edición', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        mostrarRespuesta('edicionResponse', '❌ Error de conexión: ' + error.message, 'error');
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
// FUNCIÓN: LISTAR SOLICITUDES PENDIENTES
// ============================================
async function listarSolicitudesPendientes() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('solicitudesResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/listarSolicitudesPendientes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const solicitudes = await response.json();
            mostrarTablaSolicitudes(solicitudes);
        } else {
            const data = await response.json();
            mostrarRespuesta('solicitudesResponse', data.mensaje || 'Error al listar solicitudes', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
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
// FUNCIÓN: VERIFICAR INTEGRIDAD
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

    mostrarRespuesta('verificarResponse', '🔄 Verificando integridad, por favor espera...', 'success');

    try {
        const response = await fetch(`${API_BASE_URL}/verificarIntegridadFichajes?departamento=${encodeURIComponent(departamento)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            if (data.integra) {
                mostrarRespuesta('verificarResponse', '✅ La integridad de los fichajes es correcta', 'success');
                mostrarDetallesIntegridad(true, departamento);
            } else {
                mostrarRespuesta('verificarResponse', '⚠️ La integridad de los fichajes está comprometida', 'error');
                mostrarDetallesIntegridad(false, departamento);
            }
        } else {
            mostrarRespuesta('verificarResponse', data.mensaje || 'Error al verificar integridad', 'error');
            if (response.status === 401) {
                cerrarSesion();
            }
        }
    } catch (error) {
        mostrarRespuesta('verificarResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
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
// FUNCIONES AUXILIARES
// ============================================

function mostrarRespuesta(elementId, mensaje, tipo) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = mensaje;
        element.className = `response ${tipo}`;
    }
}

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
                </tr>
            </thead>
            <tbody>
    `;

    fichajes.forEach(fichaje => {
        const instante = fichaje.instante || fichaje.fechaHora || 'N/A';
        const tipo = fichaje.tipo || 'N/A';
        
        tableHTML += `
            <tr>
                <td>${instante}</td>
                <td><strong>${tipo}</strong></td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}

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
                    <th>Usuario</th>
                    <th>Fichaje Original</th>
                    <th>Nueva Fecha/Hora</th>
                    <th>Motivo</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    solicitudes.forEach(sol => {
        const id = sol.id || sol.solicitudId || '-';
        const username = sol.username || sol.usuario || 'N/A';
        const fichajeOriginal = sol.fichajeOriginal || sol.fichajeId || 'N/A';
        const nuevaFecha = sol.nuevaFecha || 'N/A';
        const nuevaHora = sol.nuevaHora || 'N/A';
        const motivo = sol.motivo || 'Sin motivo';
        
        tableHTML += `
            <tr>
                <td>${id}</td>
                <td>${username}</td>
                <td>${fichajeOriginal}</td>
                <td>${nuevaFecha} ${nuevaHora}</td>
                <td>${motivo}</td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="aprobarSolicitud(${id})">
                        ✓ Aprobar
                    </button>
                </td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}