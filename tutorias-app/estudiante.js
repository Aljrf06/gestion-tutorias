window.onload = function() {
    // 1. Extraemos los dos datos que guardaste en el login
    const nombreGuardado = localStorage.getItem("nombre");
    const idGuardado = localStorage.getItem("usuarioId");

    // 2. Buscamos el lugar en el HTML donde va el nombre
    const etiquetaNombre = document.getElementById("nombreBienvenida");

    // 3. Verificamos el nombre para el saludo
    if (nombreGuardado) {
        etiquetaNombre.textContent = nombreGuardado;
    } else {
        etiquetaNombre.textContent = "Invitado";
    }

    // 4. Verificamos el ID para cargar los datos de la base de datos
    if (idGuardado) {
        console.log("Sesión iniciada. Estudiante ID: " + idGuardado);
        
        // Llamamos a tus funciones de carga
        cargarMisReservas(idGuardado); // Carga las reservas del estudiante
        cargarTodasLasTutorias();
    } else {
        console.warn("No se encontró ID de usuario. Redirigiendo al login...");
        // window.location.href = "index.html";
    }
    
};

function logout() {
    console.log("Cerrando sesión...");
    localStorage.clear(); // Limpia todo el localStorage (puedes optar por eliminar solo el nombre si prefieres)
    // Redirige al archivo de login (ajusta el nombre si es necesario)
    window.location.href = "login.html"; 
}

async function cargarTodasLasTutorias() {
    const contenedor = document.getElementById('listaFranjasDisponibles');
    
    try {
        // Llamamos al endpoint general de franjas
        const response = await fetch('http://localhost:8081/franjas-horarias/listarFranjas');
        const franjas = await response.json();

        contenedor.innerHTML = '';

        // Filtramos para mostrar solo lo disponible
        const disponibles = franjas.filter(f => f.estado === 'disponible');

        if (disponibles.length === 0) {
            contenedor.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 20px;">No hay tutorías disponibles en este momento.</p>';
            return;
        }

        disponibles.forEach(franja => {
            const card = document.createElement('article');
            card.className = 'slot-card'; // Usa el mismo estilo que el tutor para que se vea igual

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
            <button class="btn-save" 
                    style="width: 100%; padding: 10px; cursor: pointer;" 
                    onclick="solicitarReserva(${franja.id})">
                Reservar Tutoría
            </button>
        </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar tutorías:", error);
        contenedor.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
}

async function solicitarReserva(franjaId) {
    // 1. Obtener el ID del estudiante logueado
    const estudianteId = localStorage.getItem("usuarioId");

    if (!estudianteId) {
        alert("Error: No se encontró la sesión del estudiante. Por favor, inicia sesión de nuevo.");
        return;
    }

    // Confirmación visual para el usuario
    if (!confirm("¿Estás seguro de que deseas reservar esta tutoría?")) {
        return;
    }

    // 2. Construir el objeto Reserva (debe coincidir con tu entidad Java)
    const nuevaReserva = {
        estudiante: { id: parseInt(estudianteId) },
        franjaHoraria: { id: parseInt(franjaId) },
        estado: "activa", // El estado inicial según tu Enum
        fechaReserva: new Date().toISOString() // Fecha actual en formato ISO
    };

    try {
        // 3. Petición POST al backend
        const response = await fetch('http://localhost:8081/reservas/crearReserva', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaReserva)
        });

        if (response.ok) {
            alert("¡Solicitud enviada! El tutor deberá confirmar tu reserva.");
            
            // 4. Refrescar los datos para que el estudiante vea su nueva solicitud en la tabla
            cargarTodasLasTutorias(); 
            cargarMisReservas(estudianteId); 
        } else {
            const error = await response.json();
            alert("No se pudo realizar la reserva: " + (error.mensaje || "Error del servidor"));
        }
    } catch (error) {
        console.error("Error en la conexión:", error);
        alert("Hubo un problema de conexión con el servidor.");
    }
}

async function cargarMisReservas(estudianteId) {
    try {
        const response = await fetch(`http://localhost:8081/reservas/estudiante/${estudianteId}`);
        
        if (!response.ok) {
            throw new Error("Error al obtener reservas");
        }

        const reservas = await response.json();
        console.log("Reservas:", reservas);
const tabla = document.getElementById("misReservas");
tabla.innerHTML = "";

reservas.forEach(reserva => {
    const fila = `
        <tr>
            <td>${reserva.franjaHoraria?.materia?.nombre || "N/A"}</td>
            <td>${reserva.franjaHoraria?.tutor?.nombre || "N/A"}</td>
            <td>
                ${reserva.franjaHoraria?.fecha || ""} 
                ${reserva.franjaHoraria?.horaInicio || ""} - 
                ${reserva.franjaHoraria?.horaFin || ""}
            </td>
            <td>${reserva.estado}</td>
        </tr>
    `;
    tabla.innerHTML += fila;
});

    } catch (error) {
        console.error("Error cargando reservas:", error);
    }
}