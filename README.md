# 📚 Sistema Gestión Tutorías Académicas
Plataforma web que centraliza y automatiza la gestión de asesorías académicas entre tutores y estudiantes, 
eliminando la coordinación manual y desorganizada que genera conflictos de horario, doble reserva y falta de seguimiento.

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: Spring Boot 3.4.1
- **Java**: Versión 21 (compilación 17)
- **Gestor de Dependencias**: Maven

### Base de Datos
- **SGBD**: MySQL
- **ORM**: Spring Data JPA + Hibernate
- **Validación**: Spring Validation

### Seguridad
- **Autenticación**: Spring Security
- **Autorización**: JWT (JSON Web Tokens) - JJWT 0.11.5
- **Tokenización**: Soporte para múltiples roles (Tutor/Estudiante)

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- CORS habilitado para comunicación cliente-servidor

### Utilidades
- **Lombok**: Reducción de boilerplate code (getters, setters, constructores)
- **Testing**: Spring Boot Test

## 🏗️ Arquitectura del Sistema

### Estructura de Carpetas

```text
gestion-tutorias/
├── backend/
│   ├── src/main/java/co/edu/sistemagestiontutoria/
│   │   ├── controller/       # Controladores REST
│   │   ├── service/          # Lógica de negocio
│   │   ├── repository/       # Acceso a datos
│   │   ├── model/            # Entidades JPA
│   │   ├── config/           # Configuración (Security)
│   │   └── excepcion/        # Manejo de excepciones
│   └── pom.xml               # Configuración Maven
├── Grafica BD.jpeg           # Diagrama de base de datos
└── README.md
```
## 📌 Endpoints de la API

### Gestión de Materias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/materias/registrar` | Crear nueva materia |
| `GET` | `/materias/listarMaterias` | Obtener todas las materias |
| `GET` | `/materias/{id}` | Buscar materia por ID |
| `DELETE` | `/materias/{id}` | Eliminar materia |

---

### Gestión de Franjas Horarias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/franjas-horarias/crearFranja` | Crear franja horaria (Solo Tutor) |
| `GET` | `/franjas-horarias/listarFranjas` | Listar todas las franjas |
| `GET` | `/franjas-horarias/tutor/{tutorId}` | Franjas de un tutor específico |
| `GET` | `/franjas-horarias/materia/{materiaId}` | Franjas de una materia |
| `GET` | `/franjas-horarias/{id}` | Obtener franja por ID |
| `GET` | `/franjas-horarias/fecha/{fecha}` | Franjas en una fecha específica |
| `PUT` | `/franjas-horarias/{id}` | Actualizar franja (Solo Tutor) |
| `DELETE` | `/franjas-horarias/{id}` | Eliminar franja |

---

### Gestión de Reservas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/reservas/crearReserva` | Estudiante reserva una franja |
| `GET` | `/reservas/listarReservas` | Listar todas las reservas |
| `GET` | `/reservas/estudiante/{estudianteId}` | Reservas de un estudiante |
| `GET` | `/reservas/tutor/{tutorId}` | Reservas con un tutor |
| `PUT` | `/reservas/cancelar/{id}` | Cancelar reserva con motivo |

## 🚀 Instalación y Configuración

### Requisitos Previos

- Java 21 
- Maven 3.8+
- MySQL 8.0+
- Node.js (opcional, si hay frontend separado)

### Pasos de Instalación

1. **Clonar repositorio:**

```bash
git clone https://github.com/Aljrf06/gestion-tutorias.git
cd gestion-tutorias
```

2. **Compilar y ejecutar (desde la rama main):**

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

## 📋 Gestión del Proyecto
[Jira del proyecto](https://mantillajerson2.atlassian.net)

## 📉 Base de datos
<img width="1064" height="731" alt="image" src="https://github.com/user-attachments/assets/f9f37606-de92-415e-95dc-c230d6dab676" />

## 👥 Autores
- Jerson Steven Mantilla Ramirez
- Alejandra Rodriguez Forero
- Santiago Galvis Saavedra

## 📊 Diapositivas
[Canva](https://canva.link/tbgy3wkizxth9i4)
