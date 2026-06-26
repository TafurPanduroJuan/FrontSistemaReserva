import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import '../assets/styles/myAccount.css';


const TABS = ["reservas", "favoritos", "comentarios", "perfil"];

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

export default function MyAccount() {
  const { user, token, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("reservas");
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nombre: user?.nombre || "",
    email: user?.email || "",
    telefono: user?.telefono || "",
  });
  const [saveMsg, setSaveMsg] = useState("");

  // ── Reservas ──────────────────────────────────────────────────────────────
  const [reservasUsuario, setReservasUsuario] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(false);
  const [modalCancel, setModalCancel] = useState(null);

  // ── Comentarios del usuario ───────────────────────────────────────────────
  const [comentariosUsuario, setComentariosUsuario] = useState([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [expandidoComentario, setExpandidoComentario] = useState(null);
  const [filtroComentarios, setFiltroComentarios] = useState("todos"); // todos | respondidos

  if (!user) {
    navigate("/login");
    return null;
  }

  // ── Cargar reservas ───────────────────────────────────────────────────────
  const cargarReservas = async () => {
    if (!token) return;
    setCargandoReservas(true);
    try {
      const data = await apiFetch("/api/reservations/me", {}, token);
      setReservasUsuario(data);
    } catch (err) {
      console.error("Error cargando reservas:", err);
    } finally {
      setCargandoReservas(false);
    }
  };

  // ── Cargar comentarios del usuario ─────────────────────────────────────────
  const cargarComentarios = async () => {
    if (!token) return;
    setCargandoComentarios(true);
    try {
      const data = await apiFetch("/api/comments/me", {}, token);
      const normalizados = data.map((c) => ({
        ...c,
        restaurante: c.restaurant?.nombre || null,
      }));
      setComentariosUsuario(normalizados);
    } catch (err) {
      console.error("Error cargando comentarios:", err);
    } finally {
      setCargandoComentarios(false);
    }
  };

  useEffect(() => { cargarReservas(); }, [token]);
  useEffect(() => { cargarComentarios(); }, [token]);

  const reservas = reservasUsuario;
  const favoritos = user.favoritos || [];

  // Comentarios filtrados
  const comentariosFiltrados = filtroComentarios === "respondidos"
    ? comentariosUsuario.filter((c) => !!c.respuestaRestaurante)
    : comentariosUsuario;

  const cantidadRespondidos = comentariosUsuario.filter((c) => !!c.respuestaRestaurante).length;

  // Notificaciones: reservas canceladas por el restaurante que aún no se han "visto"
  const reservasCanceladas = reservasUsuario.filter(
    (r) => r.estado === "cancelada" && r.motivoCancelacion
  );

  // ── Guardar perfil ─────────────────────────────────────────────────────────
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      nombre: profileForm.nombre,
      telefono: profileForm.telefono ? parseInt(profileForm.telefono) : null,
    });
    if (result.ok) {
      setSaveMsg("Perfil actualizado correctamente");
      setEditMode(false);
      setTimeout(() => setSaveMsg(""), 3000);
    } else {
      setSaveMsg("Error al guardar el perfil");
    }
  };

  // ── Cancelar reserva ───────────────────────────────────────────────────────
  function handleSolicitarCancel(reserva) {
    if (!puedeCancel(reserva)) return;
    setModalCancel(reserva);
  }

  const handleConfirmarCancel = async () => {
    if (!modalCancel) return;
    try {
      await apiFetch(
        `/api/reservations/${modalCancel.id}/status`,
        { method: "PATCH", body: JSON.stringify({ estado: "cancelada_cliente" }) },
        token
      );
      setReservasUsuario((prev) =>
        prev.map((r) =>
          r.id === modalCancel.id ? { ...r, estado: "cancelada_cliente" } : r
        )
      );
      setModalCancel(null);
    } catch (err) {
      alert("No se pudo cancelar: " + err.message);
      setModalCancel(null);
    }
  };

  const tipoComConfig = {
    comentario:  { label: "Comentario",  icon: "bi-chat-left-text",      color: "#3b82f6", bg: "#eff6ff" },
    reclamo:     { label: "Reclamo",     icon: "bi-exclamation-triangle", color: "#ef4444", bg: "#fef2f2" },
    experiencia: { label: "Experiencia", icon: "bi-star-fill",            color: "#f59e0b", bg: "#fffbeb" },
  };

  return (
    <div className="mi-cuenta-page">

      <style>{`
        .notif-banner { background: linear-gradient(135deg, #fff1f1, #ffe4e4); border: 1.5px solid #fecaca; border-radius: 14px; padding: 14px 18px; margin: 0 auto 20px; max-width: 900px; }
        .notif-banner-title { font-weight: 800; color: #991b1b; font-size: 0.9rem; margin-bottom: 8px; }
        .notif-item { background: white; border-radius: 10px; padding: 10px 14px; margin-bottom: 8px; border-left: 3px solid #dc3545; font-size: 0.83rem; }
        .notif-item:last-child { margin-bottom: 0; }
        .notif-rest { font-weight: 700; color: #1a1a2e; }
        .notif-motivo { color: #666; margin-top: 3px; }
        .com-card { background: white; border-radius: 14px; border: 1px solid #eee; border-left: 4px solid #3b82f6; padding: 18px; margin-bottom: 12px; cursor: pointer; transition: box-shadow 0.2s; }
        .com-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); }
        .com-asunto { font-weight: 700; color: #1a1a2e; font-size: 0.95rem; }
        .com-meta { font-size: 0.78rem; color: #aaa; margin-top: 3px; }
        .com-badge-resp { background: #eff6ff; color: #3b82f6; border: 1px solid #bfdbfe; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; }
        .com-mensaje { font-size: 0.85rem; color: #555; line-height: 1.6; margin-top: 12px; background: #f8f9fa; border-radius: 8px; padding: 10px 14px; }
        .com-respuesta-box { margin-top: 10px; background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 8px; padding: 10px 14px; }
        .com-respuesta-header { font-size: 0.72rem; font-weight: 800; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .com-respuesta-text { font-size: 0.85rem; color: #1e40af; line-height: 1.5; }
        .com-filtros { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
        .com-filtro-btn { padding: 6px 14px; border-radius: 20px; border: 2px solid #e5e7eb; background: white; color: #666; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .com-filtro-btn.active { border-color: #3b82f6; background: #3b82f6; color: white; }
        .com-empty { text-align: center; padding: 50px 20px; color: #aaa; }
        .com-empty i { font-size: 2.5rem; display: block; margin-bottom: 10px; }
      `}</style>

      {/* ── Modal de cancelación ── */}
      {modalCancel && (
        <div className="cancel-modal-overlay" onClick={() => setModalCancel(null)}>
          <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-icon">
              <i className="bi bi-exclamation-triangle-fill" />
            </div>
            <h4 className="cancel-modal-title">¿Cancelar esta reserva?</h4>
            <p className="cancel-modal-body">
              Estás a punto de cancelar tu reserva en{" "}
              <strong>{modalCancel.restaurante || modalCancel.restaurant?.nombre}</strong> el{" "}
              <strong>{modalCancel.fecha}</strong> a las{" "}
              <strong>{modalCancel.hora}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="cancel-modal-actions">
              <button className="cancel-modal-btn-no" onClick={() => setModalCancel(null)}>
                Mantener reserva
              </button>
              <button className="cancel-modal-btn-yes" onClick={handleConfirmarCancel}>
                <i className="bi bi-x-circle me-1" />
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Banner de notificaciones: reservas canceladas por el restaurante ── */}
      {reservasCanceladas.length > 0 && (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 0" }}>
          <div className="notif-banner">
            <div className="notif-banner-title">
              <i className="bi bi-bell-fill me-2" />
              {reservasCanceladas.length === 1
                ? "Una de tus reservas fue cancelada por el restaurante"
                : `${reservasCanceladas.length} de tus reservas fueron canceladas por el restaurante`}
            </div>
            {reservasCanceladas.map((r) => (
              <div className="notif-item" key={r.id}>
                <div className="notif-rest">
                  <i className="bi bi-shop me-2" />
                  {r.restaurant?.nombre || r.restaurante} · {r.fecha} a las {r.hora}
                </div>
                <div className="notif-motivo">
                  <i className="bi bi-info-circle me-1" />
                  Motivo: {r.motivoCancelacion}
                </div>
              </div>
            ))}
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
              onClick={() => { logout(); navigate("/login"); }}
            >
              <i className="bi bi-box-arrow-right me-1" />
              Salir
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="cuenta-stats">
        <div className="stat-card">
          <i className="bi bi-calendar-check stat-icon" />
          <span className="stat-num">{reservas.filter((r) => r.estado === "confirmada").length}</span>
          <span className="stat-label">Confirmadas</span>
        </div>
        <div className="stat-card">
          <i className="bi bi-clock stat-icon" />
          <span className="stat-num">{reservas.filter((r) => r.estado === "pendiente").length}</span>
          <span className="stat-label">Pendientes</span>
        </div>
        <div className="stat-card">
          <i className="bi bi-chat-dots stat-icon" />
          <span className="stat-num">{cantidadRespondidos}</span>
          <span className="stat-label">Respuestas</span>
        </div>
        <div className="stat-card">
          <i className="bi bi-person-check stat-icon" />
          <span className="stat-num">
            {user.fechaRegistro ? new Date(user.fechaRegistro).getFullYear() : "—"}
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
            {t === "comentarios" && (
              <>
                <i className="bi bi-chat-left-dots me-2" />
                {cantidadRespondidos > 0 && (
                  <span style={{
                    background: "#3b82f6", color: "white", borderRadius: "50%",
                    width: 18, height: 18, fontSize: "0.65rem", fontWeight: 800,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    marginRight: 4
                  }}>
                    {cantidadRespondidos}
                  </span>
                )}
              </>
            )}
            {t === "perfil" && <i className="bi bi-person-gear me-2" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="cuenta-content content-center">

        {/* ── RESERVAS ── */}
        {tab === "reservas" && (
          <div>
            <div className="cuenta-section-header">
              <h3>Mis reservas</h3>
              <Link to="/catalog" className="btn-nueva-reserva">
                <i className="bi bi-plus-circle me-1" />
                Nueva reserva
              </Link>
            </div>

            {cargandoReservas ? (
              <div className="text-center py-4">
                <div className="spinner-border text-warning" role="status" />
                <p className="mt-2 text-muted">Cargando reservas...</p>
              </div>
            ) : reservas.length === 0 ? (
              <div className="cuenta-empty">
                <i className="bi bi-calendar-x" />
                <p>Aún no tienes reservas.</p>
                <Link to="/catalog" className="btn-nueva-reserva">Explorar restaurantes</Link>
              </div>
            ) : (
              <div className="reservas-list">
                {reservas.map((r) => {
                  const cancelable = r.estado === "confirmada" && puedeCancel(r);
                  const estadoConfig = {
                    pendiente:         { color: "#f59e0b", icon: "bi-clock",            label: "Pendiente" },
                    confirmada:        { color: "#22c55e", icon: "bi-check-circle-fill", label: "Confirmada" },
                    cancelada:         { color: "#dc3545", icon: "bi-x-circle-fill",     label: "Cancelada por el restaurante" },
                    cancelada_cliente: { color: "#7c3aed", icon: "bi-person-x-fill",     label: "Cancelada por ti" },
                  }[r.estado] || { color: "#888", icon: "bi-question-circle", label: r.estado };

                  return (
                    <div key={r.id} className="reserva-card" style={{ borderLeft: `4px solid ${estadoConfig.color}` }}>
                      <div className="reserva-restaurante">
                        <i className="bi bi-shop me-2" />
                        <strong>{r.restaurant?.nombre || r.restaurante}</strong>
                      </div>
                      <div className="reserva-details">
                        <span><i className="bi bi-calendar3 me-1" />{r.fecha}</span>
                        <span><i className="bi bi-clock me-1" />{r.hora}</span>
                        <span><i className="bi bi-people me-1" />{r.personas} persona{r.personas > 1 ? "s" : ""}</span>
                        {r.mesaNumero && (
                          <span><i className="bi bi-grid me-1" />Mesa {r.mesaNumero}{r.zona ? ` · ${r.zona}` : ""}</span>
                        )}
                      </div>
                      <div className="reserva-card-right">
                        <span className="reserva-estado" style={{ color: estadoConfig.color }}>
                          <i className={`bi ${estadoConfig.icon} me-1`} style={{ fontSize: "0.85rem" }} />
                          {estadoConfig.label}
                        </span>
                        {/* Motivo de cancelación del restaurante */}
                        {r.estado === "cancelada" && r.motivoCancelacion && (
                          <div style={{
                            background: "#fff1f1", border: "1px solid #fecaca", borderRadius: 8,
                            padding: "7px 10px", fontSize: "0.78rem", color: "#991b1b", marginTop: 6
                          }}>
                            <i className="bi bi-info-circle me-1" />
                            <strong>Motivo:</strong> {r.motivoCancelacion}
                          </div>
                        )}
                        {r.estado === "confirmada" && (
                          <button
                            className={`btn-cancelar-reserva ${!cancelable ? "disabled" : ""}`}
                            onClick={() => cancelable && handleSolicitarCancel(r)}
                            title={cancelable ? "Cancelar esta reserva" : "Ya no es posible cancelar (menos de 2 horas para la reserva)"}
                            disabled={!cancelable}
                          >
                            <i className="bi bi-x-circle me-1" />
                            {cancelable ? "Cancelar" : "No cancelable"}
                          </button>
                        )}
                        {r.estado === "confirmada" && !cancelable && (
                          <span className="reserva-no-cancel-hint">
                            <i className="bi bi-lock-fill me-1" />Menos de 2h para la reserva
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

        {/* ── FAVORITOS ── */}
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
                    <Link to="/catalog" className="fav-reserva-btn">Reservar</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── COMENTARIOS ── */}
        {tab === "comentarios" && (
          <div>
            <div className="cuenta-section-header">
              <h3>Mis comentarios</h3>
              <Link to="/form" className="btn-nueva-reserva">
                <i className="bi bi-plus-circle me-1" />
                Nuevo comentario
              </Link>
            </div>

            <div className="com-filtros">
              <button
                className={`com-filtro-btn ${filtroComentarios === "todos" ? "active" : ""}`}
                onClick={() => setFiltroComentarios("todos")}
              >
                Todos ({comentariosUsuario.length})
              </button>
              <button
                className={`com-filtro-btn ${filtroComentarios === "respondidos" ? "active" : ""}`}
                onClick={() => setFiltroComentarios("respondidos")}
              >
                <i className="bi bi-reply-fill me-1" />
                Con respuesta ({cantidadRespondidos})
              </button>
            </div>

            {cargandoComentarios ? (
              <div className="text-center py-4">
                <div className="spinner-border" style={{ color: "#3b82f6" }} role="status" />
                <p className="mt-2 text-muted">Cargando comentarios...</p>
              </div>
            ) : comentariosFiltrados.length === 0 ? (
              <div className="com-empty">
                {filtroComentarios === "respondidos" ? (
                  <>
                    <i className="bi bi-reply" />
                    <p>Aún no tienes comentarios con respuesta del restaurante.</p>
                    <small className="text-muted">Cuando un restaurante responda tu comentario, aparecerá aquí.</small>
                  </>
                ) : (
                  <>
                    <i className="bi bi-chat-left" />
                    <p>Aún no has enviado comentarios.</p>
                    <Link to="/form" className="btn-nueva-reserva mt-2">Enviar un comentario</Link>
                  </>
                )}
              </div>
            ) : (
              comentariosFiltrados.map((c) => {
                const cfg = tipoComConfig[c.tipo] || tipoComConfig.comentario;
                const isOpen = expandidoComentario === c.id;
                const tieneRespuesta = !!c.respuestaRestaurante;

                return (
                  <div
                    key={c.id}
                    className="com-card"
                    style={{ borderLeftColor: cfg.color }}
                    onClick={() => setExpandidoComentario(isOpen ? null : c.id)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.73rem", fontWeight: 700 }}>
                          <i className={`bi ${cfg.icon} me-1`} />{cfg.label}
                        </span>
                        {tieneRespuesta && (
                          <span className="com-badge-resp">
                            <i className="bi bi-reply-fill me-1" />Respondido
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{c.fecha}</span>
                    </div>

                    <div className="com-asunto mt-2">{c.asunto}</div>
                    <div className="com-meta">
                      <i className="bi bi-shop me-1" />{c.restaurante || "—"}
                      {c.calificacion > 0 && (
                        <span style={{ marginLeft: 8, color: "#f59e0b" }}>
                          {"★".repeat(c.calificacion)}{"☆".repeat(5 - c.calificacion)}
                        </span>
                      )}
                    </div>

                    {isOpen && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <div className="com-mensaje">{c.mensaje}</div>

                        {tieneRespuesta && (
                          <div className="com-respuesta-box">
                            <div className="com-respuesta-header">
                              <i className="bi bi-reply-fill me-1" />
                              Respuesta del restaurante · {c.fechaRespuesta}
                            </div>
                            <div className="com-respuesta-text">{c.respuestaRestaurante}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── PERFIL ── */}
        {tab === "perfil" && (
          <div className="perfil-section">
            <div className="cuenta-section-header">
              <h3>Mi perfil</h3>
              {!editMode && (
                <button className="btn-nueva-reserva" onClick={() => setEditMode(true)}>
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
                      onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })}
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Email</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-envelope auth-input-icon" />
                    <input type="email" className="auth-input" value={profileForm.email} disabled />
                  </div>
                  <small className="text-muted">El email no se puede cambiar.</small>
                </div>
                <div className="auth-field">
                  <label className="auth-label">Teléfono</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-telephone auth-input-icon" />
                    <input
                      type="tel"
                      className="auth-input"
                      placeholder="987654321"
                      maxLength={9}
                      value={profileForm.telefono}
                      onChange={(e) => setProfileForm({ ...profileForm, telefono: e.target.value })}
                    />
                  </div>
                  <small className="text-muted">9 dígitos exactos.</small>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button type="submit" className="auth-submit-btn" style={{ flex: 1 }}>
                    <i className="bi bi-check-lg me-1" /> Guardar
                  </button>
                  <button type="button" className="btn-cuenta-outline" onClick={() => setEditMode(false)}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="perfil-info-list">
                <div className="perfil-info-row">
                  <span className="perfil-info-label"><i className="bi bi-person me-2" />Nombre</span>
                  <span className="perfil-info-value">{user.nombre}</span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label"><i className="bi bi-envelope me-2" />Email</span>
                  <span className="perfil-info-value">{user.email}</span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label"><i className="bi bi-shield me-2" />Rol</span>
                  <span className="perfil-info-value"><span className="cuenta-badge">Usuario</span></span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label"><i className="bi bi-telephone me-2" />Teléfono</span>
                  <span className="perfil-info-value">{user.telefono || "No registrado"}</span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label"><i className="bi bi-calendar me-2" />Miembro desde</span>
                  <span className="perfil-info-value">{user.fechaRegistro}</span>
                </div>
                <div className="perfil-info-row">
                  <span className="perfil-info-label"><i className="bi bi-chat-dots me-2" />Comentarios</span>
                  <span className="perfil-info-value">{comentariosUsuario.length} enviado{comentariosUsuario.length !== 1 ? "s" : ""}</span>
                </div>
                {cantidadRespondidos > 0 && (
                  <div className="perfil-info-row">
                    <span className="perfil-info-label"><i className="bi bi-reply me-2" />Respondidos</span>
                    <span className="perfil-info-value" style={{ color: "#3b82f6", fontWeight: 700 }}>
                      {cantidadRespondidos} respuesta{cantidadRespondidos !== 1 ? "s" : ""} del restaurante
                      <button
                        style={{ marginLeft: 8, background: "none", border: "none", color: "#3b82f6", fontSize: "0.78rem", cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => { setTab("comentarios"); setFiltroComentarios("respondidos"); }}
                      >
                        Ver
                      </button>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}