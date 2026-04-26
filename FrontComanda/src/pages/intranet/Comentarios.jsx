import React, { useState } from "react";

const mockComentarios = [
  { id: 1, usuario: "María López", email: "maria@gmail.com", tipo: "comentario", asunto: "Experiencia de reserva", mensaje: "¡Excelente plataforma! Encontré mi restaurante favorito fácilmente. El proceso de reserva fue muy intuitivo.", fecha: "2026-04-23", restaurante: "Sushi Take", leido: false },
  { id: 2, usuario: "Roberto Silva", email: "roberto@gmail.com", tipo: "reclamo", asunto: "Reserva no confirmada", mensaje: "La reserva no fue confirmada a tiempo. Tuve que esperar 30 minutos en el restaurante sin que nadie me atendiera.", fecha: "2026-04-22", restaurante: "La Bella Italia", leido: false },
  { id: 3, usuario: "Lucía Fernández", email: "lucia@gmail.com", tipo: "experiencia", asunto: "Muy buena experiencia", mensaje: "Muy buena experiencia reservando. El proceso fue sencillo y rápido. La confirmación llegó en minutos.", fecha: "2026-04-21", restaurante: "El Huarike", leido: true },
  { id: 4, usuario: "Diego Quispe", email: "diego@gmail.com", tipo: "reclamo", asunto: "Restaurante cerrado", mensaje: "El restaurante estaba cerrado cuando llegué, pero la reserva estaba confirmada. Mala coordinación.", fecha: "2026-04-20", restaurante: "Mar y Tierra", leido: true },
  { id: 5, usuario: "Camila Torres", email: "camila@gmail.com", tipo: "comentario", asunto: "Sugerencia de mejora", mensaje: "Sería genial poder filtrar por precio promedio del restaurante. El diseño de la web me encanta.", fecha: "2026-04-19", restaurante: null, leido: true },
  { id: 6, usuario: "Andrés Paredes", email: "andres@gmail.com", tipo: "experiencia", asunto: "Cena romántica perfecta", mensaje: "Reservé para una cena especial y todo salió perfecto. Gracias a Comanda por facilitar todo.", fecha: "2026-04-18", restaurante: "La Trattoria", leido: false },
];

const tipoConfig = {
  comentario: { label: "Comentario", icon: "bi-chat-left-text", color: "#3b82f6", bg: "#eff6ff" },
  reclamo:    { label: "Reclamo",    icon: "bi-exclamation-triangle", color: "#ef4444", bg: "#fef2f2" },
  experiencia:{ label: "Experiencia",icon: "bi-star-fill", color: "#f59e0b", bg: "#fffbeb" },
};

function Comentarios() {
  const [comentarios, setComentarios] = useState(mockComentarios);
  const [filtro, setFiltro] = useState("todos");
  const [expandido, setExpandido] = useState(null);

  const filtrados = comentarios.filter(c => filtro === "todos" || c.tipo === filtro);

  const marcarLeido = (id) => {
    setComentarios(prev => prev.map(c => c.id === id ? { ...c, leido: true } : c));
  };

  return (
    <div>
      <div className="intra-page-header">
        <div className="intra-page-title">
          <i className="bi bi-chat-square-text"></i>
          Mensajes de Contáctanos
        </div>
        <div className="d-flex gap-2">
          {Object.entries(tipoConfig).map(([k, v]) => (
            <span key={k} style={{ background: v.bg, color: v.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
              <i className={`bi ${v.icon} me-1`}></i>
              {comentarios.filter(c => c.tipo === k).length} {v.label}s
            </span>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {["todos", "comentario", "reclamo", "experiencia"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            style={{
              padding: "6px 16px", borderRadius: 20,
              border: `2px solid ${filtro === f ? "transparent" : "#e8e0d8"}`,
              background: filtro === f ? "linear-gradient(135deg,#ff9f22,#ff3300)" : "white",
              color: filtro === f ? "white" : "#555",
              fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="row g-3">
        {filtrados.map(c => {
          const cfg = tipoConfig[c.tipo];
          const isOpen = expandido === c.id;
          return (
            <div className="col-12 col-lg-6" key={c.id}>
              <div
                className="intra-card p-4"
                style={{ borderLeft: `4px solid ${cfg.color}`, cursor: "pointer", opacity: c.leido ? 0.85 : 1 }}
                onClick={() => { setExpandido(isOpen ? null : c.id); marcarLeido(c.id); }}
              >
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700 }}>
                      <i className={`bi ${cfg.icon} me-1`}></i>{cfg.label}
                    </span>
                    {!c.leido && <span style={{ background: "#ff3300", color: "white", fontSize: "0.65rem", padding: "2px 7px", borderRadius: 20, fontWeight: 700 }}>NUEVO</span>}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{c.fecha}</span>
                </div>

                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1a2e", marginBottom: 4 }}>{c.asunto}</div>
                <div style={{ fontSize: "0.8rem", color: "#666", marginBottom: 8 }}>
                  <i className="bi bi-person-circle me-1"></i>{c.usuario}
                  <span style={{ color: "#ccc", margin: "0 6px" }}>·</span>
                  <i className="bi bi-envelope me-1"></i>{c.email}
                  {c.restaurante && (
                    <>
                      <span style={{ color: "#ccc", margin: "0 6px" }}>·</span>
                      <i className="bi bi-shop me-1"></i>{c.restaurante}
                    </>
                  )}
                </div>

                {isOpen && (
                  <div style={{ background: cfg.bg, borderRadius: 10, padding: "12px 14px", marginTop: 8 }}>
                    <p style={{ fontSize: "0.875rem", color: "#444", margin: 0, lineHeight: 1.6 }}>{c.mensaje}</p>
                    <div className="d-flex gap-2 mt-3">
                      <button style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: "#d1fae5", color: "#065f46", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                        <i className="bi bi-reply me-1"></i>Responder
                      </button>
                      <button style={{ padding: "5px 14px", borderRadius: 8, border: "none", background: "#e2e8f0", color: "#475569", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
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