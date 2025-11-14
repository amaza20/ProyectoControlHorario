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
// FUNCIÓN: REGISTRAR USUARIO
// ============================================
async function registrarUsuario(event) {
    if (event) event.preventDefault();
    
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const departamento = document.getElementById('regDepartamento').value;
    const rol = document.getElementById('regRol').value;

    if (!username || !password || !departamento) {
        mostrarRespuesta('regResponse', '⚠️ Por favor completa todos los campos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/general/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                departamento,
                rol
            })
        });

        const data = await response.text();
        
        if (response.ok) {
            mostrarRespuesta('regResponse', data + ' Redirigiendo al login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            mostrarRespuesta('regResponse', data, 'error');
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
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        mostrarRespuesta('loginResponse', '⚠️ Por favor ingresa usuario y contraseña', 'error');
        return;
    }

    try {
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

        const data = await response.text();
        
        if (response.ok) {
            localStorage.setItem('authToken', data);
            mostrarRespuesta('loginResponse', '✅ Login exitoso. Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            mostrarRespuesta('loginResponse', data, 'error');
        }
    } catch (error) {
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

        const data = await response.text();
        
        if (response.ok) {
            mostrarRespuesta('ficharResponse', data, 'success');
        } else {
            mostrarRespuesta('ficharResponse', data, 'error');
            if (data.includes('Token inválido o expirado')) {
                cerrarSesion();
            }
        }
    } catch (error) {
        mostrarRespuesta('ficharResponse', '❌ Error de conexión: ' + error.message, 'error');
    }
}

// ============================================
// FUNCIÓN: LISTAR FICHAJES
// ============================================
async function listarFichajes() {
    const authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        mostrarRespuesta('listarResponse', '⚠️ No estás autenticado', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/listarFichajes`, {
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
            const data = await response.text();
            mostrarRespuesta('listarResponse', data, 'error');
            if (data.includes('Token inválido o expirado')) {
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

    const fecha = document.getElementById('edicionFecha').value;
    const hora = document.getElementById('edicionHora').value;
    const nuevaFecha = document.getElementById('edicionNuevaFecha').value;
    const nuevaHora = document.getElementById('edicionNuevaHora').value;
    const tipo = document.getElementById('edicionTipo').value;
    const usoHorario = document.getElementById('edicionUsoHorario').value;

    if (!fecha || !hora || !nuevaFecha || !nuevaHora || !tipo || !usoHorario) {
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
                fecha,
                hora,
                nuevaFecha,
                nuevaHora,
                tipo,
                usoHorario
            })
        });

        const data = await response.text();
        
        if (response.ok) {
            mostrarRespuesta('edicionResponse', data, 'success');
            document.getElementById('edicionForm').reset();
        } else {
            mostrarRespuesta('edicionResponse', data, 'error');
            if (data.includes('Token inválido o expirado')) {
                cerrarSesion();
            }
        }
    } catch (error) {
        mostrarRespuesta('edicionResponse', '❌ Error de conexión: ' + error.message, 'error');
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
    
    if (fichajes.length === 0) {
        tableContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay fichajes registrados</p>';
        return;
    }

    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Fecha y Hora</th>
                    <th>Tipo</th>
                    <th>Huella (Hash)</th>
                </tr>
            </thead>
            <tbody>
    `;

    fichajes.forEach(fichaje => {
        tableHTML += `
            <tr>
                <td>${fichaje.instante}</td>
                <td><strong>${fichaje.tipo}</strong></td>
                <td style="font-size: 0.8em; word-break: break-all;">${fichaje.huella.substring(0, 20)}...</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    tableContainer.innerHTML = tableHTML;
}