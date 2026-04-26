
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// ── Auth ────────────────────────────────────────────────────────────────────
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import MiCuenta from './pages/MiCuenta';

// ── Componentes Publicos ────────────────────────────────────────────────────────────────
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Form from './pages/Form';

// ── Intranet ────────────────────────────────────────────────────────────────
import IntranetLayout from '../../FrontComanda/src/components/intranet/IntranetLayout';
import IntranetHome from './pages/intranet/IntranetHome';
import SolicitudesRestaurantes from './pages/intranet/SolicitudesRestaurantes';
import Comentarios from './pages/intranet/Comentarios';
import Usuarios from './pages/intranet/Usuarios';
import NuevoRestaurante from './pages/intranet/NuevoRestaurante';
import GestionMesas from './pages/intranet/GestionMesas';
import Reservas from './pages/intranet/Reservas';
import RestaurantesRegistrados from './pages/intranet/RestaurantesRegistrados';

// ── Context ─────────────────────────────────────────────────────────────────
import { RestaurantesProvider } from './context/RestaurantesContext';
import { MesasProvider } from './context/MesasContext';
import { ComentariosProvider } from './context/ComentariosContext';
function App() {
  return (
    <AuthProvider>
      <RestaurantesProvider>
        <MesasProvider>
            <ComentariosProvider>
            <Router>
              <Routes>

                {/* ── Rutas de autenticación (sin Navbar/Footer) ────────── */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* ── Área de usuario autenticado (rol: usuario) ────────── */}
                <Route
                  path="/mi-cuenta"
                  element={
                    <ProtectedRoute allowedRoles={["usuario"]}>
                      <MiCuenta />
                    </ProtectedRoute>
                  }
                />

                {/* ── Rutas públicas (web) ──────────────────────────────── */}
                <Route path="/*" element={
                  <div className="d-flex flex-column min-vh-100">
                    <Navbar />
                    <main className="flex-grow-1">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/form" element={<Form />} />
                      </Routes>
                    </main>
                    <Footer />
                  </div>
                } />

                {/* ── Intranet (admin + personal) ───────────────────────── */}
                <Route
                  path="/intranet"
                  element={
                    <ProtectedRoute allowedRoles={["administrador", "personal"]}>
                      <IntranetLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Rutas solo para administrador */}
                  <Route
                    index
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <IntranetHome />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="restaurantes"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <RestaurantesRegistrados />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="restaurantesSolicitudes"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <SolicitudesRestaurantes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="comentarios"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <Comentarios />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="usuarios"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <Usuarios />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="nuevoRestaurante"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <NuevoRestaurante />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rutas accesibles por admin Y personal */}
                  <Route
                    path="mesas"
                    element={
                      <ProtectedRoute allowedRoles={["administrador", "personal"]}>
                        <GestionMesas />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="reservas"
                    element={
                      <ProtectedRoute allowedRoles={["administrador", "personal"]}>
                        <Reservas />
                      </ProtectedRoute>
                    }
                  />
                </Route>

              </Routes>
            </Router>
          </ComentariosProvider>          
        </MesasProvider>
      </RestaurantesProvider>
    </AuthProvider>
  );
}
export default App;