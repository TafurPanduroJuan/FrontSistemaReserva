import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import '../assets/styles/miCuenta.css'

const TABS = ["reservas", "favoritos", "perfil"];

// Lee reservas del maestro filtradas por email y estado confirmada
function loadReservasConfirmadas(email) {
  try {
    const raw = localStorage.getItem("comanda_reservas_maestro");
    const todas = raw ? JSON.parse(raw) : [];
    return todas.filter(
      (r) => r.email === email && r.estado === "confirmada"
    );
  } catch {
    return [];
  }
}

// Devuelve true si todavía se puede cancelar (faltan más de 2h para la reserva)
function puedeCancel(reserva) {
  try {
    const ahora = new Date();
    const fechaHoraReserva = new Date(`${reserva.fecha}T${reserva.hora}:00`);
    const diffMs = fechaHoraReserva - ahora;
    const diffHoras = diffMs / (1000 * 60 * 60);
    return diffHoras > 2;
  } catch {
    return false;
  }
}

// Cancela la reserva en localStorage y libera la mesa
function cancelarReservaEnStorage(reservaId) {
  try {
    const raw = localStorage.getItem("comanda_reservas_maestro");
    const todas = raw ? JSON.parse(raw) : [];
    const actualizadas = todas.map((r) =>
      r.id === reservaId ? { ...r, estado: "cancelada_cliente" } : r
    );
    localStorage.setItem("comanda_reservas_maestro", JSON.stringify(actualizadas));

    // Liberar la mesa en comanda_mesas_v2
    const reserva = todas.find((r) => r.id === reservaId);
    if (reserva?.restaurante && reserva?.mesa) {
      const mesasRaw = localStorage.getItem("comanda_mesas_v2");
      const mesasData = mesasRaw ? JSON.parse(mesasRaw) : {};
      const mesasRest = mesasData[reserva.restaurante] || [];
      const mesasActualizadas = mesasRest.map((m) =>
        m.id === reserva.mesa ? { ...m, estado: "disponible" } : m
      );
      mesasData[reserva.restaurante] = mesasActualizadas;
      localStorage.setItem("comanda_mesas_v2", JSON.stringify(mesasData));
    }
  } catch {}
}

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
  const [reservasConfirmadas, setReservasConfirmadas] = useState([]);

  // Modal de confirmación de cancelación
  const [modalCancel, setModalCancel] = useState(null); // null | reservaObj

  useEffect(() => {
    if (user?.email) {
      setReservasConfirmadas(loadReservasConfirmadas(user.email));
    }
  }, [user]);

  // Recarga al volver a la pestaña de reservas
  useEffect(() => {
    if (tab === "reservas" && user?.email) {
      setReservasConfirmadas(loadReservasConfirmadas(user.email));
    }
  }, [tab]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const reservas = reservasConfirmadas;
  const favoritos = user.favoritos || [];

  function handleSaveProfile(e) {
    e.preventDefault();
    updateProfile({ nombre: profileForm.nombre });
    setSaveMsg("¡Perfil actualizado!");
    setEditMode(false);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function handleSolicitarCancel(reserva) {
    if (!puedeCancel(reserva)) return; // botón deshabilitado pero por seguridad
    setModalCancel(reserva);
  }

  function handleConfirmarCancel() {
    if (!modalCancel) return;
    cancelarReservaEnStorage(modalCancel.id);
    setModalCancel(null);
    setReservasConfirmadas(loadReservasConfirmadas(user.email));
  }

  return (
    <div className="mi-cuenta-page">

      {/* ── Modal de confirmación de cancelación ── */}
      {modalCancel && (
        <div className="cancel-modal-overlay" onClick={() => setModalCancel(null)}>
          <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-icon">
              <i className="bi bi-exclamation-triangle-fill" />
            </div>
            <h4 className="cancel-modal-title">¿Cancelar esta reserva?</h4>
            <p className="cancel-modal-body">
              Estás a punto de cancelar tu reserva en <strong>{modalCancel.restaurante}</strong> el{" "}
              <strong>{modalCancel.fecha}</strong> a las <strong>{modalCancel.hora}</strong>.
              Esta acción no se puede deshacer.
            </p>
            <div className="cancel-modal-actions">
              <button
                className="cancel-modal-btn-no"
                onClick={() => setModalCancel(null)}
              >
                Mantener reserva
              </button>
              <button
                className="cancel-modal-btn-yes"
                onClick={handleConfirmarCancel}
              >
                <i className="bi bi-x-circle me-1" />
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
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
          <span className="stat-label">Confirmadas</span>
        </div>
        <div className="stat-card">
          <i className="bi bi-heart stat-icon" />
          <span className="stat-num">{favoritos.length}</span>
          <span className="stat-label">Favoritos</span>
        </div>
        <div className="stat-card">
          <i className="bi bi-clock-history stat-icon" />
          <span className="stat-num">
            {reservas.length}
          </span>
          <span className="stat-label">Reservas</span>
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
                <p>Aún no tienes reservas confirmadas.</p>
                <Link to="/catalog" className="btn-nueva-reserva">
                  Explorar restaurantes
                </Link>
              </div>
            ) : (
              <div className="reservas-list">
                {reservas.map((r) => {
                  const cancelable = puedeCancel(r);
                  return (
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
                        {r.mesa && (
                          <span>
                            <i className="bi bi-grid me-1" />
                            Mesa {r.mesa}{r.zona ? ` · ${r.zona}` : ""}
                          </span>
                        )}
                      </div>
                      <div className="reserva-card-right">
                        <span className="reserva-estado" style={{ color: "#4caf50" }}>
                          <i className="bi bi-circle-fill me-1" style={{ fontSize: "0.5rem" }} />
                          Confirmada
                        </span>
                        <button
                          className={`btn-cancelar-reserva ${!cancelable ? "disabled" : ""}`}
                          onClick={() => cancelable && handleSolicitarCancel(r)}
                          title={
                            cancelable
                              ? "Cancelar esta reserva"
                              : "Ya no es posible cancelar (menos de 2 horas para la reserva)"
                          }
                          disabled={!cancelable}
                        >
                          <i className="bi bi-x-circle me-1" />
                          {cancelable ? "Cancelar" : "No cancelable"}
                        </button>
                        {!cancelable && (
                          <span className="reserva-no-cancel-hint">
                            <i className="bi bi-lock-fill me-1" />
                            Menos de 2h para la reserva
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
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