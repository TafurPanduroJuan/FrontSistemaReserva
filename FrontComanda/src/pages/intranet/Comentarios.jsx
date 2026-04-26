import { useState } from "react";

// ▸ CONEXIÓN A LA INTRANET
// Ya no usamos datos mock hardcodeados.
// Leemos los comentarios desde el Context, que se alimenta del formulario público
// y persiste todo en localStorage automáticamente.
import { useComentarios } from "../../context/ComentariosContext";

const tipoConfig = {
  comentario:  { label: "Comentario",  icon: "bi-chat-left-text",      color: "#3b82f6", bg: "#eff6ff" },
  reclamo:     { label: "Reclamo",     icon: "bi-exclamation-triangle", color: "#ef4444", bg: "#fef2f2" },
  experiencia: { label: "Experiencia", icon: "bi-star-fill",            color: "#f59e0b", bg: "#fffbeb" },
};

function Comentarios() {
  // ▸ CONEXIÓN A LA INTRANET — datos en tiempo real desde el Context
  const { comentarios, marcarLeido, archivarComentario } = useComentarios();

  const [filtro, setFiltro] = useState("todos");
  const [expandido, setExpandido] = useState(null);

  const filtrados = comentarios.filter(
    (c) => filtro === "todos" || c.tipo === filtro
  );

  const handleExpandir = (id) => {
    setExpandido((prev) => (prev === id ? null : id));
    marcarLeido(id); // marca como leído al abrir
  };

  return (
    <div>
      <div className="intra-page-header">
        <div className="intra-page-title">
          <i className="bi bi-chat-square-text"></i>
          Mensajes de Contáctanos
        </div>

        {/* Contadores por tipo */}
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
              background:
                filtro === f
                  ? "linear-gradient(135deg,#ff9f22,#ff3300)"
                  : "white",
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

      {/* Lista vacía */}
      {filtrados.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#aaa",
            fontSize: "0.9rem",
          }}
        >
          <i className="bi bi-inbox" style={{ fontSize: "2.5rem", display: "block", marginBottom: 12 }}></i>
          No hay mensajes{filtro !== "todos" ? ` de tipo "${filtro}"` : ""} aún.
        </div>
      )}

      {/* Cards de comentarios */}
      <div className="row g-3">
        {filtrados.map((c) => {
          const cfg = tipoConfig[c.tipo] || tipoConfig.comentario;
          const isOpen = expandido === c.id;

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
                {/* Cabecera: tipo + badge NUEVO + fecha */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        background: cfg.bg,
                        color: cfg.color,
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: "0.75rem",
                        fontWeight: 700,
                      }}
                    >
                      <i className={`bi ${cfg.icon} me-1`}></i>
                      {cfg.label}
                    </span>
                    {!c.leido && (
                      <span
                        style={{
                          background: "#ff3300",
                          color: "white",
                          fontSize: "0.65rem",
                          padding: "2px 7px",
                          borderRadius: 20,
                          fontWeight: 700,
                        }}
                      >
                        NUEVO
                      </span>
                    )}
                    {/* Calificación si existe */}
                    {c.calificacion > 0 && (
                      <span style={{ color: "#f59e0b", fontSize: "0.8rem" }}>
                        {"★".repeat(c.calificacion)}{"☆".repeat(5 - c.calificacion)}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#aaa" }}>
                    {c.fecha}
                  </span>
                </div>

                {/* Asunto */}
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    color: "#1a1a2e",
                    marginBottom: 4,
                  }}
                >
                  {c.asunto}
                </div>

                {/* Datos del usuario y restaurante */}
                <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: 8 }}>
                  <i className="bi bi-person-circle me-1"></i>
                  {c.usuario}
                  <span style={{ color: "#ccc", margin: "0 6px" }}>·</span>
                  <i className="bi bi-envelope me-1"></i>
                  {c.email}
                  {c.telefono && (
                    <>
                      <span style={{ color: "#ccc", margin: "0 6px" }}>·</span>
                      <i className="bi bi-telephone me-1"></i>
                      {c.telefono}
                    </>
                  )}
                  {c.restaurante && (
                    <>
                      <span style={{ color: "#ccc", margin: "0 6px" }}>·</span>
                      <i className="bi bi-shop me-1"></i>
                      {c.restaurante}
                    </>
                  )}
                </div>

                {/* Cuerpo expandido */}
                {isOpen && (
                  <div
                    style={{
                      background: cfg.bg,
                      borderRadius: 10,
                      padding: "12px 14px",
                      marginTop: 8,
                    }}
                    onClick={(e) => e.stopPropagation()} // evita cerrar al hacer click dentro
                  >
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#444",
                        margin: 0,
                        lineHeight: 1.6,
                      }}
                    >
                      {c.mensaje}
                    </p>
                    <div className="d-flex gap-2 mt-3">
                      <button
                        style={{
                          padding: "5px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: "#d1fae5",
                          color: "#065f46",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Aquí puedes abrir un modal de respuesta por correo
                          window.location.href = `mailto:${c.email}?subject=Re: ${c.asunto}`;
                        }}
                      >
                        <i className="bi bi-reply me-1"></i>Responder
                      </button>
                      <button
                        style={{
                          padding: "5px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: "#e2e8f0",
                          color: "#475569",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          archivarComentario(c.id); // lo elimina de la lista
                        }}
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

export default Comentarios;