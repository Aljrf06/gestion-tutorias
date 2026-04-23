/**
 * ARCHIVO: tutor.js
 * Descripción: Maneja la lógica del panel de tutor, formularios y navegación.
 */

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    };
}
// 1. GESTIÓN DE FORMULARIOS (Mostrar/Ocultar)
function mostrarForm(id) {
    const formularios = ['franjaForm', 'materiaForm'];
    formularios.forEach(formId => {
        const f = document.getElementById(formId);
        if (f) f.style.display = 'none';
    });
    const formularioSeleccionado = document.getElementById(id);
    if (formularioSeleccionado) {
        formularioSeleccionado.style.display = 'block';
        console.log("Mostrando formulario: " + id);
        if (id === 'materiaForm') {
            cargarMateriasConEliminar();
        }
    } else {
        console.error("Error: No se encontró el ID " + id);
    }
}

// 2. LÓGICA DE NAVEGACIÓN (Cerrar Sesión)
function logout() {
    console.log("Cerrando sesión...");
    localStorage.clear();
    window.location.href = "login.html"; 
}

// 3. CREAR MATERIA
async function crearMateria() {
    const nombre = document.getElementById('nombreMateria').value;
    const descripcion = document.getElementById('descripcionMateria').value;

    if (!nombre) {
        alert("El nombre de la materia es obligatorio");
        return;
    }

    const nuevaMateria = { nombre: nombre, descripcion: descripcion };

    try {
        const response = await fetch('http://localhost:8081/materias/registrar', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(nuevaMateria)
        });
        if (response.ok){
            alert("Materia guardada exitosamente!");
            document.getElementById('nombreMateria').value = '';
            document.getElementById('descripcionMateria').value = '';
            cargarMaterias(); 
            cargarMateriasConEliminar();
        } else {
            const error = await response.json();
            alert("Error al guardar la materia: " + (error.mensaje || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error al conectar con la BD", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// 4. LISTAR MATERIAS EN EL SELECT
async function cargarMaterias() {
    const selectMateria = document.getElementById('materia_id');
    try {
        const response = await fetch('http://localhost:8081/materias/listarMaterias', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Error al obtener materias");
        const materias = await response.json();
        selectMateria.innerHTML = '<option value="">Seleccionar Materia</option>';
        materias.forEach(materia => {
            const option = document.createElement('option');
            option.value = materia.id;
            option.textContent = materia.nombre;
            selectMateria.appendChild(option);
        });
    } catch (error) {
        console.error("Error al poblar el select de materias:", error);
    }
}

// 5. CARGAR MATERIAS CON OPCIÓN DE ELIMINAR
async function cargarMateriasConEliminar() {
    let contenedor = document.getElementById('listaMaterias');
    if (!contenedor) {
        contenedor = document.createElement('div');
        contenedor.id = 'listaMaterias';
        contenedor.style.marginTop = '20px';
        document.getElementById('materiaForm').appendChild(contenedor);
    }
    try {
        const response = await fetch('http://localhost:8081/materias/listarMaterias', {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("Error al obtener materias");
        const materias = await response.json();
        contenedor.innerHTML = '<h4>Materias Registradas</h4>';
        if (materias.length === 0) {
            contenedor.innerHTML += '<p style="color: gray;">No hay materias registradas.</p>';
            return;
        }
        materias.forEach(materia => {
            const fila = document.createElement('div');
            fila.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;';
            fila.innerHTML = `
                <span><strong>${materia.nombre}</strong> — ${materia.descripcion || 'Sin descripción'}</span>
                <button class="btn-delete" style="padding: 5px 10px; font-size: 0.8rem;" onclick="eliminarMateria(${materia.id})">Eliminar</button>
            `;
            contenedor.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar materias:", error);
        contenedor.innerHTML += '<p>Error al conectar con el servidor.</p>';
    }
}

// 6. ELIMINAR MATERIA
async function eliminarMateria(materiaId) {
    if (!confirm("¿Seguro que deseas eliminar esta materia?")) return;
    try {
        const response = await fetch(`http://localhost:8081/materias/${materiaId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (response.ok) {
            alert("Materia eliminada correctamente.");
            cargarMaterias();              
            cargarMateriasConEliminar();   
        } else {
            const error = await response.json();
            alert("Error al eliminar: " + (error.mensaje || "No se puede eliminar, puede estar asociada a una franja."));
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor."); 
    }
}

// --- VALIDAR TRASLAPE DE HORARIOS ---
async function validarTraslape(tutorId, nuevaFecha, nuevaInicio, nuevaFin, idOmitir = null) {
    try {
        const response = await fetch(`http://localhost:8081/franjas-horarias/tutor/${tutorId}`, {
            headers: getHeaders()
        });
        if (!response.ok) return false;
        const franjas = await response.json();
        return franjas.some(franja => {
            if (idOmitir && franja.id === idOmitir) return false;
            if (franja.fecha === nuevaFecha) {
                return (nuevaInicio < franja.horaFin && nuevaFin > franja.horaInicio);
            }
            return false;
        });
    } catch (error) {
        console.error("Error al validar traslapes:", error);
        return false; 
    }
}

// 7. CREAR FRANJA HORARIA
async function crearFranja() {
    const tutorId = localStorage.getItem("usuarioId");
    const fecha = document.getElementById('fecha').value;
    const inicio = document.getElementById('hora_inicio').value;
    const fin = document.getElementById('hora_fin').value;
    const desc = document.getElementById('descripcion').value;
    const materiaId = document.getElementById('materia_id').value;

    if (!fecha || !inicio || !fin || !materiaId) {
        alert("Por favor completa todos los campos obligatorios");
        return;
    }

    const hayCruce = await validarTraslape(tutorId, fecha, inicio, fin);
    if (hayCruce) {
        alert("⚠️ Error: El horario seleccionado se cruza con otra franja que ya tienes registrada.");
        return;
    }

    const nuevaFranja = {
        fecha: fecha, horaInicio: inicio, horaFin: fin, descripcion: desc,
        estado: "disponible", 
        tutor: { id: parseInt(tutorId) },
        materia: { id: parseInt(materiaId) }
    };

    try {
        const response = await fetch('http://localhost:8081/franjas-horarias/crearFranja', {
            method: 'POST',
            headers: getHeaders(), 
            body: JSON.stringify(nuevaFranja)
        });
        if (response.ok) {
            alert("¡Franja guardada exitosamente!");
            document.getElementById('franjaForm').reset();
            document.getElementById('franjaForm').style.display = 'none';
            cargarFranjas(tutorId);
            cargarReservasTutor();
        } else {
            const error = await response.json();
            alert("Error al guardar: " + (error.mensaje || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// 8. CARGAR FRANJAS
async function cargarFranjas(tutorId) {
    const contenedor = document.getElementById('listaFranjas');
    try {
        const response = await fetch(`http://localhost:8081/franjas-horarias/tutor/${tutorId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("No se pudieron cargar las franjas");
        const franjas = await response.json();
        contenedor.innerHTML = '';
        if (franjas.length === 0) {
            contenedor.innerHTML = '<p>No tienes franjas programadas aún.</p>';
            return;
        }
        franjas.forEach(franja => {
            const card = document.createElement('article');
            card.className = 'slot-card';
            const esDisponible = (franja.estado === 'disponible');
            card.innerHTML = `
                <div class="card-header">
                    <strong>${franja.materia.nombre}</strong>
                    <span class="status" style="background: ${esDisponible ? '#def7ec' : '#fde8e8'}; color: ${esDisponible ? '#03543f' : '#9b1c1c'};">
                        ${esDisponible ? 'Disponible' : 'Ocupada'}
                    </span>
                </div>
                <div class="card-body">
                    <p>📅 Fecha: ${franja.fecha}</p>
                    <p>🕒 Horario: ${franja.horaInicio} - ${franja.horaFin}</p>
                    <p>📝 ${franja.descripcion || 'Sin descripción'}</p>
                </div>
                <div class="card-actions">
                    ${esDisponible ? `
                        <button class="btn-edit" onclick="abrirEditor(${franja.id})">Editar</button>
                        <button class="btn-delete" onclick="eliminarFranja(${franja.id})">Eliminar</button>
                    ` : `
                        <p style="color: #718096; font-size: 0.85rem; grid-column: span 2; text-align: center; margin: 0; font-weight: bold;">
                            🔒 Reservada (No modificable)
                        </p>
                    `}
                </div>
            `;
            contenedor.appendChild(card);
        });
    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
}

// 9. ELIMINAR FRANJA
async function eliminarFranja(franjaId) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta franja horaria?")) return;
    try {
        const response = await fetch(`http://localhost:8081/franjas-horarias/${franjaId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (response.ok) {
            alert("Franja eliminada correctamente.");
            const tutorId = localStorage.getItem("usuarioId");
            cargarFranjas(tutorId);
            cargarReservasTutor();
        } else {
            const error = await response.json();
            alert("Error al eliminar: " + (error.mensaje || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// 10. ABRIR EDITOR DE FRANJA
async function abrirEditor(franjaId) {
    try {
        const response = await fetch(`http://localhost:8081/franjas-horarias/${franjaId}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error("No se pudo obtener la franja");
        const franja = await response.json();
        if (franja.estado !== 'disponible') {
            alert("Esta franja ya no está disponible para edición.");
            return;
        }
        document.getElementById('fecha').value = franja.fecha;
        document.getElementById('hora_inicio').value = franja.horaInicio;
        document.getElementById('hora_fin').value = franja.horaFin;
        document.getElementById('descripcion').value = franja.descripcion || '';
        document.getElementById('materia_id').value = franja.materia.id;
        mostrarForm('franjaForm');
        const btnGuardar = document.querySelector('#franjaForm .btn-save');
        btnGuardar.textContent = 'Actualizar';
        btnGuardar.onclick = () => actualizarFranja(franjaId);
    } catch (error) {
        console.error("Error al cargar la franja:", error);
        alert("No se pudo cargar la franja para editar.");
    }
}

// 11. ACTUALIZAR FRANJA
async function actualizarFranja(franjaId) {
    const tutorId = localStorage.getItem("usuarioId");
    const fecha = document.getElementById('fecha').value;
    const inicio = document.getElementById('hora_inicio').value;
    const fin = document.getElementById('hora_fin').value;
    const desc = document.getElementById('descripcion').value;
    const materiaId = document.getElementById('materia_id').value;

    if (!fecha || !inicio || !fin || !materiaId) {
        alert("Por favor completa todos los campos obligatorios");
        return;
    }

    const hayCruce = await validarTraslape(tutorId, fecha, inicio, fin, franjaId);
    if (hayCruce) {
        alert("⚠️ Error: El horario modificado se cruza con otra de tus tutorías.");
        return;
    }

    const franjaActualizada = {
        fecha: fecha, horaInicio: inicio, horaFin: fin, descripcion: desc,
        estado: "disponible",
        tutor: { id: parseInt(tutorId) },
        materia: { id: parseInt(materiaId) }
    };

    try {
        const response = await fetch(`http://localhost:8081/franjas-horarias/${franjaId}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(franjaActualizada)
        });
        if (response.ok) {
            alert("¡Franja actualizada correctamente!");
            const btnGuardar = document.querySelector('#franjaForm .btn-save');
            btnGuardar.textContent = 'Guardar';
            btnGuardar.onclick = crearFranja;
            document.getElementById('franjaForm').reset();
            document.getElementById('franjaForm').style.display = 'none';
            cargarFranjas(tutorId);
            cargarReservasTutor();
        } else {
            const error = await response.json();
            alert("Error al actualizar: " + (error.mensaje || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// 12. CARGA INICIAL
window.onload = function() {
    const nombreGuardado = localStorage.getItem("nombre");
    const idGuardado = localStorage.getItem("usuarioId");
    const etiquetaNombre = document.getElementById("nombreBienvenida");
    if (nombreGuardado) {
        etiquetaNombre.textContent = nombreGuardado;
    } else {
        etiquetaNombre.textContent = "Invitado";
    }
    if (idGuardado) {
        console.log("Sesión iniciada. Tutor ID: " + idGuardado);
        cargarMaterias(); 
        cargarFranjas(idGuardado); 
        cargarReservasTutor(); 
    } else {
        console.warn("No se encontró ID de usuario. Redirigiendo al login...");
        // window.location.href = "login.html"; // Descomentar en producción
    }
};

// 13. CARGAR RESERVAS DEL TUTOR
async function cargarReservasTutor() {
    const tutorId = localStorage.getItem("usuarioId");
    try {
        const response = await fetch(`http://localhost:8081/reservas/tutor/${tutorId}`, {
            headers: getHeaders()
        });
        const reservas = await response.json();
        const tabla = document.getElementById("cuerpoReservas");
        tabla.innerHTML = "";
        if (reservas.length === 0) {
            tabla.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay reservas aún</td></tr>`;
            return;
        }
        reservas.forEach(reserva => {
            const esActiva = reserva.estado === 'activa';
            const fila = `
                <tr>
                    <td>${reserva.estudiante?.nombre || "N/A"}</td>
                    <td style="text-align: center;">${reserva.franjaHoraria?.materia?.nombre || "N/A"}</td>
                    <td>
                        ${reserva.franjaHoraria?.fecha || ""} <br>
                        <small style="color: #718096;">${reserva.franjaHoraria?.horaInicio || ""} - ${reserva.franjaHoraria?.horaFin || ""}</small>
                    </td>
                    <td>
                        <span style="background: ${esActiva ? '#d4edda' : '#f8d7da'}; color: ${esActiva ? '#155724' : '#721c24'}; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold;">
                            ${reserva.estado.toUpperCase()}
                        </span>
                    </td>
                    <td>
                        ${esActiva ? 
                          `<button style="background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8em;" onclick="cancelarReserva(${reserva.id})">Cancelar</button>` : 
                          `<button style="background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: #a0aec0; transition: 0.2s;" onmouseover="this.style.color='#e53e3e'" onmouseout="this.style.color='#a0aec0'" onclick="eliminarReservaHistorial(${reserva.id})" title="Eliminar del historial">🗑️</button>`}
                    </td>
                </tr>`;
            tabla.innerHTML += fila;
        });
    } catch (error) { console.error(error); }
}

// 14. CANCELAR RESERVA
async function cancelarReserva(reservaId) {
    const motivo = prompt("Por favor, ingresa el motivo de la cancelación:");
    if (motivo === null) return;
    try {
        const url = `http://localhost:8081/reservas/cancelar/${reservaId}?motivo=${encodeURIComponent(motivo || "Cancelada por el tutor")}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: getHeaders()
        });
        if (response.ok) {
            alert("Tutoría cancelada exitosamente. La franja horaria ahora está libre.");
            const tutorId = localStorage.getItem("usuarioId");
            cargarFranjas(tutorId);
            cargarReservasTutor();
        } else {
            const error = await response.json();
            alert("No se pudo cancelar: " + (error.mensaje || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error al cancelar la reserva:", error);
        alert("Hubo un problema de conexión con el servidor.");
    }
}