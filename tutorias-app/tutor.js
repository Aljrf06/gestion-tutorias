/**
 * ARCHIVO: tutor.js
 * Descripción: Maneja la lógica del panel de tutor, formularios y navegación.
 */

// 1. GESTIÓN DE FORMULARIOS (Mostrar/Ocultar)
function mostrarForm(id) {
    // Primero ocultamos todos los formularios para que no se encimen
    const formularios = ['franjaForm', 'materiaForm'];
    
    formularios.forEach(formId => {
        const f = document.getElementById(formId);
        if (f) f.style.display = 'none';
    });

    // Mostramos el que el usuario solicitó
    const formularioSeleccionado = document.getElementById(id);
    if (formularioSeleccionado) {
        formularioSeleccionado.style.display = 'block';
        console.log("Mostrando formulario: " + id);
    } else {
        console.error("Error: No se encontró el ID " + id);
    }
}

// 2. LÓGICA DE NAVEGACIÓN (Cerrar Sesión)
function logout() {
    console.log("Cerrando sesión...");
    localStorage.clear(); // Limpia todo el localStorage (puedes optar por eliminar solo el nombre si prefieres)
    // Redirige al archivo de login (ajusta el nombre si es necesario)
    window.location.href = "login.html"; 
}

// 3. CREAR MATERIA (Conexión con tu BD)
async function crearMateria() {
    const nombre = document.getElementById('nombreMateria').value;
    const descripcion = document.getElementById('descripcionMateria').value;

    if (!nombre) {
        alert("El nombre de la materia es obligatorio");
        return;
    }

    const nuevaMateria = {
        nombre: nombre,
        descripcion: descripcion
    };


    try {
        const response = await fetch('http://localhost:8081/materias/registrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevaMateria)
        });
        if (response.ok){
            alert("Materia guardada!");
            cargarMaterias(); // Recarga el select de materias para incluir la nueva    
        } 
    } catch (error) {
        console.error("Error al conectar con la BD", error);
    }

    alert("Materia '" + nombre + "' creada (Simulación)");
    document.getElementById('materiaForm').style.display = 'none';
}

// 4. CREAR FRANJA HORARIA
async function crearFranja() {
    // 1. Obtener el ID del tutor del localStorage
    const tutorId = localStorage.getItem("usuarioId");
    
    // 2. Capturar los valores del formulario
    const fecha = document.getElementById('fecha').value;
    const inicio = document.getElementById('hora_inicio').value;
    const fin = document.getElementById('hora_fin').value;
    const desc = document.getElementById('descripcion').value;
    const materiaId = document.getElementById('materia_id').value;

    // Validación básica
    if (!fecha || !inicio || !fin || !materiaId) {
        alert("Por favor completa todos los campos obligatorios");
        return;
    }

    // 3. Construir el objeto exactamente como lo espera tu Entidad en Java
    // Nota: Si tu entidad usa objetos completos, enviamos el ID en un sub-objeto
    const nuevaFranja = {
        fecha: fecha,
        horaInicio: inicio,
        horaFin: fin,
        descripcion: desc,
        estado: "disponible", // Cambiamos 'disponible: true' por el enum
        tutor: { id: parseInt(tutorId) },
        materia: { id: parseInt(materiaId) }
    };

    try {
        // 4. Hacer la petición real al servidor
        const response = await fetch('http://localhost:8081/franjas-horarias/crearFranja', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevaFranja)
        });

        if (response.ok) {
            alert("¡Franja guardada exitosamente en la base de datos!");
            
            // 5. Limpiar y refrescar la lista
            document.getElementById('franjaForm').reset();
            document.getElementById('franjaForm').style.display = 'none';
            cargarFranjas(tutorId); // Recargamos para ver la nueva franja
        } else {
            const error = await response.json();
            alert("Error al guardar: " + (error.mensaje || "Error desconocido"));
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// 6. LISTAR MATERIAS EN EL SELECT
async function cargarMaterias() {
    const selectMateria = document.getElementById('materia_id');
    
    try {
        const response = await fetch('http://localhost:8081/materias/listarMaterias'); // Ajusta la ruta según tu Controller
        if (!response.ok) throw new Error("Error al obtener materias");

        const materias = await response.json();

        // Limpiar opciones actuales excepto la primera
        selectMateria.innerHTML = '<option value="">Seleccionar Materia</option>';

        materias.forEach(materia => {
            const option = document.createElement('option');
            option.value = materia.id; // Asegúrate que tu entidad tenga 'id'
            option.textContent = materia.nombre; // Asegúrate que tu entidad tenga 'nombre'
            selectMateria.appendChild(option);
        });

        console.log("Materias cargadas en el select");
    } catch (error) {
        console.error("Error al poblar el select de materias:", error);
    }
}
//listarFranjas(); // Si quieres cargar las franjas al inicio, implementa esta función similar a cargarMaterias()
async function cargarFranjas(tutorId) {
    const contenedor = document.getElementById('listaFranjas');
    
    try {
        // Hacemos la petición al endpoint que creaste en Java
        const response = await fetch(`http://localhost:8081/franjas-horarias/tutor/${tutorId}`);
        
        if (!response.ok) throw new Error("No se pudieron cargar las franjas");

        const franjas = await response.json();

        // Limpiamos el contenedor (el grid de tarjetas)
        contenedor.innerHTML = '';

        if (franjas.length === 0) {
            contenedor.innerHTML = '<p>No tienes franjas programadas aún.</p>';
            return;
        }

        // Dibujamos cada tarjeta de franja
        franjas.forEach(franja => {
            const card = document.createElement('article');
            card.className = 'slot-card';
            
            card.innerHTML = `
                <div class="card-header">
                    <strong>${franja.materia.nombre}</strong>
                    <span class="status">${franja.estado === 'disponible' ? 'Disponible' : 'Ocupada'}</span>
                </div>
                <div class="card-body">
                    <p>📅 Fecha: ${franja.fecha}</p>
                    <p>🕒 Horario: ${franja.horaInicio} - ${franja.horaFin}</p>
                    <p>📝 ${franja.descripcion || 'Sin descripción'}</p>
                </div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="abrirEditor(${franja.id})">Editar</button>
                    <button class="btn-delete" onclick="eliminarFranja(${franja.id})">Eliminar</button>
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        contenedor.innerHTML = '<p>Error al conectar con el servidor.</p>';
    }
}

// 5. CARGA INICIAL (Opcional)
// Si quieres que al cargar la página ya se busquen datos de la BD:
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
        console.log("Sesión iniciada. Tutor ID: " + idGuardado);
        
        // Llamamos a tus funciones de carga
        cargarMaterias(); 
        cargarFranjas(idGuardado); // <-- Le enviamos el ID a la función
    } else {
        console.warn("No se encontró ID de usuario. Redirigiendo al login...");
        // window.location.href = "index.html";
    }
};