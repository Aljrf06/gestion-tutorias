/**
 * ARCHIVO: estudiante.js
 * Descripción: Maneja la lógica del portal del estudiante, búsqueda y reservas.
 */

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
        console.log("Sesión iniciada. Estudiante ID: " + idGuardado);
        cargarMisReservas(idGuardado); 
        cargarTodasLasTutorias();
    } else {
        console.warn("No se encontró ID de usuario. Redirigiendo al login...");
        // window.location.href = "login.html";
    }
};

function logout() {
    localStorage.clear();
    window.location.href = "login.html"; 
}


// 1. CARGAR TODAS LAS TUTORÍAS DISPONIBLES

async function cargarTodasLasTutorias() {
    const contenedor = document.getElementById('listaFranjasDisponibles');
    
    // Capturar los valores de los filtros y pasarlos a minúsculas para que la búsqueda no sea sensible a mayúsculas
    const txtMateria = document.getElementById('filtroMateria').value.toLowerCase().trim();
    const txtTutor = document.getElementById('filtroTutor').value.toLowerCase().trim();
    const txtFecha = document.getElementById('filtroFecha').value;

    try {
        const response = await fetch('http://localhost:8081/franjas-horarias/listarFranjas');
        const franjas = await response.json();

        contenedor.innerHTML = '';

        // Filtrar franjas: 
        // 1. Que estén 'disponible'
        // 2. Que coincidan con la Materia (si se escribió algo)
        // 3. Que coincidan con el Tutor (si se escribió algo)
        // 4. Que coincidan con la Fecha (si se seleccionó una)
        const disponibles = franjas.filter(f => {
            const esDisponible = f.estado === 'disponible';
            
            // Si el texto de búsqueda está vacío (incluye ""), la condición devuelve true automáticamente.
            const coincideMateria = f.materia.nombre.toLowerCase().includes(txtMateria);
            const coincideTutor = f.tutor.nombre.toLowerCase().includes(txtTutor);
            const coincideFecha = txtFecha === "" || f.fecha === txtFecha;

            return esDisponible && coincideMateria && coincideTutor && coincideFecha;
        });

        if (disponibles.length === 0) {
            contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px; background: white; border-radius: 8px;">No se encontraron tutorías con esos filtros.</p>';
            return;
        }

        disponibles.forEach(franja => {
            const card = document.createElement('article');
            card.className = 'slot-card';

            card.innerHTML = `
                <div class="card-header">
                    <strong>${franja.materia.nombre}</strong>
                    <span class="badge disponible" style="background: #d4edda; color: #155724; padding: 2px 8px; border-radius: 4px; font-size: 0.8em;">
                        Libre
                    </span>
                </div>
                <div class="card-body">
                    <p>👨‍🏫 <strong>Tutor:</strong> ${franja.tutor.nombre}</p>
                    <p>📅 ${franja.fecha}</p>
                    <p>🕒 ${franja.horaInicio} - ${franja.horaFin}</p>
                    <p>📝 ${franja.descripcion || 'Sin descripción'}</p>
                </div>
                <div class="card-actions" style="margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; display: flex; justify-content: center;">
                    <button class="btn-save" style="width: 100%; padding: 10px; cursor: pointer;" 
                        onclick="solicitarReserva(${franja.id}, '${franja.fecha}', '${franja.horaInicio}', '${franja.horaFin}')">
                        Reservar Tutoría
                    </button>
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
}

// Función para limpiar los filtros y recargar todas las tutorías disponibles
function limpiarFiltros() {
    document.getElementById('filtroMateria').value = '';
    document.getElementById('filtroTutor').value = '';
    document.getElementById('filtroFecha').value = '';
    cargarTodasLasTutorias();
}

// 2. SOLICITAR UNA RESERVA

async function solicitarReserva(franjaId, fecha, inicio, fin) {
    const estudianteId = localStorage.getItem("usuarioId");

    if (!estudianteId) {
        alert("Error: Sesión no encontrada.");
        return;
    }

    // --- AQUI APLICAMOS LA VALIDACIÓN ---
    const hayCruce = await validarTraslapeEstudiante(estudianteId, fecha, inicio, fin);
    if (hayCruce) {
        alert("⚠️ No puedes reservar esta tutoría porque se cruza con otra reserva activa que ya tienes en ese horario.");
        return; // Detiene la ejecución para que no se haga la reserva
    }

    if (!confirm("¿Estás seguro de que deseas reservar esta tutoría?")) return;

    const nuevaReserva = {
        estudiante: { id: parseInt(estudianteId) },
        franjaHoraria: { id: parseInt(franjaId) },
        estado: "activa",
        fechaReserva: new Date().toISOString()
    };

    try {
        const response = await fetch('http://localhost:8081/reservas/crearReserva', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaReserva)
        });

        if (response.ok) {
            alert("¡Reserva realizada con éxito!");
            cargarTodasLasTutorias(); 
            cargarMisReservas(estudianteId); 
        } else {
            const error = await response.json();
            alert("No se pudo realizar la reserva: " + (error.mensaje || "Error del servidor"));
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

// 3. CARGAR MIS RESERVAS (Tabla actualizada con botón cancelar)

async function cargarMisReservas(estudianteId) {
    try {
        const response = await fetch(`http://localhost:8081/reservas/estudiante/${estudianteId}`);
        if (!response.ok) throw new Error("Error al obtener reservas");

        const reservas = await response.json();
        const tabla = document.getElementById("misReservas");
        tabla.innerHTML = "";

        if (reservas.length === 0) {
            tabla.innerHTML = `<tr><td colspan="5" style="text-align:center;">No tienes solicitudes aún.</td></tr>`;
            return;
        }

        reservas.forEach(reserva => {
            const esActiva = reserva.estado === 'activa';
            
            const fila = `
                <tr>
                    <td>${reserva.franjaHoraria?.materia?.nombre || "N/A"}</td>
                    <td style="text-align: center;">${reserva.franjaHoraria?.tutor?.nombre || "N/A"}</td>
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
                            `<button style="background: #fff5f5; color: #c53030; border: 1px solid #feb2b2; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.8em;" onclick="cancelarReservaEstudiante(${reserva.id})">Cancelar</button>` : 
                            `<button style="background: transparent; border: none; font-size: 1.2rem; cursor: pointer; color: #a0aec0; transition: 0.2s;" onmouseover="this.style.color='#e53e3e'" onmouseout="this.style.color='#a0aec0'" onclick="eliminarReservaHistorial(${reserva.id})" title="Eliminar del historial">🗑️</button>`}
                    </td>
                </tr>
            `;
            tabla.innerHTML += fila;
        });

    } catch (error) {
        console.error("Error cargando reservas:", error);
    }
}

// 4. CANCELAR RESERVA DESDE EL ESTUDIANTE
async function cancelarReservaEstudiante(reservaId) {
    const motivo = prompt("¿Por qué deseas cancelar tu tutoría?");
    if (motivo === null) return; // Si el estudiante cierra el cuadro

    try {
        const url = `http://localhost:8081/reservas/cancelar/${reservaId}?motivo=${encodeURIComponent(motivo || "Cancelada por el estudiante")}`;
        
        const response = await fetch(url, { method: 'PUT' });

        if (response.ok) {
            alert("Tutoría cancelada. La franja volverá a estar disponible para otros estudiantes.");
            
            // Sincronización: recargamos ambas listas
            const estudianteId = localStorage.getItem("usuarioId");
            cargarMisReservas(estudianteId); 
            cargarTodasLasTutorias(); 
        } else {
            const error = await response.json();
            alert("Error al cancelar: " + (error.mensaje || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

async function validarTraslapeEstudiante(estudianteId, nuevaFecha, nuevaInicio, nuevaFin) {
    try {
        const response = await fetch(`http://localhost:8081/reservas/estudiante/${estudianteId}`);
        if (!response.ok) return false;

        const reservas = await response.json();

        // Verificamos si alguna reserva ACTIVA choca con el nuevo horario
        return reservas.some(reserva => {
            // Solo nos interesan las reservas que no estén canceladas
            if (reserva.estado !== 'activa') return false;

            const franja = reserva.franjaHoraria;
            if (!franja) return false;

            if (franja.fecha === nuevaFecha) {
                // (Inicio Nuevo < Fin Existente) Y (Fin Nuevo > Inicio Existente)
                return (nuevaInicio < franja.horaFin && nuevaFin > franja.horaInicio);
            }
            return false;
        });
    } catch (error) {
        console.error("Error al validar traslapes del estudiante:", error);
        return false;
    }
}