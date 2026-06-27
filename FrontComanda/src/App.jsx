import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// ── Auth ──────────────────────────────────────────────────────────────────────
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyAccount from './pages/MyAccount';

// ── Public Components ─────────────────────────────────────────────────────────
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import About from './pages/About';
import Form from './pages/Form';
import RegisterRestaurant from './pages/RegisterRestaurant';

// ── Intranet ──────────────────────────────────────────────────────────────────
import IntranetLayout from './components/intranet/IntranetLayout';
import IntranetDashboard from './pages/intranet/IntranetDashboard';
import RestaurantRequests from './pages/intranet/RestaurantRequests';
import Comments from './pages/intranet/Comments';
import Users from './pages/intranet/Users';
import NewRestaurant from './pages/intranet/NewRestaurant';
import TableManagement from './pages/intranet/TableManagement';
import Bookings from './pages/intranet/Bookings';
import RegisteredRestaurants from './pages/intranet/RegisteredRestaurants';

// ── Context ───────────────────────────────────────────────────────────────────
import { RestaurantsProvider } from './context/RestaurantsContext';
import { TablesProvider } from './context/TablesContext';
import { CommentsProvider } from './context/CommentsContext';

function App() {
  return (
    <AuthProvider>
      <RestaurantsProvider>
        <TablesProvider>
          <CommentsProvider>
            <Router>
              <Routes>

                {/* ── Auth ─────────────────────────────────────────────── */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ── Mi cuenta (solo rol usuario) ─────────────────────── */}
                <Route
                  path="/my-account"
                  element={
                    <ProtectedRoute allowedRoles={["usuario"]}>
                      <MyAccount />
                    </ProtectedRoute>
                  }
                />

                {/* ── Rutas públicas ───────────────────────────────────── */}
                <Route
                  path="/*"
                  element={
                    <div className="d-flex flex-column min-vh-100">
                      <Navbar />
                      <main className="flex-grow-1">
                        <Routes>
                          <Route index element={<Home />} />
                          <Route path="catalog" element={<Catalog />} />
                          <Route path="about" element={<About />} />
                          <Route path="form" element={<Form />} />
                          <Route path="register-restaurant" element={<RegisterRestaurant />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  }
                />

                {/* ── Intranet (administrador + personal) ──────────────── */}
                <Route
                  path="/intranet"
                  element={
                    <ProtectedRoute allowedRoles={["administrador", "personal"]}>
                      <IntranetLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Dashboard (index) */}
                  <Route
                    index
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <IntranetDashboard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Solo administrador */}
                  <Route
                    path="restaurants"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <RegisteredRestaurants />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="new-restaurant"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <NewRestaurant />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="restaurant-requests"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <RestaurantRequests />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="comments"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <Comments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute allowedRoles={["administrador"]}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />

                  {/* Administrador + Personal */}
                  <Route
                    path="tables"
                    element={
                      <ProtectedRoute allowedRoles={["administrador", "personal"]}>
                        <TableManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="bookings"
                    element={
                      <ProtectedRoute allowedRoles={["administrador", "personal"]}>
                        <Bookings />
                      </ProtectedRoute>
                    }
                  />
                </Route>

              </Routes>
            </Router>
          </CommentsProvider>
        </TablesProvider>
      </RestaurantsProvider>
    </AuthProvider>
  );
}

export default App;