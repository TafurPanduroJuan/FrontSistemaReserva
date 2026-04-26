import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../assets/styles/miCuenta.css'

const TABS = ["reservas", "favoritos", "perfil"];

export default function MiCuenta() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("reservas");
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nombre: user?.nombre || "",
    email: user?.email || "",
  });
  const [saveMsg, setSaveMsg] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }   

  const reservas = user.reservas || [];
  const favoritos = user.favoritos || [];

  function handleSaveProfile(e) {
    e.preventDefault();
    updateProfile({ nombre: profileForm.nombre });
    setSaveMsg("¡Perfil actualizado!");
    setEditMode(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  const estadoColor = {
    confirmada: "#4caf50",
    pendiente: "#ff9f22",
    cancelada: "#ff3300",
  };

  return (
    <div className="mi-cuenta-page">
      {/* Header */}
      <div className="cuenta-header">
        <div className="cuenta-header-inner">
          <div className="cuenta-avatar">
            <i className="bi bi-person-circle" />
          </div>
          <div className="cuenta-info">
            <h2 className="cuenta-nombre">{user.nombre}</h2>
            <span className="cuenta-email">
              <i className="bi bi-envelope me-1" />
              {user.email}
            </span>
            <span className="cuenta-badge">
              <i className="bi bi-star-fill me-1" />
              Usuario
            </span>
          </div>
          <div className="cuenta-header-actions">
            <Link to="/" className="btn-cuenta-outline">
              <i className="bi bi-house me-1" />
              Inicio
            </Link>
            <button
              className="btn-cuenta-logout"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              <i className="bi bi-box-arrow-right me-1" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="cuenta-stats">
        <div className="stat-card">
          <i className="bi bi-calendar-check stat-icon" />
          <span className="stat-num">{reservas.length}</span>
          <span className="stat-label">Reservas</span>
        </div>
        <div className="stat-card">
          <i className="bi bi-heart stat-icon" />
          <span className="stat-num">{favoritos.length}</span>
          <span className="stat-label">Favoritos</span>
        </div>
        <div className="stat-card">
          <i className="bi bi-clock-history stat-icon" />
          <span className="stat-num">
            {reservas.filter((r) => r.estado === "confirmada").length}
          </span>
          <span className="stat-label">Confirmadas</span>
        </div>
        <div className="stat-card">
          <i className="bi bi-person-check stat-icon" />
          <span className="stat-num">
            {new Date(user.fechaRegistro).getFullYear()}
          </span>
          <span className="stat-label">Miembro desde</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="cuenta-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`cuenta-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "reservas" && <i className="bi bi-calendar2-check me-2" />}
            {t === "favoritos" && <i className="bi bi-heart me-2" />}
            {t === "perfil" && <i className="bi bi-person-gear me-2" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="cuenta-content content-center">
        {/* ── RESERVAS ──────────────────────────────────────── */}
        {tab === "reservas" && (
          <div>
            <div className="cuenta-section-header">
              <h3>Mis reservas</h3>
              <Link to="/catalog" className="btn-nueva-reserva">
                <i className="bi bi-plus-circle me-1" />
                Nueva reserva
              </Link>
            </div>
            {reservas.length === 0 ? (
              <div className="cuenta-empty">
                <i className="bi bi-calendar-x" />
                <p>Aún no tienes reservas.</p>
                <Link to="/catalog" className="btn-nueva-reserva">
                  Explorar restaurantes
                </Link>
              </div>
            ) : (
              <div className="reservas-list">
                {reservas.map((r) => (
                  <div key={r.id} className="reserva-card">
                    <div className="reserva-restaurante">
                      <i className="bi bi-shop me-2" />
                      <strong>{r.restaurante}</strong>
                    </div>
                    <div className="reserva-details">
                      <span>
                        <i className="bi bi-calendar3 me-1" />
                        {r.fecha}
                      </span>
                      <span>
                        <i className="bi bi-clock me-1" />
                        {r.hora}
                      </span>
                      <span>
                        <i className="bi bi-people me-1" />
                        {r.personas} persona{r.personas > 1 ? "s" : ""}
                      </span>
                    </div>
                    <span
                      className="reserva-estado"
                      style={{ color: estadoColor[r.estado] }}
                    >
                      <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.5rem" }} />
                      {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── FAVORITOS ─────────────────────────────────────── */}
        {tab === "favoritos" && (
          <div>
            <div className="cuenta-section-header">
              <h3>Mis restaurantes favoritos</h3>
            </div>
            {favoritos.length === 0 ? (
              <div className="cuenta-empty">
                <i className="bi bi-heart" />
                <p>Aún no tienes favoritos guardados.</p>
              </div>
            ) : (
              <div className="favoritos-grid">
                {favoritos.map((fav) => (
                  <div key={fav} className="fav-card">
                    <i className="bi bi-shop fav-icon" />
                    <span className="fav-nombre">{fav}</span>
                    <Link to="/catalog" className="fav-reserva-btn">
                      Reservar
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PERFIL ────────────────────────────────────────── */}
        {tab === "perfil" && (
          <div className="perfil-section">
            <div className="cuenta-section-header">
              <h3>Mi perfil</h3>
              {!editMode && (
                <button
                  className="btn-nueva-reserva"
                  onClick={() => setEditMode(true)}
                >
                  <i className="bi bi-pencil me-1" />
                  Editar
                </button>
              )}
            </div>

            {saveMsg && (
              <div className="auth-success-box mb-3">
                <i className="bi bi-check-circle me-2" />
                {saveMsg}
              </div>
            )}

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="perfil-form">
                <div className="auth-field">
                  <label className="auth-label">Nombre</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-person auth-input-icon" />
                    <input
                      type="text"
                      className="auth-input"
                      value={profileForm.nombre}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, nombre: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-envelope auth-input-icon" />
                    <input
                      type="email"
                      className="auth-input"
                      value={profileForm.email}
                      disabled
                    />
                  </div>
                  <small className="text-muted">El email no se puede cambiar.</small>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="auth-submit-btn" style={{ flex: 1 }}>
                    <i className="bi bi-check-lg me-1" /> Guardar
                  </button>
                  <button
                    type="button"
                    className="btn-cuenta-outline"
                    onClick={() => setEditMode(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="perfil-info-list">
                <div className="perfil-info-row">
                  <span className="perfil-info-label">
                    <i className="bi bi-person me-2" />
                    Nombre
                  </span>
                  <span className="perfil-info-value">{user.nombre}</span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label">
                    <i className="bi bi-envelope me-2" />
                    Email
                  </span>
                  <span className="perfil-info-value">{user.email}</span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label">
                    <i className="bi bi-shield me-2" />
                    Rol
                  </span>
                  <span className="perfil-info-value">
                    <span className="cuenta-badge">Usuario</span>
                  </span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label">
                    <i className="bi bi-calendar me-2" />
                    Miembro desde
                  </span>
                  <span className="perfil-info-value">{user.fechaRegistro}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}