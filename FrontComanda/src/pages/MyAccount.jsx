import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import '../assets/styles/myAccount.css';

// Devuelve true si todavía se puede cancelar (faltan más de 2h)
function puedeCancel(reserva) {
  try {
    const ahora = new Date();
    const fechaHoraReserva = new Date(`${reserva.fecha}T${reserva.hora}:00`);
    const diffMs = fechaHoraReserva - ahora;
    return diffMs / (1000 * 60 * 60) > 2;
  } catch { return false; }
}

// Formatea "2024-01-15" → "Enero 2024"
function formatearFechaRegistro(fechaStr) {
  if (!fechaStr) return null;
  try {
    const fecha = new Date(fechaStr + "T12:00:00");
    return fecha.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  } catch { return fechaStr; }
}

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function MyAccount() {
  const { user, token, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("reservas");
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nombre:      user?.nombre      || "",
    email:       user?.email       || "",
    telefono:    user?.telefono    || "",
    googleEmail: user?.googleEmail || "",
  });
  const [saveMsg, setSaveMsg] = useState("");

  // ── Reservas ──────────────────────────────────────────────────────────────
  const [reservasUsuario, setReservasUsuario] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(false);
  const [modalCancel, setModalCancel] = useState(null);
  const [motivoCancelCliente, setMotivoCancelCliente] = useState("");

  // ── Comentarios ───────────────────────────────────────────────────────────
  const [comentariosUsuario, setComentariosUsuario] = useState([]);
  const [cargandoComentarios, setCargandoComentarios] = useState(false);
  const [expandidoComentario, setExpandidoComentario] = useState(null);
  const [filtroComentarios, setFiltroComentarios] = useState("todos");

  if (!user) { navigate("/login"); return null; }

  const cargarReservas = async () => {
    if (!token) return;
    setCargandoReservas(true);
    try {
      const data = await apiFetch("/api/reservations/me", {}, token);
      setReservasUsuario(data);
    } catch (err) { console.error("Error cargando reservas:", err); }
    finally { setCargandoReservas(false); }
  };

  const cargarComentarios = async () => {
    if (!token) return;
    setCargandoComentarios(true);
    try {
      const data = await apiFetch("/api/comments/me", {}, token);
      setComentariosUsuario(data.map((c) => ({
        ...c, restaurante: c.restaurant?.nombre || null,
      })));
    } catch (err) { console.error("Error cargando comentarios:", err); }
    finally { setCargandoComentarios(false); }
  };

  useEffect(() => { cargarReservas(); }, [token]);
  useEffect(() => { cargarComentarios(); }, [token]);

  const reservas = reservasUsuario;
  const favoritos = user.favoritos || [];
  const comentariosFiltrados = filtroComentarios === "respondidos"
    ? comentariosUsuario.filter((c) => !!c.respuestaRestaurante)
    : comentariosUsuario;
  const cantidadRespondidos = comentariosUsuario.filter((c) => !!c.respuestaRestaurante).length;
  const reservasCanceladas = reservasUsuario.filter((r) => r.estado === "cancelada" && r.motivoCancelacion);

  // Stats
  const totalReservas  = reservas.length;
  const totalFavoritos = favoritos.length;
  const totalResenas   = comentariosUsuario.length;

  // Fecha miembro
  const fechaMiembro = formatearFechaRegistro(user.fechaRegistro);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      nombre:      profileForm.nombre,
      telefono:    profileForm.telefono ? parseInt(profileForm.telefono) : null,
      googleEmail: profileForm.googleEmail || "",
    });
    if (result.ok) {
      setSaveMsg("Perfil actualizado correctamente");
      setEditMode(false);
      setTimeout(() => setSaveMsg(""), 3000);
    } else { setSaveMsg("Error al guardar el perfil"); }
  };

  const handleConfirmarCancel = async () => {
    if (!modalCancel) return;
    try {
      const body = { estado: "cancelada_cliente" };
      if (motivoCancelCliente.trim()) body.motivoCancelacion = motivoCancelCliente.trim();
      await apiFetch(`/api/reservations/${modalCancel.id}/status`,
        { method: "PATCH", body: JSON.stringify(body) }, token);
      setReservasUsuario((prev) =>
        prev.map((r) => r.id === modalCancel.id
          ? { ...r, estado: "cancelada_cliente", motivoCancelacion: motivoCancelCliente.trim() || null }
          : r)
      );
      setModalCancel(null);
    } catch (err) { alert("No se pudo cancelar: " + err.message); setModalCancel(null); }
  };

  const tipoComConfig = {
    comentario:  { label: "Comentario",  icon: "bi-chat-left-text",      color: "#3b82f6", bg: "#eff6ff" },
    reclamo:     { label: "Reclamo",     icon: "bi-exclamation-triangle", color: "#ef4444", bg: "#fef2f2" },
    experiencia: { label: "Experiencia", icon: "bi-star-fill",            color: "#f59e0b", bg: "#fffbeb" },
  };

  const estadoConfig = {
    pendiente:        { color: "#f59e0b", icon: "bi-clock",            label: "Pendiente",                  cls: "pendiente" },
    confirmada:       { color: "#22c55e", icon: "bi-check-circle-fill", label: "Confirmada",                cls: "confirmada" },
    cancelada:        { color: "#dc3545", icon: "bi-x-circle-fill",     label: "Cancelada por el restaurante", cls: "cancelada" },
    cancelada_cliente:{ color: "#7c3aed", icon: "bi-person-x-fill",     label: "Cancelada por ti",          cls: "cancelada_cliente" },
  };

  return (
    <div className="mi-cuenta-page">

      {/* ── Modal cancelación ── */}
      {modalCancel && (
        <div className="cancel-modal-overlay" onClick={() => setModalCancel(null)}>
          <div className="cancel-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-icon"><i className="bi bi-exclamation-triangle-fill" /></div>
            <h4 className="cancel-modal-title">¿Cancelar esta reserva?</h4>
            <p className="cancel-modal-body">
              Estás a punto de cancelar tu reserva en{" "}
              <strong>{modalCancel.restaurante || modalCancel.restaurant?.nombre}</strong> el{" "}
              <strong>{modalCancel.fecha}</strong> a las <strong>{modalCancel.hora}</strong>.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#555", marginBottom: 6 }}>
                Motivo <span style={{ fontWeight: 400, color: "#aaa" }}>(opcional)</span>
              </label>
              <textarea
                style={{ width: "100%", border: "1.5px solid #e0d8d0", borderRadius: 10, padding: "10px 13px", fontSize: "0.85rem", resize: "vertical", minHeight: 70, outline: "none", boxSizing: "border-box" }}
                placeholder="Ej: Surgió un imprevisto..."
                value={motivoCancelCliente}
                onChange={(e) => setMotivoCancelCliente(e.target.value)}
                maxLength={300}
              />
              <div style={{ fontSize: "0.71rem", color: "#bbb", marginTop: 2 }}>{motivoCancelCliente.length}/300</div>
            </div>
            <div className="cancel-modal-actions">
              <button className="cancel-modal-btn-no" onClick={() => setModalCancel(null)}>Mantener</button>
              <button className="cancel-modal-btn-yes" onClick={handleConfirmarCancel}>
                <i className="bi bi-x-circle me-1" />Cancelar reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="cuenta-header">
        <div className="cuenta-header-inner">
          <div className="cuenta-avatar">
            {user.avatar
              ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : <i className="bi bi-person-fill" />
            }
          </div>
          <div className="cuenta-info">
            <h2 className="cuenta-nombre">{user.nombre}</h2>
            {fechaMiembro && (
              <span className="cuenta-miembro">
                <i className="bi bi-calendar3 me-1" />Miembro desde {fechaMiembro}
              </span>
            )}
            <div className="cuenta-header-badges">
              <span className="hdr-badge"><i className="bi bi-calendar-check" />{totalReservas} Reservas</span>
              <span className="hdr-badge"><i className="bi bi-heart" />{totalFavoritos} Favoritos</span>
              <span className="hdr-badge"><i className="bi bi-chat-dots" />{totalResenas} Reseñas</span>
            </div>
          </div>
          <div className="cuenta-header-actions">
            <button className="btn-editar-perfil" onClick={() => setTab("perfil")}>
              <i className="bi bi-pencil" /> Editar Perfil
            </button>
            <button className="btn-cuenta-logout" onClick={() => { logout(); navigate("/login"); }}>
              <i className="bi bi-box-arrow-right" />
            </button>
          </div>
        </div>
      </div>

      {/* ── BODY: sidebar + main ── */}
      <div className="cuenta-body">

        {/* ── SIDEBAR ── */}
        <aside className="cuenta-sidebar">
          {/* Info personal */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Información Personal</div>
            <div className="sidebar-info-row">
              <i className="bi bi-envelope sidebar-info-icon" />
              <span style={{ fontSize: "0.82rem", wordBreak: "break-all" }}>{user.email}</span>
            </div>
            {user.telefono && (
              <div className="sidebar-info-row">
                <i className="bi bi-telephone sidebar-info-icon" />
                <span>+{user.telefono}</span>
              </div>
            )}
          </div>

          {/* Navegación */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Configuración</div>
            <button className={`sidebar-menu-item`} onClick={() => setTab("perfil")}>
              <i className="bi bi-gear sidebar-menu-icon" /> Configuración
            </button>
            <button className="sidebar-menu-item" onClick={() => setTab("comentarios")}>
              <i className="bi bi-bell sidebar-menu-icon" /> Notificaciones
            </button>
            <button className="sidebar-menu-item" style={{ color: "#888" }}>
              <i className="bi bi-credit-card sidebar-menu-icon" style={{ color: "#888" }} /> Métodos de Pago
            </button>
            <button className="sidebar-menu-item danger" onClick={() => { logout(); navigate("/login"); }}>
              <i className="bi bi-box-arrow-right sidebar-menu-icon" /> Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* ── CONTENIDO PRINCIPAL ── */}
        <main className="cuenta-main">

          {/* Notificaciones de cancelación por restaurante */}
          {reservasCanceladas.length > 0 && (
            <div className="notif-banner">
              <div className="notif-banner-title">
                <i className="bi bi-bell-fill me-2" />
                {reservasCanceladas.length === 1
                  ? "Una reserva fue cancelada por el restaurante"
                  : `${reservasCanceladas.length} reservas fueron canceladas por el restaurante`}
              </div>
              {reservasCanceladas.map((r) => (
                <div className="notif-item" key={r.id}>
                  <div className="notif-rest"><i className="bi bi-shop me-1" />{r.restaurant?.nombre || r.restaurante} · {r.fecha} a las {r.hora}</div>
                  <div className="notif-motivo"><i className="bi bi-info-circle me-1" />Motivo: {r.motivoCancelacion}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tabs ── */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "reservas",    icon: "bi-calendar2-check", label: "Próximas Reservas" },
              { id: "historial",   icon: "bi-clock-history",    label: "Historial" },
              { id: "favoritos",   icon: "bi-heart",            label: "Favoritos" },
              { id: "comentarios", icon: "bi-chat-left-dots",   label: "Reseñas" },
              { id: "perfil",      icon: "bi-person-gear",      label: "Perfil" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer",
                  fontSize: "0.82rem", fontWeight: 700,
                  background: tab === t.id ? "linear-gradient(135deg, #ff6b00, #e91e8c)" : "white",
                  color: tab === t.id ? "white" : "#666",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
                  transition: "all 0.18s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <i className={`bi ${t.icon}`} />
                {t.label}
                {t.id === "comentarios" && cantidadRespondidos > 0 && (
                  <span style={{ background: "white", color: "#3b82f6", borderRadius: "50%", width: 18, height: 18, fontSize: "0.62rem", fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    {cantidadRespondidos}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── PRÓXIMAS RESERVAS ── */}
          {tab === "reservas" && (
            <div className="seccion-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <h3 className="seccion-title" style={{ margin: 0 }}>Próximas Reservas</h3>
                <Link to="/catalog" className="btn-nueva-reserva">
                  <i className="bi bi-plus-circle" /> Nueva reserva
                </Link>
              </div>

              {cargandoReservas ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-warning" role="status" />
                  <p className="mt-2 text-muted" style={{ fontSize: "0.85rem" }}>Cargando reservas...</p>
                </div>
              ) : reservas.filter(r => ["confirmada","pendiente"].includes(r.estado)).length === 0 ? (
                <div className="cuenta-empty">
                  <i className="bi bi-calendar-x" />
                  <p>Sin próximas reservas.</p>
                  <Link to="/catalog" className="btn-nueva-reserva">Explorar restaurantes</Link>
                </div>
              ) : (
                reservas.filter(r => ["confirmada","pendiente"].includes(r.estado)).map((r) => {
                  const cfg = estadoConfig[r.estado] || { color: "#888", icon: "bi-question-circle", label: r.estado, cls: "" };
                  const cancelable = r.estado === "confirmada" && puedeCancel(r);
                  return (
                    <div key={r.id} className="reserva-card-nueva">
                      <div className="reserva-img"><i className="bi bi-shop" /></div>
                      <div className="reserva-body">
                        <div className="reserva-rest-nombre">{r.restaurant?.nombre || r.restaurante}</div>
                        <span className={`reserva-estado-badge ${cfg.cls}`}>
                          <i className={`bi ${cfg.icon}`} />{cfg.label}
                        </span>
                        <div className="reserva-meta-row">
                          <span><i className="bi bi-calendar3" />{r.fecha}</span>
                          <span><i className="bi bi-clock" />{r.hora}</span>
                          <span><i className="bi bi-people" />{r.personas} persona{r.personas > 1 ? "s" : ""}</span>
                          {r.mesaNumero && <span><i className="bi bi-grid" />Mesa {r.mesaNumero}{r.zona ? ` · ${r.zona}` : ""}</span>}
                        </div>
                        {r.estado === "cancelada" && r.motivoCancelacion && (
                          <div style={{ background: "#fff1f1", border: "1px solid #fecaca", borderRadius: 8, padding: "6px 10px", fontSize: "0.77rem", color: "#991b1b", marginBottom: 8 }}>
                            <i className="bi bi-info-circle me-1" /><strong>Motivo:</strong> {r.motivoCancelacion}
                          </div>
                        )}
                        <div className="reserva-acciones">
                          {r.estado === "confirmada" && (
                            <>
                              <button className="btn-modificar">
                                <i className="bi bi-pencil me-1" />Modificar
                              </button>
                              <button
                                className="btn-cancelar-nuevo"
                                onClick={() => cancelable && setModalCancel(r)}
                                disabled={!cancelable}
                                title={cancelable ? "Cancelar reserva" : "Menos de 2h para la reserva"}
                              >
                                Cancelar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── HISTORIAL ── */}
          {tab === "historial" && (
            <div className="seccion-card">
              <h3 className="seccion-title">Historial de Reservas</h3>
              {reservas.filter(r => !["confirmada","pendiente"].includes(r.estado)).length === 0 ? (
                <div className="cuenta-empty">
                  <i className="bi bi-clock-history" />
                  <p>Sin historial de reservas.</p>
                </div>
              ) : (
                reservas.filter(r => !["confirmada","pendiente"].includes(r.estado)).map((r) => {
                  const cfg = estadoConfig[r.estado] || { color: "#888", icon: "bi-question-circle", label: r.estado };
                  return (
                    <div key={r.id} className="historial-item">
                      <div className="historial-info">
                        <div className="historial-nombre">{r.restaurant?.nombre || r.restaurante}</div>
                        <div className="historial-meta">
                          {r.fecha} &bull; {r.hora} &bull; {r.personas} persona{r.personas > 1 ? "s" : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        {r.estado === "cancelada_cliente" || r.estado === "cancelada" ? (
                          <span style={{ background: "#fee2e2", color: "#dc2626", fontSize: "0.72rem", fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                            Cancelada
                          </span>
                        ) : (
                          <>
                            <span className="badge-completada">Completada</span>
                            <button className="btn-resena">
                              <i className="bi bi-pencil-square me-1" />Escribir Reseña
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── FAVORITOS ── */}
          {tab === "favoritos" && (
            <div className="seccion-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 className="seccion-title" style={{ margin: 0 }}>Restaurantes Favoritos</h3>
                <i className="bi bi-heart-fill" style={{ color: "#dc3545", fontSize: "1.2rem" }} />
              </div>
              {favoritos.length === 0 ? (
                <div className="cuenta-empty">
                  <i className="bi bi-heart" />
                  <p>Aún no tienes favoritos guardados.</p>
                  <Link to="/catalog" className="btn-nueva-reserva">Explorar restaurantes</Link>
                </div>
              ) : (
                <div className="favoritos-grid">
                  {favoritos.map((fav) => (
                    <div key={fav} className="fav-card-nueva">
                      <div className="fav-img">
                        <i className="bi bi-shop" />
                        <div className="fav-heart"><i className="bi bi-heart-fill" /></div>
                      </div>
                      <div className="fav-body">
                        <div className="fav-nombre">{fav}</div>
                        <div className="fav-tipo">Restaurante</div>
                      </div>
                      <Link to="/catalog" className="btn-fav-reservar">Reservar</Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── RESEÑAS / COMENTARIOS ── */}
          {tab === "comentarios" && (
            <div className="seccion-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <h3 className="seccion-title" style={{ margin: 0 }}>Mis Reseñas</h3>
                <Link to="/form" className="btn-nueva-reserva">
                  <i className="bi bi-plus-circle" /> Nueva reseña
                </Link>
              </div>
              <div className="com-filtros">
                <button className={`com-filtro-btn ${filtroComentarios === "todos" ? "active" : ""}`} onClick={() => setFiltroComentarios("todos")}>
                  Todos ({comentariosUsuario.length})
                </button>
                <button className={`com-filtro-btn ${filtroComentarios === "respondidos" ? "active" : ""}`} onClick={() => setFiltroComentarios("respondidos")}>
                  <i className="bi bi-reply-fill me-1" />Con respuesta ({cantidadRespondidos})
                </button>
              </div>
              {cargandoComentarios ? (
                <div className="text-center py-3">
                  <div className="spinner-border" style={{ color: "#3b82f6" }} role="status" />
                  <p className="mt-2 text-muted" style={{ fontSize: "0.85rem" }}>Cargando comentarios...</p>
                </div>
              ) : comentariosFiltrados.length === 0 ? (
                <div className="com-empty">
                  <i className="bi bi-chat-left" />
                  <p>{filtroComentarios === "respondidos" ? "Aún no tienes comentarios con respuesta." : "Aún no has enviado comentarios."}</p>
                </div>
              ) : (
                comentariosFiltrados.map((c) => {
                  const cfg = tipoComConfig[c.tipo] || tipoComConfig.comentario;
                  const isOpen = expandidoComentario === c.id;
                  const tieneRespuesta = !!c.respuestaRestaurante;
                  return (
                    <div key={c.id} className="com-card" style={{ borderLeftColor: cfg.color }} onClick={() => setExpandidoComentario(isOpen ? null : c.id)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                            <i className={`bi ${cfg.icon} me-1`} />{cfg.label}
                          </span>
                          {tieneRespuesta && <span className="com-badge-resp"><i className="bi bi-reply-fill me-1" />Respondido</span>}
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
                              <div className="com-respuesta-header"><i className="bi bi-reply-fill me-1" />Respuesta del restaurante · {c.fechaRespuesta}</div>
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
            <div className="seccion-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <h3 className="seccion-title" style={{ margin: 0 }}>Mi Perfil</h3>
                {!editMode && (
                  <button className="btn-nueva-reserva" onClick={() => setEditMode(true)}>
                    <i className="bi bi-pencil" /> Editar
                  </button>
                )}
              </div>

              {saveMsg && (
                <div className="auth-success-box" style={{ marginBottom: 16 }}>
                  <i className="bi bi-check-circle me-2" />{saveMsg}
                </div>
              )}

              {editMode ? (
                <form onSubmit={handleSaveProfile} className="perfil-form">
                  <div className="auth-field">
                    <label className="auth-label">Nombre</label>
                    <div className="auth-input-wrap">
                      <i className="bi bi-person auth-input-icon" />
                      <input type="text" className="auth-input" value={profileForm.nombre}
                        onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })} />
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
                      <input type="tel" className="auth-input" placeholder="987654321" maxLength={9}
                        value={profileForm.telefono}
                        onChange={(e) => setProfileForm({ ...profileForm, telefono: e.target.value })} />
                    </div>
                    <small className="text-muted">9 dígitos exactos.</small>
                  </div>
                  <div className="auth-field">
                    <label className="auth-label">Correo Google (recuperación)</label>
                    <div className="auth-input-wrap">
                      <i className="bi bi-envelope auth-input-icon" />
                      <input type="email" className="auth-input" placeholder="tu@gmail.com"
                        value={profileForm.googleEmail}
                        onChange={(e) => setProfileForm({ ...profileForm, googleEmail: e.target.value })} />
                    </div>
                    <small className="text-muted">Para recuperar tu contraseña.</small>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                    <button type="submit" className="auth-submit-btn" style={{ flex: 1 }}>
                      <i className="bi bi-check-lg me-1" /> Guardar cambios
                    </button>
                    <button type="button" className="cancel-modal-btn-no" onClick={() => setEditMode(false)}>
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
                    <span className="perfil-info-value"><span className="cuenta-badge">{user.rol || "Usuario"}</span></span>
                  </div>
                  <div className="perfil-info-row">
                    <span className="perfil-info-label"><i className="bi bi-telephone me-2" />Teléfono</span>
                    <span className="perfil-info-value">{user.telefono || <span style={{ color: "#bbb" }}>No registrado</span>}</span>
                  </div>
                  <div className="perfil-info-row">
                    <span className="perfil-info-label"><i className="bi bi-google me-2" />Google</span>
                    <span className="perfil-info-value">
                      {user.googleEmail
                        ? <span style={{ color: "#22c55e" }}><i className="bi bi-check-circle-fill me-1" />{user.googleEmail}</span>
                        : <span style={{ color: "#bbb", fontSize: "0.83rem" }}>No vinculado</span>
                      }
                    </span>
                  </div>
                  {fechaMiembro && (
                    <div className="perfil-info-row">
                      <span className="perfil-info-label"><i className="bi bi-calendar me-2" />Miembro desde</span>
                      <span className="perfil-info-value" style={{ textTransform: "capitalize" }}>{fechaMiembro}</span>
                    </div>
                  )}
                  <div className="perfil-info-row">
                    <span className="perfil-info-label"><i className="bi bi-chat-dots me-2" />Reseñas enviadas</span>
                    <span className="perfil-info-value">{comentariosUsuario.length}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
