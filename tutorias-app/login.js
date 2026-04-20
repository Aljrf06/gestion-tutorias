document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();



        const data = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value
        };

        fetch("http://localhost:8081/usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Credenciales incorrectas");
            }
            return res.json();
        })
        .then(response => {
            if (response.id) {
                alert("Bienvenido " + response.nombre);
                localStorage.setItem("nombre", response.nombre);
                localStorage.setItem("usuarioId", response.id); // Guarda el ID del usuario
                if (response.tipo === "tutor") {
                    window.location.href = "tutor.html";
                }
                else{
                    window.location.href = "estudiante.html";
                }
                
            } else {
                alert("Error en login");
            }
        })
        .catch(error => {
            console.error(error);
            alert("Correo o contraseña incorrectos");
        });
});