document.getElementById("registroForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const data = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        tipo: document.getElementById("tipo").value
    };

    if (data.tipo === "") {
        alert("Selecciona un tipo de usuario");
        return;
    }

    fetch("http://localhost:8081/usuarios/registrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) {
            throw new Error("Error en el registro");
        }
        return res.json();
    })
    .then(response => {
        
        if (response.id) {
            alert("Usuario creado correctamente");
            window.location.href = "login.html";
        } else {
            alert("No se pudo registrar");
        }
    })
    .catch(error => {
        console.error(error);
        alert("Error al conectar con el servidor");
    });
});