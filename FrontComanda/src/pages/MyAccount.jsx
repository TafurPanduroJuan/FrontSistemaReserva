import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../services/api";
import Navbar from "../components/Navbar";
import '../assets/styles/myAccount.css';

function puedeCancel(reserva) {
  try {
    const diff = new Date(`${reserva.fecha}T${reserva.hora}:00`) - new Date();
    return diff / (1000 * 60 * 60) > 2;
  } catch { return false; }
}

function formatFechaRegistro(str) {
  if (!str) return null;
  try {
    return new Date(str + "T12:00:00").toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  } catch { return str; }
}

const ESTADO_CFG = {
  pendiente:         { label: "Pendiente",                     icon: "bi-clock",            cls: "pendiente" },
  confirmada:        { label: "Confirmada",                    icon: "bi-check-circle-fill", cls: "confirmada" },
  cancelada:         { label: "Cancelada por el restaurante",  icon: "bi-x-circle-fill",     cls: "cancelada" },
  cancelada_cliente: { label: "Cancelada por ti",              icon: "bi-person-x-fill",     cls: "cancelada_cliente" },
};

const TIPO_COM = {
  comentario:  { label: "Comentario",  icon: "bi-chat-left-text",      color: "#3b82f6", bg: "#eff6ff" },
  reclamo:     { label: "Reclamo",     icon: "bi-exclamation-triangle", color: "#ef4444", bg: "#fef2f2" },
  experiencia: { label: "Experiencia", icon: "bi-star-fill",            color: "#f59e0b", bg: "#fffbeb" },
};

const TABS = [
  { id: "proximas",  icon: "bi-calendar2-check",  label: "Próximas Reservas" },
  { id: "historial", icon: "bi-clock-history",     label: "Historial" },
  { id: "favoritos", icon: "bi-heart",             label: "Favoritos" },
  { id: "resenas",   icon: "bi-chat-left-dots",    label: "Reseñas" },
  { id: "perfil",    icon: "bi-person-gear",        label: "Perfil" },
];

export default function MyAccount() {
  const { user, token, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab]           = useState("proximas");
  const [editMode, setEditMode] = useState(false);
  const [saveMsg, setSaveMsg]   = useState("");
  const [profileForm, setProfileForm] = useState({
    nombre:      user?.nombre      || "",
    telefono:    user?.telefono    || "",
    googleEmail: user?.googleEmail || "",
  });

  // Avatar modal
  const [avatarModal, setAvatarModal]   = useState(false);
  const [avatarUrl, setAvatarUrl]       = useState(user?.avatar || "");
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [uploadType, setUploadType]     = useState("local"); // 'local' o 'url'

  // Reservas
  const [reservas, setReservas]               = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(false);
  const [modalCancel, setModalCancel]         = useState(null);
  const [motivoCancel, setMotivoCancel]       = useState("");

  // Comentarios
  const [comentarios, setComentarios]               = useState([]);
  const [cargandoComs, setCargandoComs]             = useState(false);
  const [expandCom, setExpandCom]                   = useState(null);
  const [filtrocom, setFiltrocom]                   = useState("todos");

  if (!user) { navigate("/login"); return null; }

  const cargarReservas = async () => {
    if (!token) return;
    setCargandoReservas(true);
    try { setReservas(await apiFetch("/api/reservations/me", {}, token)); }
    catch (e) { console.error(e); }
    finally { setCargandoReservas(false); }
  };

  const cargarComentarios = async () => {
    if (!token) return;
    setCargandoComs(true);
    try {
      const data = await apiFetch("/api/comments/me", {}, token);
      setComentarios(data.map(c => ({ ...c, restaurante: c.restaurant?.nombre || null })));
    } catch (e) { console.error(e); }
    finally { setCargandoComs(false); }
  };

  useEffect(() => { cargarReservas(); }, [token]);
  useEffect(() => { cargarComentarios(); }, [token]);

  const proximasReservas = reservas.filter(r => ["confirmada","pendiente"].includes(r.estado));
  const historialReservas = reservas.filter(r => !["confirmada","pendiente"].includes(r.estado));
  const favoritos = user.favoritos || [];
  const respondidos = comentarios.filter(c => !!c.respuestaRestaurante).length;
  const comsFiltrados = filtrocom === "respondidos"
    ? comentarios.filter(c => !!c.respuestaRestaurante)
    : comentarios;
  const canceladasRest = reservas.filter(r => r.estado === "cancelada" && r.motivoCancelacion);
  const fechaMiembro = formatFechaRegistro(user.fechaRegistro);

  // ── Guardar perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const result = await updateProfile({
      nombre:      profileForm.nombre,
      telefono:    profileForm.telefono ? parseInt(profileForm.telefono) : null,
      googleEmail: profileForm.googleEmail || "",
    });
    if (result.ok) { setSaveMsg("Perfil actualizado"); setEditMode(false); setTimeout(() => setSaveMsg(""), 3000); }
    else { setSaveMsg("Error al guardar"); }
  };

  // ── Procesar imagen local de la PC a Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validación opcional de tamaño (ej: máximo 2MB para evitar saturar Base64)
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es muy pesada. Elige una menor a 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result); // Esto guarda el string en Base64 listo para enviarse
    };
    reader.readAsDataURL(file);
  };

  // ── Guardar avatar
  const handleSaveAvatar = async () => {
    if (!avatarUrl.trim()) return;
    setAvatarSaving(true);
    const result = await updateProfile({ avatar: avatarUrl.trim() });
    setAvatarSaving(false);
    if (result.ok) { setAvatarModal(false); setSaveMsg("Avatar actualizado"); setTimeout(() => setSaveMsg(""), 3000); }
    else { setSaveMsg("Error al guardar avatar"); }
  };

  // ── Cancelar reserva
  const handleConfirmarCancel = async () => {
    if (!modalCancel) return;
    try {
      const body = { estado: "cancelada_cliente" };
      if (motivoCancel.trim()) body.motivoCancelacion = motivoCancel.trim();
      await apiFetch(`/api/reservations/${modalCancel.id}/status`, { method: "PATCH", body: JSON.stringify(body) }, token);
      setReservas(prev => prev.map(r => r.id === modalCancel.id ? { ...r, estado: "cancelada_cliente" } : r));
      setModalCancel(null);
    } catch (e) { alert("No se pudo cancelar: " + e.message); setModalCancel(null); }
  };

  return (
    <>
      <Navbar />

      <div className="mi-cuenta-page" style={{ paddingTop: 70 }}>

        {/* ── MODAL AVATAR MODIFICADO ── */}
        {avatarModal && (
          <div className="avatar-modal-overlay" onClick={() => setAvatarModal(false)}>
            <div className="avatar-modal" onClick={e => e.stopPropagation()}>
              <h4 className="avatar-modal-title">Cambiar foto de perfil</h4>
              <p className="avatar-modal-sub">Elige cómo deseas actualizar tu avatar</p>
              
              {/* Selector de tipo de subida */}
              <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                <button 
                  type="button"
                  className={`cuenta-tab-btn ${uploadType === "local" ? "active" : ""}`}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setUploadType("local")}
                >
                  <i className="bi bi-desktop" /> Subir Imagen
                </button>
                <button 
                  type="button"
                  className={`cuenta-tab-btn ${uploadType === "url" ? "active" : ""}`}
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => setUploadType("url")}
                >
                  <i className="bi bi-link-45deg" /> Enlace URL
                </button>
              </div>

              <div className="avatar-preview">
                {avatarUrl
                  ? <img src={avatarUrl} alt="preview" onError={e => { e.target.style.display="none"; }} />
                  : <i className="bi bi-person-fill" />
                }
              </div>

              {uploadType === "local" ? (
                <div className="auth-field">
                  <label className="auth-label">Subir archivo de imagen</label>
                  <div className="auth-input-wrap">
                    <input
                      type="file" 
                      className="auth-input"
                      accept="image/*"
                      style={{ paddingLeft: 12, paddingTop: 8 }}
                      onChange={handleFileChange}
                    />
                  </div>
                  <small className="text-muted" style={{ fontSize: "0.77rem" }}>
                    Formatos soportados: JPG, PNG, WEBP. Máx 2MB.
                  </small>
                </div>
              ) : (
                <div className="auth-field">
                  <label className="auth-label">URL de la imagen</label>
                  <div className="auth-input-wrap">
                    <i className="bi bi-link-45deg auth-input-icon" />
                    <input
                      type="url" className="auth-input"
                      placeholder="https://ejemplo.com/mi-foto.jpg"
                      value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                      onChange={e => setAvatarUrl(e.target.value)}
                    />
                  </div>
                  <small className="text-muted" style={{ fontSize: "0.77rem" }}>
                    Puedes usar cualquier URL pública de imagen.
                  </small>
                </div>
              )}

              <div className="avatar-modal-actions">
                <button className="btn-avatar-cancel" onClick={() => setAvatarModal(false)}>Cancelar</button>
                <button className="btn-avatar-save" onClick={handleSaveAvatar} disabled={avatarSaving}>
                  {avatarSaving ? <><span className="spinner-border spinner-border-sm me-1" />Guardando…</> : "Guardar foto"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL CANCELAR RESERVA ── */}
        {modalCancel && (
          <div className="cancel-modal-overlay" onClick={() => setModalCancel(null)}>
            <div className="cancel-modal-card" onClick={e => e.stopPropagation()}>
              <div className="cancel-modal-icon"><i className="bi bi-exclamation-triangle-fill" /></div>
              <h4 className="cancel-modal-title">¿Cancelar esta reserva?</h4>
              <p className="cancel-modal-body">
                Reserva en <strong>{modalCancel.restaurant?.nombre || modalCancel.restaurante}</strong> el <strong>{modalCancel.fecha}</strong> a las <strong>{modalCancel.hora}</strong>.
              </p>
              <div style={{ marginBottom: 14 }}>
                <label className="auth-label" style={{ marginBottom: 5, display: "block" }}>Motivo <span style={{ fontWeight: 400, color: "#aaa", textTransform: "none" }}>(opcional)</span></label>
                <textarea
                  style={{ width: "100%", border: "1.5px solid #e8e8e8", borderRadius: 10, padding: "10px", fontSize: "0.85rem", resize: "vertical", minHeight: 70, outline: "none", boxSizing: "border-box" }}
                  placeholder="Ej: Surgió un imprevisto..."
                  value={motivoCancel} onChange={e => setMotivoCancel(e.target.value)} maxLength={300}
                />
                <div style={{ fontSize: "0.7rem", color: "#bbb" }}>{motivoCancel.length}/300</div>
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

        {/* ── HEADER ── */}
        <div className="cuenta-header">
          <div className="cuenta-header-inner">
            <div className="cuenta-avatar-wrap">
              <div className="cuenta-avatar" onClick={() => { setAvatarUrl(user.avatar || ""); setAvatarModal(true); }} title="Cambiar foto">
                {user.avatar
                  ? <img src={user.avatar} alt="avatar" />
                  : <i className="bi bi-person-fill" />
                }
              </div>
              <div className="avatar-edit-hint" onClick={() => { setAvatarUrl(user.avatar || ""); setAvatarModal(true); }}>
                <i className="bi bi-pencil-fill" />
              </div>
            </div>

            <div className="cuenta-info">
              <h2 className="cuenta-nombre">{user.nombre}</h2>
              {fechaMiembro && (
                <span className="cuenta-miembro">
                  <i className="bi bi-calendar3 me-1" />Miembro desde {fechaMiembro}
                </span>
              )}
              <div className="cuenta-header-badges">
                <span className="hdr-badge"><i className="bi bi-calendar-check" />{reservas.length} Reservas</span>
                <span className="hdr-badge"><i className="bi bi-heart" />{favoritos.length} Favoritos</span>
                <span className="hdr-badge"><i className="bi bi-chat-dots" />{comentarios.length} Reseñas</span>
              </div>
            </div>

            <div className="cuenta-header-actions">
              <button className="btn-editar-perfil" onClick={() => setTab("perfil")}>
                <i className="bi bi-pencil" /> Editar Perfil
              </button>
              <button className="btn-header-icon" title="Cerrar sesión" onClick={() => { logout(); navigate("/login"); }}>
                <i className="bi bi-box-arrow-right" />
              </button>
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="cuenta-body">
          <aside className="cuenta-sidebar">
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

            <div className="sidebar-card">
              <div className="sidebar-card-title">Mis Reservas</div>
              <button className={`sidebar-nav-item ${tab === "proximas" ? "active" : ""}`} onClick={() => setTab("proximas")}>
                <i className="bi bi-calendar2-check sidebar-nav-icon" /> Próximas
                {proximasReservas.length > 0 && (
                  <span style={{ marginLeft: "auto", background: "#fdf0e8", color: "#F4956A", borderRadius: 20, padding: "1px 8px", fontSize: "0.72rem", fontWeight: 800 }}>
                    {proximasReservas.length}
                  </span>
                )}
              </button>
              <button className={`sidebar-nav-item ${tab === "historial" ? "active" : ""}`} onClick={() => setTab("historial")}>
                <i className="bi bi-clock-history sidebar-nav-icon" /> Historial
                {historialReservas.length > 0 && (
                  <span style={{ marginLeft: "auto", background: "#f5f5f5", color: "#888", borderRadius: 20, padding: "1px 8px", fontSize: "0.72rem", fontWeight: 800 }}>
                    {historialReservas.length}
                  </span>
                )}
              </button>
              <hr className="sidebar-divider" />
              <button className={`sidebar-nav-item ${tab === "favoritos" ? "active" : ""}`} onClick={() => setTab("favoritos")}>
                <i className="bi bi-heart sidebar-nav-icon" /> Favoritos
              </button>
              <button className={`sidebar-nav-item ${tab === "resenas" ? "active" : ""}`} onClick={() => setTab("resenas")}>
                <i className="bi bi-chat-left-dots sidebar-nav-icon" /> Reseñas
                {respondidos > 0 && (
                  <span style={{ marginLeft: "auto", background: "#eff6ff", color: "#3b82f6", borderRadius: 20, padding: "1px 8px", fontSize: "0.72rem", fontWeight: 800 }}>
                    {respondidos}
                  </span>
                )}
              </button>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-card-title">Configuración</div>
              <button className={`sidebar-nav-item ${tab === "perfil" ? "active" : ""}`} onClick={() => setTab("perfil")}>
                <i className="bi bi-gear sidebar-nav-icon" /> Configuración
              </button>
              <button className="sidebar-nav-item" onClick={() => setTab("resenas")}>
                <i className="bi bi-bell sidebar-nav-icon" /> Notificaciones
              </button>
              <hr className="sidebar-divider" />
              <button className="sidebar-nav-item danger" onClick={() => { logout(); navigate("/login"); }}>
                <i className="bi bi-box-arrow-right sidebar-nav-icon" /> Cerrar Sesión
              </button>
            </div>
          </aside>

          <main className="cuenta-main">
            {canceladasRest.length > 0 && (
              <div className="notif-banner">
                <div className="notif-banner-title"><i className="bi bi-bell-fill me-2" />
                  {canceladasRest.length === 1 ? "Una reserva fue cancelada por el restaurante" : `${canceladasRest.length} reservas canceladas por el restaurante`}
                </div>
                {canceladasRest.map(r => (
                  <div className="notif-item" key={r.id}>
                    <div className="notif-rest"><i className="bi bi-shop me-1" />{r.restaurant?.nombre || r.restaurante} · {r.fecha} a las {r.hora}</div>
                    <div className="notif-motivo"><i className="bi bi-info-circle me-1" />Motivo: {r.motivoCancelacion}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="cuenta-tabs">
              {TABS.map(t => (
                <button key={t.id} className={`cuenta-tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                  <i className={`bi ${t.icon}`} />
                  {t.label}
                  {t.id === "resenas" && respondidos > 0 && (
                    <span className="tab-notif-dot">{respondidos}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── PRÓXIMAS RESERVAS MODIFICADO (Carga foto del restaurante) ── */}
            {tab === "proximas" && (
              <div className="seccion-card">
                <div className="seccion-header">
                  <h3 className="seccion-title">Próximas Reservas</h3>
                  <Link to="/catalog" className="btn-primary-brand">
                    <i className="bi bi-plus-circle" /> Nueva reserva
                  </Link>
                </div>
                {cargandoReservas ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" style={{ color: "#F4956A" }} role="status" />
                    <p className="mt-2 text-muted" style={{ fontSize: "0.84rem" }}>Cargando reservas…</p>
                  </div>
                ) : proximasReservas.length === 0 ? (
                  <div className="cuenta-empty">
                    <i className="bi bi-calendar-x" />
                    <p>No tienes próximas reservas.</p>
                    <Link to="/catalog" className="btn-primary-brand">Explorar restaurantes</Link>
                  </div>
                ) : proximasReservas.map(r => {
                  const cfg = ESTADO_CFG[r.estado] || { label: r.estado, icon: "bi-question-circle", cls: "" };
                  const cancelable = r.estado === "confirmada" && puedeCancel(r);
                  // Evaluamos si el objeto reserva trae la propiedad de la imagen
                  const rImagen = r.restaurant?.imagen || r.restaurant?.foto || r.imagen || r.foto;

                  return (
                    <div key={r.id} className="reserva-card">
                      <div className="reserva-card-img">
                        {rImagen ? (
                          <img src={rImagen} alt="Restaurante" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : (
                          <i className="bi bi-shop" />
                        )}
                      </div>
                      <div className="reserva-card-body">
                        <div className="reserva-rest-nombre">{r.restaurant?.nombre || r.restaurante}</div>
                        <span className={`estado-badge ${cfg.cls}`}>
                          <i className={`bi ${cfg.icon}`} />{cfg.label}
                        </span>
                        <div className="reserva-meta">
                          <span><i className="bi bi-calendar3" />{r.fecha}</span>
                          <span><i className="bi bi-clock" />{r.hora}</span>
                          <span><i className="bi bi-people" />{r.personas} persona{r.personas > 1 ? "s" : ""}</span>
                          {r.mesaNumero && <span><i className="bi bi-grid" />Mesa {r.mesaNumero}{r.zona ? ` · ${r.zona}` : ""}</span>}
                        </div>
                        {r.estado === "confirmada" && (
                          <div className="reserva-actions">
                            <button className="btn-accion-primary"><i className="bi bi-pencil me-1" />Modificar</button>
                            <button className="btn-accion-ghost" disabled={!cancelable}
                              onClick={() => cancelable && (setMotivoCancel(""), setModalCancel(r))}
                              title={cancelable ? "Cancelar" : "Menos de 2h para la reserva"}>
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── HISTORIAL ── */}
            {tab === "historial" && (
              <div className="seccion-card">
                <div className="seccion-header">
                  <h3 className="seccion-title">Historial de Reservas</h3>
                </div>
                {historialReservas.length === 0 ? (
                  <div className="cuenta-empty">
                    <i className="bi bi-clock-history" />
                    <p>Sin historial de reservas aún.</p>
                  </div>
                ) : historialReservas.map(r => {
                  const completada = r.estado !== "cancelada" && r.estado !== "cancelada_cliente";
                  return (
                    <div key={r.id} className="historial-item">
                      <div>
                        <div className="historial-nombre">{r.restaurant?.nombre || r.restaurante}</div>
                        <div className="historial-meta">
                          {r.fecha} &bull; {r.hora} &bull; {r.personas} persona{r.personas > 1 ? "s" : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                        {completada ? (
                          <>
                            <span className="badge-completada">Completada</span>
                            <button className="btn-resena"><i className="bi bi-pencil-square me-1" />Escribir Reseña</button>
                          </>
                        ) : (
                          <span className="badge-cancelada-hist">Cancelada</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── FAVORITOS ── */}
            {tab === "favoritos" && (
              <div className="seccion-card">
                <div className="seccion-header">
                  <h3 className="seccion-title">Restaurantes Favoritos</h3>
                  <i className="bi bi-heart-fill" style={{ color: "#dc3545", fontSize: "1.15rem" }} />
                </div>
                {favoritos.length === 0 ? (
                  <div className="cuenta-empty">
                    <i className="bi bi-heart" />
                    <p>Aún no tienes favoritos guardados.</p>
                    <Link to="/catalog" className="btn-primary-brand">Explorar restaurantes</Link>
                  </div>
                ) : (
                  <div className="favoritos-grid">
                    {favoritos.map(fav => (
                      <div key={fav} className="fav-card">
                        <div className="fav-card-img">
                          <i className="bi bi-shop" />
                          <div className="fav-heart"><i className="bi bi-heart-fill" /></div>
                        </div>
                        <div className="fav-card-body">
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

            {/* ── RESEÑAS ── */}
            {tab === "resenas" && (
              <div className="seccion-card">
                <div className="seccion-header">
                  <h3 className="seccion-title">Mis Reseñas</h3>
                  <Link to="/form" className="btn-primary-brand"><i className="bi bi-plus-circle" /> Nueva reseña</Link>
                </div>
                <div className="com-filtros">
                  <button className={`com-filtro-btn ${filtrocom === "todos" ? "active" : ""}`} onClick={() => setFiltrocom("todos")}>
                    Todos ({comentarios.length})
                  </button>
                  <button className={`com-filtro-btn ${filtrocom === "respondidos" ? "active" : ""}`} onClick={() => setFiltrocom("respondidos")}>
                    <i className="bi bi-reply-fill me-1" />Con respuesta ({respondidos})
                  </button>
                </div>
                {cargandoComs ? (
                  <div className="text-center py-3">
                    <div className="spinner-border" style={{ color: "#3b82f6" }} role="status" />
                  </div>
                ) : comsFiltrados.length === 0 ? (
                  <div className="cuenta-empty">
                    <i className="bi bi-chat-left" />
                    <p>{filtrocom === "respondidos" ? "Sin comentarios respondidos aún." : "Aún no has enviado reseñas."}</p>
                    {filtrocom === "todos" && <Link to="/form" className="btn-primary-brand mt-2">Enviar reseña</Link>}
                  </div>
                ) : comsFiltrados.map(c => {
                  const cfg = TIPO_COM[c.tipo] || TIPO_COM.comentario;
                  const isOpen = expandCom === c.id;
                  return (
                    <div key={c.id} className="com-card" style={{ borderLeftColor: cfg.color }}
                      onClick={() => setExpandCom(isOpen ? null : c.id)}>
                      <div style={{ display: "flex", justifySpaceBetween: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
                          <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>
                            <i className={`bi ${cfg.icon} me-1`} />{cfg.label}
                          </span>
                          {c.respuestaRestaurante && <span className="com-badge-resp"><i className="bi bi-reply-fill me-1" />Respondido</span>}
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{c.fecha}</span>
                      </div>
                      <div className="com-asunto">{c.asunto}</div>
                      <div className="com-meta">
                        <i className="bi bi-shop me-1" />{c.restaurante || "—"}
                        {c.calificacion > 0 && (
                          <span style={{ marginLeft: 8, color: "#f59e0b" }}>
                            {"★".repeat(c.calificacion)}{"☆".repeat(5 - c.calificacion)}
                          </span>
                        )}
                      </div>
                      {isOpen && (
                        <div onClick={e => e.stopPropagation()}>
                          <div className="com-mensaje">{c.mensaje}</div>
                          {c.respuestaRestaurante && (
                            <div className="com-respuesta-box">
                              <div className="com-respuesta-header"><i className="bi bi-reply-fill me-1" />Respuesta del restaurante · {c.fechaRespuesta}</div>
                              <div className="com-respuesta-text">{c.respuestaRestaurante}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── PERFIL ── */}
            {tab === "perfil" && (
              <div className="seccion-card">
                <div className="seccion-header">
                  <h3 className="seccion-title">Mi Perfil</h3>
                  {!editMode && (
                    <button className="btn-primary-brand" onClick={() => { setEditMode(true); setProfileForm({ nombre: user.nombre || "", telefono: user.telefono || "", googleEmail: user.googleEmail || "" }); }}>
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
                          onChange={e => setProfileForm({ ...profileForm, nombre: e.target.value })} />
                      </div>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Email</label>
                      <div className="auth-input-wrap">
                        <i className="bi bi-envelope auth-input-icon" />
                        <input type="email" className="auth-input" value={user.email} disabled />
                      </div>
                      <small className="text-muted">El email no se puede cambiar.</small>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Teléfono</label>
                      <div className="auth-input-wrap">
                        <i className="bi bi-telephone auth-input-icon" />
                        <input type="tel" className="auth-input" placeholder="987654321" maxLength={9}
                          value={profileForm.telefono}
                          onChange={e => setProfileForm({ ...profileForm, telefono: e.target.value })} />
                      </div>
                      <small className="text-muted">9 dígitos exactos.</small>
                    </div>
                    <div className="auth-field">
                      <label className="auth-label">Correo Google (recuperación)</label>
                      <div className="auth-input-wrap">
                        <i className="bi bi-envelope auth-input-icon" />
                        <input type="email" className="auth-input" placeholder="tu@gmail.com"
                          value={profileForm.googleEmail}
                          onChange={e => setProfileForm({ ...profileForm, googleEmail: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="submit" className="auth-submit-btn" style={{ flex: 1 }}>
                        <i className="bi bi-check-lg me-1" /> Guardar cambios
                      </button>
                      <button type="button" className="cancel-modal-btn-no" style={{ flex: "0 0 auto" }} onClick={() => setEditMode(false)}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: "16px 0", borderBottom: "1px solid #f5f5f5" }}>
                      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fdf0e8", border: "2px solid #F4956A", display: "flex", alignItems: "center", justifyCenter: "center", fontSize: "1.6rem", color: "#F4956A", overflow: "hidden", flexShrink: 0 }}>
                        {user.avatar ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <i className="bi bi-person-fill" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{user.nombre}</div>
                        <button className="btn-primary-brand" style={{ fontSize: "0.77rem", padding: "5px 13px" }} onClick={() => { setAvatarUrl(user.avatar || ""); setAvatarModal(true); }}>
                          <i className="bi bi-camera" /> Cambiar foto
                        </button>
                      </div>
                    </div>
                    {[
                      { icon: "bi-person",    label: "Nombre",         val: user.nombre },
                      { icon: "bi-envelope",  label: "Email",          val: user.email },
                      { icon: "bi-shield",    label: "Rol",            val: <span className="cuenta-badge">{user.rol || "Usuario"}</span> },
                      { icon: "bi-telephone", label: "Teléfono",       val: user.telefono || <span style={{ color: "#ccc" }}>No registrado</span> },
                      { icon: "bi-google",    label: "Google",         val: user.googleEmail ? <span style={{ color: "#22c55e" }}><i className="bi bi-check-circle-fill me-1" />{user.googleEmail}</span> : <span style={{ color: "#ccc", fontSize: "0.83rem" }}>No vinculado</span> },
                      ...(fechaMiembro ? [{ icon: "bi-calendar", label: "Miembro desde", val: <span style={{ textTransform: "capitalize" }}>{fechaMiembro}</span> }] : []),
                      { icon: "bi-chat-dots", label: "Reseñas",        val: `${comentarios.length} enviada${comentarios.length !== 1 ? "s" : ""}` },
                    ].map(row => (
                      <div key={row.label} className="perfil-info-row">
                        <span className="perfil-info-label"><i className={`bi ${row.icon} me-2`} />{row.label}</span>
                        <span className="perfil-info-value">{row.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}