import { useState } from "react";
import { useComments } from "../../context/CommentsContext";
import { useAuth } from "../../context/AuthContext";

const tipoConfig = {
  comentario:  { label: "Comentario",  icon: "bi-chat-left-text",      color: "#3b82f6", bg: "#eff6ff" },
  reclamo:     { label: "Reclamo",     icon: "bi-exclamation-triangle", color: "#ef4444", bg: "#fef2f2" },
  experiencia: { label: "Experiencia", icon: "bi-star-fill",            color: "#f59e0b", bg: "#fffbeb" },
};

function Comments() {
  const { comentarios, marcarLeido, archivarComentario, responderComentario } = useComments();
  const { isPersonal, isAdmin, user } = useAuth();

  const [filtro, setFiltro] = useState("todos");
  const [expandido, setExpandido] = useState(null);

  // Estado para el modal de respuesta
  const [modalRespuesta, setModalRespuesta] = useState(null);
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState("");

  // Para el PERSONAL, filtrar solo comentarios sin respuesta o ya respondidos
  const [subFiltro, setSubFiltro] = useState("pendientes"); // pendientes | respondidos | todos

  // Aplicar filtro por tipo
  let filtrados = comentarios.filter(
    (c) => filtro === "todos" || c.tipo === filtro
  );

  // Aplicar subfiltro de respuesta (relevante para PERSONAL)
  if (isPersonal) {
    if (subFiltro === "pendientes") {
      filtrados = filtrados.filter((c) => !c.respuestaRestaurante);
    } else if (subFiltro === "respondidos") {
      filtrados = filtrados.filter((c) => !!c.respuestaRestaurante);
    }
  }

  const pendientesSinRespuesta = comentarios.filter((c) => !c.respuestaRestaurante).length;
  const yaRespondidos = comentarios.filter((c) => !!c.respuestaRestaurante).length;

  const handleExpandir = (id) => {
    setExpandido((prev) => (prev === id ? null : id));
    marcarLeido(id);
  };

  const abrirModalRespuesta = (comentario) => {
    setModalRespuesta(comentario);
    setTextoRespuesta(comentario.respuestaRestaurante || "");
    setErrorRespuesta("");
  };

  const handleEnviarRespuesta = async () => {
    if (!textoRespuesta.trim()) {
      setErrorRespuesta("La respuesta no puede estar vacía.");
      return;
    }
    setEnviandoRespuesta(true);
    setErrorRespuesta("");
    try {
      await responderComentario(modalRespuesta.id, textoRespuesta.trim());
      setModalRespuesta(null);
      setTextoRespuesta("");
    } catch (err) {
      setErrorRespuesta("Error al enviar la respuesta: " + err.message);
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  return (
    <div>
      <style>{`
        .cm-reply-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1050; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .cm-reply-modal { background: white; border-radius: 20px; padding: 28px 24px; max-width: 520px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .cm-reply-modal-title { font-size: 1.1rem; font-weight: 800; color: #1a1a2e; margin-bottom: 4px; }
        .cm-reply-modal-sub { font-size: 0.82rem; color: #888; margin-bottom: 16px; }
        .cm-reply-orig { background: #f8f9fa; border-left: 3px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; color: #555; margin-bottom: 16px; line-height: 1.5; }
        .cm-reply-label { font-size: 0.78rem; font-weight: 700; color: #444; margin-bottom: 6px; display: block; }
        .cm-reply-textarea { width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; font-size: 0.88rem; font-family: inherit; resize: vertical; min-height: 110px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .cm-reply-textarea:focus { border-color: #F4956A; box-shadow: 0 0 0 3px rgba(244,149,106,0.15); }
        .cm-reply-error { color: #dc3545; font-size: 0.78rem; margin-top: 4px; }
        .cm-reply-actions { display: flex; gap: 10px; margin-top: 16px; }
        .cm-reply-btn-cancel { flex: 1; padding: 10px; border-radius: 10px; border: 2px solid #e5e7eb; background: white; color: #555; font-weight: 700; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
        .cm-reply-btn-cancel:hover { border-color: #ccc; background: #f8f8f8; }
        .cm-reply-btn-send { flex: 2; padding: 10px; border-radius: 10px; border: none; background: linear-gradient(135deg, #F4956A, #e07d52); color: white; font-weight: 700; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 6px; transition: opacity 0.2s; box-shadow: 0 3px 12px rgba(244,149,106,0.35); }
        .cm-reply-btn-send:hover:not(:disabled) { opacity: 0.9; }
        .cm-reply-btn-send:disabled { opacity: 0.6; cursor: not-allowed; }
        .cm-respuesta-box { background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 8px; padding: 10px 14px; margin-top: 10px; }
        .cm-respuesta-header { font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; color: #16a34a; opacity: 0.85; }
        .cm-respuesta-text { font-size: 0.85rem; color: #166534; line-height: 1.5; }
        .cm-stat-bar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .cm-stat { background: white; border-radius: 12px; border: 1px solid #e5e7eb; padding: 12px 18px; display: flex; align-items: center; gap: 10px; flex: 1; min-width: 140px; }
        .cm-stat-num { font-size: 1.4rem; font-weight: 800; color: #1a1a2e; }
        .cm-stat-lbl { font-size: 0.75rem; color: #888; font-weight: 600; }
        .cm-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
        .cm-subfiltros { display: flex; gap: 8px; margin-bottom: 16px; }
        .cm-subfiltro-btn { padding: 6px 14px; border-radius: 20px; border: 2px solid #e5e7eb; background: white; color: #666; font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .cm-subfiltro-btn.active-pending { border-color: #f59e0b; background: #fffbeb; color: #b45309; }
        .cm-subfiltro-btn.active-done { border-color: #22c55e; background: #f0fdf4; color: #166534; }
        .cm-subfiltro-btn.active-all { border-color: #6366f1; background: #eef2ff; color: #4338ca; }
        .cm-alert-pending { background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 12px; padding: 12px 16px; margin-bottom: 16px; color: #92400e; font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .cm-restaurante-tag { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; padding: 2px 8px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
      `}</style>

      {/* Modal de respuesta */}
      {modalRespuesta && (
        <div className="cm-reply-overlay" onClick={() => !enviandoRespuesta && setModalRespuesta(null)}>
          <div className="cm-reply-modal" onClick={(e) => e.stopPropagation()}>
            {/* Encabezado del modal */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #F4956A, #e07d52)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="bi bi-reply-fill text-white" style={{ fontSize: "1.1rem" }} />
              </div>
              <div>
                <div className="cm-reply-modal-title">Responder al cliente</div>
                <div className="cm-reply-modal-sub">
                  <i className="bi bi-person-circle me-1" />{modalRespuesta.usuario}
                  <span style={{ color: "#ccc", margin: "0 5px" }}>·</span>
                  <i className="bi bi-envelope me-1" />{modalRespuesta.email}
                </div>
              </div>
            </div>

            {/* Mensaje original */}
            <div style={{ fontSize: "0.73rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
              Mensaje del cliente
            </div>
            <div className="cm-reply-orig">
              <strong style={{ color: "#333" }}>{modalRespuesta.asunto}</strong>
              <br />
              <span style={{ marginTop: 4, display: "block" }}>{modalRespuesta.mensaje}</span>
            </div>

            {/* Respuesta previa (si existe) */}
            {modalRespuesta.respuestaRestaurante && (
              <div className="cm-respuesta-box mb-3">
                <div className="cm-respuesta-header">
                  <i className="bi bi-check-circle-fill me-1" />
                  Respuesta anterior · {modalRespuesta.fechaRespuesta}
                </div>
                <div className="cm-respuesta-text">{modalRespuesta.respuestaRestaurante}</div>
              </div>
            )}

            <label className="cm-reply-label">
              {modalRespuesta.respuestaRestaurante ? "Editar tu respuesta" : "Tu respuesta"}
            </label>
            <textarea
              className="cm-reply-textarea"
              placeholder="Escribe aquí la respuesta del restaurante al cliente..."
              value={textoRespuesta}
              onChange={(e) => setTextoRespuesta(e.target.value)}
              maxLength={1000}
              autoFocus
            />
            {errorRespuesta && <div className="cm-reply-error"><i className="bi bi-exclamation-circle me-1" />{errorRespuesta}</div>}
            <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 4, display: "flex", justifyContent: "space-between" }}>
              <span><i className="bi bi-bell me-1" />El cliente recibirá una notificación por email</span>
              <span>{textoRespuesta.length}/1000</span>
            </div>

            <div className="cm-reply-actions">
              <button
                className="cm-reply-btn-cancel"
                onClick={() => setModalRespuesta(null)}
                disabled={enviandoRespuesta}
              >
                Cancelar
              </button>
              <button
                className="cm-reply-btn-send"
                onClick={handleEnviarRespuesta}
                disabled={enviandoRespuesta}
              >
                {enviandoRespuesta ? (
                  <><span className="spinner-border spinner-border-sm" /> Enviando...</>
                ) : (
                  <><i className="bi bi-send-fill me-1" />{modalRespuesta.respuestaRestaurante ? "Actualizar respuesta" : "Enviar respuesta"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado de la página */}
      <div className="intra-page-header">
        <div className="intra-page-title">
          <i className="bi bi-chat-square-text"></i>
          {isPersonal
            ? `Comentarios · ${user?.restaurante || "Mi Restaurante"}`
            : "Mensajes de Contáctanos"}
        </div>

        <div className="d-flex gap-2 flex-wrap">
          {Object.entries(tipoConfig).map(([k, v]) => (
            <span
              key={k}
              style={{
                background: v.bg,
                color: v.color,
                padding: "3px 10px",
                borderRadius: 20,
                fontSize: "0.78rem",
                fontWeight: 600,
              }}
            >
              <i className={`bi ${v.icon} me-1`}></i>
              {comentarios.filter((c) => c.tipo === k).length} {v.label}s
            </span>
          ))}
        </div>
      </div>

      {/* Barra de estadísticas (solo para PERSONAL) */}
      {isPersonal && (
        <>
          <div className="cm-stat-bar">
            <div className="cm-stat">
              <div className="cm-stat-icon" style={{ background: "#fef3c7" }}>
                <i className="bi bi-hourglass-split" style={{ color: "#d97706" }} />
              </div>
              <div>
                <div className="cm-stat-num">{pendientesSinRespuesta}</div>
                <div className="cm-stat-lbl">Sin responder</div>
              </div>
            </div>
            <div className="cm-stat">
              <div className="cm-stat-icon" style={{ background: "#dcfce7" }}>
                <i className="bi bi-check-circle-fill" style={{ color: "#16a34a" }} />
              </div>
              <div>
                <div className="cm-stat-num">{yaRespondidos}</div>
                <div className="cm-stat-lbl">Respondidos</div>
              </div>
            </div>
            <div className="cm-stat">
              <div className="cm-stat-icon" style={{ background: "#eff6ff" }}>
                <i className="bi bi-chat-square-text" style={{ color: "#3b82f6" }} />
              </div>
              <div>
                <div className="cm-stat-num">{comentarios.length}</div>
                <div className="cm-stat-lbl">Total</div>
              </div>
            </div>
          </div>

          {pendientesSinRespuesta > 0 && (
            <div className="cm-alert-pending">
              <i className="bi bi-exclamation-triangle-fill" />
              Tienes {pendientesSinRespuesta} comentario{pendientesSinRespuesta !== 1 ? "s" : ""} pendiente{pendientesSinRespuesta !== 1 ? "s" : ""} de respuesta.
              <button
                style={{ marginLeft: "auto", background: "none", border: "none", color: "#92400e", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem", textDecoration: "underline" }}
                onClick={() => setSubFiltro("pendientes")}
              >
                Ver pendientes
              </button>
            </div>
          )}

          {/* Subfiltros de estado de respuesta */}
          <div className="cm-subfiltros">
            <button
              className={`cm-subfiltro-btn ${subFiltro === "pendientes" ? "active-pending" : ""}`}
              onClick={() => setSubFiltro("pendientes")}
            >
              <i className="bi bi-hourglass-split me-1" />
              Pendientes ({pendientesSinRespuesta})
            </button>
            <button
              className={`cm-subfiltro-btn ${subFiltro === "respondidos" ? "active-done" : ""}`}
              onClick={() => setSubFiltro("respondidos")}
            >
              <i className="bi bi-check-circle me-1" />
              Respondidos ({yaRespondidos})
            </button>
            <button
              className={`cm-subfiltro-btn ${subFiltro === "todos" ? "active-all" : ""}`}
              onClick={() => setSubFiltro("todos")}
            >
              Todos ({comentarios.length})
            </button>
          </div>
        </>
      )}

      {/* Filtros por tipo */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {["todos", "comentario", "reclamo", "experiencia"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              border: `2px solid ${filtro === f ? "transparent" : "#e8e0d8"}`,
              background: filtro === f ? "#F4956A" : "white",
              color: filtro === f ? "white" : "#555",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtrados.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#aaa", fontSize: "0.9rem" }}>
          <i className="bi bi-inbox" style={{ fontSize: "2.5rem", display: "block", marginBottom: 12 }}></i>
          {subFiltro === "pendientes" && isPersonal
            ? "¡No tienes comentarios pendientes de respuesta! Estás al día."
            : `No hay mensajes${filtro !== "todos" ? ` de tipo "${filtro}"` : ""} aún.`}
        </div>
      )}

      <div className="row g-3">
        {filtrados.map((c) => {
          const cfg = tipoConfig[c.tipo] || tipoConfig.comentario;
          const isOpen = expandido === c.id;
          const tieneRespuesta = !!c.respuestaRestaurante;

          return (
            <div className="col-12 col-lg-6" key={c.id}>
              <div
                className="intra-card p-4"
                style={{
                  borderLeft: `4px solid ${cfg.color}`,
                  cursor: "pointer",
                  opacity: c.leido ? 0.85 : 1,
                  transition: "opacity 0.2s, box-shadow 0.2s",
                }}
                onClick={() => handleExpandir(c.id)}
              >
                {/* Cabecera */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700 }}>
                      <i className={`bi ${cfg.icon} me-1`}></i>{cfg.label}
                    </span>
                    {!c.leido && (
                      <span style={{ background: "#ff3300", color: "white", fontSize: "0.65rem", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>
                        NUEVO
                      </span>
                    )}
                    {tieneRespuesta ? (
                      <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "0.65rem", padding: "2px 7px", borderRadius: 20, fontWeight: 700, border: "1px solid #bbf7d0" }}>
                        <i className="bi bi-check-circle-fill me-1" />RESPONDIDO
                      </span>
                    ) : (
                      <span style={{ background: "#fffbeb", color: "#b45309", fontSize: "0.65rem", padding: "2px 7px", borderRadius: 20, fontWeight: 700, border: "1px solid #fde68a" }}>
                        <i className="bi bi-hourglass-split me-1" />PENDIENTE
                      </span>
                    )}
                    {c.calificacion > 0 && (
                      <span style={{ color: "#f59e0b", fontSize: "0.8rem" }}>
                        {"★".repeat(c.calificacion)}{"☆".repeat(5 - c.calificacion)}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#aaa", whiteSpace: "nowrap" }}>{c.fecha}</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", marginBottom: 4 }}>
                  {c.asunto}
                </div>

                <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: 8 }}>
                  <i className="bi bi-person-circle me-1"></i>{c.usuario}
                  <span style={{ color: "#ccc", margin: "0 6px" }}>·</span>
                  <i className="bi bi-envelope me-1"></i>{c.email}
                  {c.telefono && (
                    <><span style={{ color: "#ccc", margin: "0 6px" }}>·</span><i className="bi bi-telephone me-1"></i>{c.telefono}</>
                  )}
                  {/* Solo el admin ve el restaurante (el personal ya sabe cuál es) */}
                  {isAdmin && c.restaurante && (
                    <><span style={{ color: "#ccc", margin: "0 6px" }}>·</span>
                    <span className="cm-restaurante-tag"><i className="bi bi-shop me-1" />{c.restaurante}</span></>
                  )}
                </div>

                {isOpen && (
                  <div
                    style={{ background: cfg.bg, borderRadius: 10, padding: "12px 14px", marginTop: 8 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p style={{ fontSize: "0.875rem", color: "#444", margin: 0, lineHeight: 1.6 }}>
                      {c.mensaje}
                    </p>

                    {/* Respuesta ya enviada */}
                    {tieneRespuesta && (
                      <div className="cm-respuesta-box mt-3">
                        <div className="cm-respuesta-header">
                          <i className="bi bi-check-circle-fill me-1" />
                          Respuesta del restaurante · {c.fechaRespuesta}
                        </div>
                        <div className="cm-respuesta-text">{c.respuestaRestaurante}</div>
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-3">
                      <button
                        style={{
                          padding: "7px 16px", borderRadius: 8, border: "none",
                          background: tieneRespuesta ? "#f0fdf4" : "linear-gradient(135deg, #F4956A, #e07d52)",
                          color: tieneRespuesta ? "#16a34a" : "white",
                          fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                          boxShadow: tieneRespuesta ? "none" : "0 2px 8px rgba(244,149,106,0.3)",
                          border: tieneRespuesta ? "1px solid #bbf7d0" : "none",
                        }}
                        onClick={(e) => { e.stopPropagation(); abrirModalRespuesta(c); }}
                      >
                        <i className={`bi ${tieneRespuesta ? "bi-pencil-square" : "bi-reply-fill"}`}></i>
                        {tieneRespuesta ? "Editar respuesta" : "Responder"}
                      </button>
                      {isAdmin && (
                        <button
                          style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: "#e2e8f0", color: "#475569", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}
                          onClick={(e) => { e.stopPropagation(); archivarComentario(c.id); }}
                        >
                          <i className="bi bi-archive me-1"></i>Archivar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Comments;