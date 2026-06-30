# Comanda — Frontend

Frontend del sistema de reservas **Comanda**, desarrollado con React + Vite. Permite a los comensales buscar restaurantes, hacer reservas y dejar comentarios; y al personal del restaurante gestionar mesas, reservas y comentarios desde un panel de intranet.

Repositorio del backend: [BackSistemaReserva](https://github.com/TafurPanduroJuan/BackSistemaReserva.git)

---

## Tecnologías

- React 19 + Vite 8
- React Router DOM 7
- Bootstrap 5 (via CDN)
- Context API para manejo de estado global
- JWT almacenado en `localStorage` para autenticación

---

## Estructura de carpetas

```
src/
├── components/          # Navbar, Footer, BookingModal, ProtectedRoute, etc.
│   └── intranet/        # Layout del panel interno
├── context/             # AuthContext, CommentsContext, TablesContext, etc.
├── pages/               # Home, Catalog, Login, Register, MyAccount, About
│   └── intranet/        # Dashboard, Bookings, TableManagement, Comments, Users...
└── services/
    └── api.js           # apiFetch() — agrega el Bearer token automáticamente
```

---

## Requisitos previos

- Node.js 18 o superior
- npm
- El backend corriendo (ver repositorio del backend)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/TafurPanduroJuan/BackSistemaReserva.git
cd FrontSistemaReserva/FrontComanda

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
```

Editar el `.env` con los valores correspondientes:

```env
# URL del backend
VITE_API_URL=http://localhost:8080

# Client ID de Google OAuth2 (Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

```bash
# 4. Levantar el servidor de desarrollo
npm run dev
```

La app queda disponible en `http://localhost:5173`.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción en `/dist` |
| `npm run preview` | Preview del build de producción |
| `npm run lint` | Linter con ESLint |

---

## Rutas principales

| Ruta | Descripción | Acceso |
|---|---|---|
| `/` | Home | Público |
| `/catalogo` | Catálogo de restaurantes con filtros | Público |
| `/formulario` | Solicitud para registrar un restaurante | Público |
| `/nosotros` | Página informativa | Público |
| `/login` | Inicio de sesión | Público |
| `/register` | Registro de usuario | Público |
| `/my-account` | Historial de reservas del usuario | Autenticado |
| `/intranet/*` | Panel de gestión (personal y admin) | Personal / Admin |

---

## Despliegue

El frontend está desplegado en Vercel:
`https://front-sistema-reserva.vercel.app`

Para desplegar en tu propia cuenta de Vercel, el archivo `vercel.json` ya está configurado con las reglas de redirección necesarias para React Router.

Las variables de entorno (`VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`) deben configurarse desde el dashboard de Vercel en *Settings → Environment Variables*.

---

## Credenciales de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@comanda.com | admin123 |
| Personal | PFogon@comanda.com | fogon12345 |
| Usuario | diego12@comanda.com | diego12345 |
