import { useState } from "react";
import { useComments } from "../../context/CommentsContext";

const tipoConfig = {
  comentario:  { label: "Comentario",  icon: "bi-chat-left-text",      color: "#3b82f6", bg: "#eff6ff" },
  reclamo:     { label: "Reclamo",     icon: "bi-exclamation-triangle", color: "#ef4444", bg: "#fef2f2" },
  experiencia: { label: "Experiencia", icon: "bi-star-fill",            color: "#f59e0b", bg: "#fffbeb" },
};

function Comments() {
  const { comentarios, marcarLeido, archivarComentario, responderComentario } = useComments();

  const [filtro, setFiltro] = useState("todos");
  const [expandido, setExpandido] = useState(null);

  // Estado para el modal de respuesta
  const [modalRespuesta, setModalRespuesta] = useState(null); // { comentario }
  const [textoRespuesta, setTextoRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [errorRespuesta, setErrorRespuesta] = useState("");

  const filtrados = comentarios.filter(
    (c) => filtro === "todos" || c.tipo === filtro
  );

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
        .cm-reply-textarea { width: 100%; border: 1.5px solid #e5e7eb; border-radius: 10px; padding: 10px 14px; font-size: 0.88rem; font-family: inherit; resize: vertical; min-height: 100px; outline: none; transition: border-color 0.2s; }
        .cm-reply-textarea:focus { border-color: #3b82f6; }
        .cm-reply-error { color: #dc3545; font-size: 0.78rem; margin-top: 4px; }
        .cm-reply-actions { display: flex; gap: 10px; margin-top: 16px; }
        .cm-reply-btn-cancel { flex: 1; padding: 10px; border-radius: 10px; border: 2px solid #e5e7eb; background: white; color: #555; font-weight: 700; cursor: pointer; font-size: 0.85rem; }
        .cm-reply-btn-send { flex: 2; padding: 10px; border-radius: 10px; border: none; background: #3b82f6; color: white; font-weight: 700; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .cm-reply-btn-send:disabled { opacity: 0.6; cursor: not-allowed; }
        .cm-respuesta-box { background: #eff6ff; border-left: 3px solid #3b82f6; border-radius: 8px; padding: 10px 14px; margin-top: 10px; font-size: 0.82rem; color: #1e40af; }
        .cm-respuesta-header { font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; opacity: 0.7; }
      `}</style>

      {/* Modal de respuesta */}
      {modalRespuesta && (
        <div className="cm-reply-overlay" onClick={() => setModalRespuesta(null)}>
          <div className="cm-reply-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cm-reply-modal-title">
              <i className="bi bi-reply me-2 text-primary" />
              Responder al cliente
            </div>
            <div className="cm-reply-modal-sub">
              {modalRespuesta.usuario} · {modalRespuesta.email}
            </div>

            <div className="cm-reply-orig">
              <strong>{modalRespuesta.asunto}</strong><br />
              {modalRespuesta.mensaje}
            </div>

            <label className="cm-reply-label">Tu respuesta</label>
            <textarea
              className="cm-reply-textarea"
              placeholder="Escribe aquí la respuesta del restaurante..."
              value={textoRespuesta}
              onChange={(e) => setTextoRespuesta(e.target.value)}
              maxLength={1000}
            />
            {errorRespuesta && <div className="cm-reply-error">{errorRespuesta}</div>}
            <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: 4 }}>
              {textoRespuesta.length}/1000 · El cliente recibirá una notificación por email
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
                  <><i className="bi bi-send me-1" />Enviar respuesta</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="intra-page-header">
        <div className="intra-page-title">
          <i className="bi bi-chat-square-text"></i>
          Mensajes de Contáctanos
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

      {/* Filtros */}
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
          No hay mensajes{filtro !== "todos" ? ` de tipo "${filtro}"` : ""} aún.
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
                  transition: "opacity 0.2s",
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
                    {tieneRespuesta && (
                      <span style={{ background: "#eff6ff", color: "#3b82f6", fontSize: "0.65rem", padding: "2px 7px", borderRadius: 20, fontWeight: 700, border: "1px solid #bfdbfe" }}>
                        <i className="bi bi-reply-fill me-1" />RESPONDIDO
                      </span>
                    )}
                    {c.calificacion > 0 && (
                      <span style={{ color: "#f59e0b", fontSize: "0.8rem" }}>
                        {"★".repeat(c.calificacion)}{"☆".repeat(5 - c.calificacion)}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{c.fecha}</span>
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
                  {c.restaurante && (
                    <><span style={{ color: "#ccc", margin: "0 6px" }}>·</span><i className="bi bi-shop me-1"></i>{c.restaurante}</>
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
                          <i className="bi bi-reply-fill me-1" />
                          Respuesta del restaurante · {c.fechaRespuesta}
                        </div>
                        {c.respuestaRestaurante}
                      </div>
                    )}

                    <div className="d-flex gap-2 mt-3">
                      <button
                        style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: "#dbeafe", color: "#1d4ed8", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                        onClick={(e) => { e.stopPropagation(); abrirModalRespuesta(c); }}
                      >
                        <i className="bi bi-reply me-1"></i>
                        {tieneRespuesta ? "Editar respuesta" : "Responder"}
                      </button>
                      <button
                        style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: "#e2e8f0", color: "#475569", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                        onClick={(e) => { e.stopPropagation(); archivarComentario(c.id); }}
                      >
                        <i className="bi bi-archive me-1"></i>Archivar
                      </button>
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