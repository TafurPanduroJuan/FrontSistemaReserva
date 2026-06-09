# Comanda — Sistema de Reservas de Restaurante

> Plataforma web que conecta comensales con restaurantes de Lima, permitiendo descubrir, reservar y gestionar mesas de forma digital, inmediata y desde cualquier dispositivo.

---

## Tabla de Contenidos

- [Descripción](#-descripción)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Modelo de Datos](#-modelo-de-datos)
- [Endpoints de la API](#-endpoints-de-la-api)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Ejecución](#-instalación-y-ejecución)
- [Despliegue](#-despliegue)
- [Credenciales](#-credenciales)
- [Equipo](#-equipo)

---

## Descripción

**Comanda** nació para resolver un problema real en Lima: reservar una mesa en un restaurante obligaba al comensal a llamar por teléfono o acercarse físicamente al local, sin garantía de disponibilidad y dependiendo del horario de atención. Del lado del restaurante, la gestión manual de reservas provocaba errores, mesas vacías por olvidos y la ausencia de un registro centralizado.

Comanda digitaliza ese proceso de punta a punta:

- El **comensal** busca restaurantes, ve disponibilidad en tiempo real y reserva en segundos.
- El **restaurante** administra sus mesas, reservas y clientes desde un panel de intranet centralizado.
- El **administrador** modera el alta de nuevos restaurantes y gestiona la plataforma completa.

---

## Funcionalidades

| Rol | Funcionalidad |
|---|---|
|   **Cliente** | Registro e inicio de sesón · Búsqueda y filtrado de restaurantes · -Reserva de mesa (zona, fecha, hora, personas) · Historial y cancelación de reservas · Comentarios y calificaciones |
|   **Personal del restaurante** | Panel de intranet · Gestión de mesas (estado en tiempo real) · Confirmación / cancelación de reservas · Dashboard de comentarios |
|   **Administrador** | Gestión de usuarios y roles · Aprobación o rechazo de solicitudes de restaurantes · Administración completa de la plataforma |

---

## 🛠️ Stack Tecnológico

### Frontend
| Herramienta | Versión |
|---|---|
| React | v19.2.4 |
| Vite | v8.0.4 |
| JavaScript (ES2024) | — |
| Bootstrap | v5 |
| React Router DOM | v7.14.1 |

### Backend
| Herramienta | Versión |
|---|---|
| Java | v21 |
| Spring Boot | v3.4.5 |
| Spring Security + JWT | — |
| PostgreSQL | v17.4 |
| Maven | v3 |
| Swagger / OpenAPI | v2.8.8 |

### DevOps y herramientas
| Herramienta | Uso |
|---|---|
| Vercel | Despliegue del frontend |
| Render Cloud | Despliegue del backend y base de datos |
| GitHub Desktop | Control de versiones (v3.5.11) |
| Jira | Gestión de requerimientos (v11.3.6) |
| Apidog | Documentación y pruebas de API (v2.8.20) |
| VS Code | Editor principal (v1.122) |

---

##   Arquitectura

```
┌─────────────────────────────────────────────┐
│  Usuario (navegador — cualquier dispositivo) │
│  Ver restaurantes · Reservar · Comentar      │
│  Mi cuenta · Panel admin                     │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│         Frontend — React + Vite              │
│  • Páginas públicas: Home · Catalog · Form   │
│  • Rutas protegidas: MyAccount · Intranet    │
│  • ProtectedRoute (verifica rol JWT)         │
│  • api.js → apiFetch() + Bearer token        │
│                               [ Vercel ]     │
└────────────────────┬────────────────────────┘
                     │ HTTP REST + Bearer JWT
                     │ Request → ← JSON Response
┌────────────────────▼────────────────────────┐
│      Backend — Spring Boot + JWT Security    │
│  Auth · Restaurants · Tables                 │
│  Reservations · Comments · Users            │
│                               [ Render.com ] │
└────────────────────┬────────────────────────┘
                     │
┌────────────────────▼────────────────────────┐
│       PostgreSQL — Render Managed DB         │
└─────────────────────────────────────────────┘
```

El backend sigue una **arquitectura en capas (MVC)** con:
- **Controllers** → reciben y validan requests HTTP
- **Services** → lógica de negocio y reglas transaccionales (`@Transactional`)
- **Repositories** → acceso a datos con Spring Data JPA
- **Security** → filtro JWT en cada request, roles por endpoint (`@PreAuthorize`)

---

##   Modelo de Datos

```
UserEntity              RestaurantEntity           RestaurantRequestEntity
─────────────           ────────────────           ───────────────────────
id (PK)                 id (PK)                    id (PK)
name                    nombre                     nombre
email                   tipo                       propietario
role                    distrito                   email
restaurant              direccion                  tipo / ciudad
avatar                  mesas                      telefono
telefono                telefono                   descripcion
createdAt               email                      fecha
                        imagen                     estado
                        horarioApertura
                        horarioCierre

TableEntity             ReservationEntity          CommentEntity
───────────             ─────────────────          ─────────────
id (PK)                 id (PK)                    id (PK)
restaurant_id (FK)      restaurant_id (FK)         restaurant_id (FK)
numero                  cliente                    usuario
capacidad               email                      email
estado                  tel                        tipo
zona                    fecha / hora               asunto
                        personas                   mensaje
                        mesaNumero                 fecha
                        zona / notas               calificacion
                        estado                     leido
```

**Enums:** `ReservationStatus` · `CommentType` · `RequestStatus`

**Regla transaccional clave:** Al reservar una mesa, tanto la `Reservation` como el cambio de estado de la `Table` a `"reservada"` se guardan en una única transacción atómica.

---

##   Endpoints de la API

La API REST cuenta con **6 controllers** y **27 endpoints** protegidos por JWT.

### `POST /api/auth`
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/login` | Genera JWT | Público |
| POST | `/register` | Crea usuario | Público |

### `GET /api/users`
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/me` | Perfil propio | Personal |
| PUT | `/me` | Editar perfil | Personal |
| GET | `/` | Listar usuarios | Admin |
| PUT | `/{id}/role` | Cambiar rol | Admin |
| DELETE | `/{id}` | Eliminar usuario | Admin |

### `GET /api/restaurants`
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/` | Listar restaurantes | Público |
| GET | `/{id}` | Detalle restaurante | Público |
| POST | `/` | Crear restaurante | Admin |
| PUT | `/{id}` | Actualizar | Admin/Personal |
| DELETE | `/{id}` | Eliminar | Admin |
| GET | `/requests` | Ver solicitudes | Admin |
| POST | `/requests` | Solicitar alta | Público |
| PUT | `/requests/{id}/accept` | Aprobar solicitud | Admin |
| PUT | `/requests/{id}/reject` | Rechazar solicitud | Admin |

### `GET /api/tables`
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/` | Crear mesa | Admin |
| GET | `/` | Listar mesas | Personal/Admin |
| GET | `/available` | Mesas disponibles | Público |
| POST | `/reserve` | Reservar mesa | Público |
| DELETE | `/{id}` | Eliminar mesa | Admin |

### `GET /api/reservations`
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/` | Listar reservas | Personal/Admin |
| GET | `/me` | Mis reservas | Usuario |
| PATCH | `/{id}/status` | Actualizar estado | Personal/Admin |

### `GET /api/comments`
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| GET | `/` | Listar (filtrable) | Público |
| POST | `/` | Crear comentario | Público |
| PUT | `/{id}/read` | Marcar leído | Personal |
| GET | `/unread-count` | Conteo dashboard | Personal |
| DELETE | `/{id}` | Eliminar | Admin |

>  Documentación interactiva completa (Swagger UI): disponible en `/swagger-ui.html` del backend desplegado.  
>  Colección Apidog: [https://ms7yixnffg.apidog.io](https://ms7yixnffg.apidog.io)

---

##  Estructura del Proyecto

```
──   FrontComanda/               # Aplicación React
   ├── src/
   │   ├── components/            # Navbar, Footer, BookingModal, ProtectedRoute
   │   │   └── intranet/          # Componentes del panel de gestión
   │   ├── pages/                 # Home, Catalog, Login, MyAccount, RegisterRestaurant
   │   │   └── intranet/          # Páginas del panel interno
   │   ├── services/
   │   │   └── api.js             # apiFetch() con Bearer token automático
   │   └── data/
   │       └── data.js            # Datos estáticos / constantes
   ├── vite.config.js
   └── vercel.json                # Configuración de despliegue

──   Comanda/                    # Aplicación Spring Boot
    ├── src/main/java/com/grupo6/
    │   ├── controller/            # 6 REST controllers
    │   ├── service/               # Lógica de negocio
    │   ├── repository/            # Interfaces JPA
    │   ├── entity/                # 6 entidades JPA
    │   ├── dto/                   # Request / Response DTOs
    │   ├── security/              # JWT filter, SecurityConfig
    │   └── exception/             # GlobalExceptionHandler
    ├── Dockerfile
    ├── ComandaDB.sql              # Script de base de datos
    └── pom.xml
```

---

##   Instalación y Ejecución

### Prerrequisitos
- Node.js ≥ 18 y npm
- Java 21 y Maven 3
- PostgreSQL 17

### Frontend

```bash
# Clonar repositorio y entrar al directorio del frontend
cd FrontComanda

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL del backend
# VITE_API_URL=http://localhost:8080

# Iniciar servidor de desarrollo
npm run dev
```

### Backend

```bash
# Entrar al directorio del backend
cd Comanda

# Configurar application.properties con tus credenciales de PostgreSQL
# spring.datasource.url=jdbc:postgresql://localhost:5432/comanda
# spring.datasource.username=tu_usuario
# spring.datasource.password=tu_contraseña

# Ejecutar el script de base de datos
psql -U tu_usuario -d comanda -f ComandaDB.sql

# Compilar y ejecutar
./mvnw spring-boot:run
```

El backend quedará disponible en `http://localhost:8080` y Swagger UI en `http://localhost:8080/swagger-ui.html`.

---

##   Despliegue

| Servicio | URL |
|---|---|
| **Frontend (Vercel)** | https://front-sistema-reserva.vercel.app |
| **API Docs (Apidog)** | https://ms7yixnffg.apidog.io |
| **Backend (Render)** | https://backsistemareserva-1fzv.onrender.com |
| **Swagger** | https://backsistemareserva-1fzv.onrender.com/swagger-ui/index.html |


---
## Credenciales

| Cuenta | Correo | Contraseña |
|---|---|---|
| **Administrador** | admin@comanda.com | admin123 |
| **Personal** | maria@gmail.com | maria12345 |
| **Usuario** | miguel@gmail.com | miguel123 |

---

##   Equipo

| Integrante | Área principal |
|---|---|
| **Hilario Ccucho, Juan Pablo** | Auth API (AuthController, AuthService, JWT) |
| **Ocsa Caceres, Juan Diego** | Persistencia (entidades JPA, enums, @Transactional) |
| **Tafur Panduro, Juan Miguel Enrique** | Controllers REST (6 controllers, 25 endpoints, manejo de errores) |
| **Yola Sanchez, Jhesua Jogan** | Seguridad (SecurityConfig, JwtService, JwtFilter, roles) |

> Proyecto desarrollado como parte del curso de Herramientas para el Desarrollo de Software — Universidad Tecnológica del Perú (UTP)
