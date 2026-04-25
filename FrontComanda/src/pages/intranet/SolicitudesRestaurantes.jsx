import React, { useState } from "react";

const mockSolicitudes = [
  { id: 1, nombre: "El Rincón Criollo", propietario: "Carlos Mamani", email: "carlos@gmail.com", tipo: "Criolla", ciudad: "Miraflores", telefono: "987654321", descripcion: "Restaurante familiar con 20 años de tradición criolla.", fecha: "2026-04-20", estado: "pendiente" },
  { id: 2, nombre: "Sushi Fusion Lima", propietario: "Ana Takahashi", email: "ana@gmail.com", tipo: "Japonesa", ciudad: "San Isidro", telefono: "998877665", descripcion: "Fusión de cocina japonesa con toques peruanos únicos.", fecha: "2026-04-21", estado: "pendiente" },
  { id: 3, nombre: "La Trattoria", propietario: "Marco Rossi", email: "marco@labella.it", tipo: "Italiana", ciudad: "Barranco", telefono: "912345678", descripcion: "Pastas artesanales y pizzas al horno de leña.", fecha: "2026-04-22", estado: "pendiente" },
  { id: 4, nombre: "Mariscos Don Pedro", propietario: "Pedro Huanca", email: "pedro@mariscos.pe", tipo: "Mariscos", ciudad: "Chorrillos", telefono: "976543210", descripcion: "Los mejores ceviches y tiraditos de Lima.", fecha: "2026-04-18", estado: "aceptado" },
  { id: 5, nombre: "Veggie & Soul", propietario: "Sofía Vargas", email: "sofia@veggie.pe", tipo: "Vegana", ciudad: "Miraflores", telefono: "945612378", descripcion: "Cocina vegana de autor con ingredientes orgánicos.", fecha: "2026-04-15", estado: "rechazado" },
];

function SolicitudesRestaurantes() {
  const [solicitudes, setSolicitudes] = useState(mockSolicitudes);
  const [filtro, setFiltro] = useState("todos");
  const [selected, setSelected] = useState(null);

  const filtradas = solicitudes.filter(s => filtro === "todos" || s.estado === filtro);

  const handleAccion = (id, accion) => {
    setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: accion } : s));
    setSelected(null);
  };

  return (
    <div>
      <div className="intra-page-header">
        <div className="intra-page-title">
          <i className="bi bi-shop-window"></i>
          Solicitudes de Restaurantes
        </div>
      </div>

      {/* Filtros */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        {["todos", "pendiente", "aceptado", "rechazado"].map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`filtro-btn ${filtro === f ? "active" : ""}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ms-2 filtro-count">
              {f === "todos" ? solicitudes.length : solicitudes.filter(s => s.estado === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="row g-3">
        {filtradas.map(s => (
          <div className="col-12 col-lg-6" key={s.id}>
            <div className={`intra-card p-4 solicitud-card ${s.estado}`}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1a1a2e" }}>{s.nombre}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 2 }}>
                    <i className="bi bi-tag me-1"></i>{s.tipo} · <i className="bi bi-geo-alt me-1"></i>{s.ciudad}
                  </div>
                </div>
                <span className={`status-badge badge-${s.estado}`}>
                  {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
                </span>
              </div>

              <div className="solicit-detail-grid">
                <div><i className="bi bi-person me-1"></i><strong>Propietario:</strong> {s.propietario}</div>
                <div><i className="bi bi-envelope me-1"></i>{s.email}</div>
                <div><i className="bi bi-telephone me-1"></i>{s.telefono}</div>
                <div><i className="bi bi-calendar3 me-1"></i>Enviado: {s.fecha}</div>
              </div>

              <p style={{ fontSize: "0.83rem", color: "#666", fontStyle: "italic", margin: "10px 0 14px" }}>
                "{s.descripcion}"
              </p>

              {s.estado === "pendiente" && (
                <div className="d-flex gap-2">
                  <button className="btn-accion btn-aceptar flex-fill" onClick={() => handleAccion(s.id, "aceptado")}>
                    <i className="bi bi-check-circle me-1"></i> Aceptar
                  </button>
                  <button className="btn-accion btn-rechazar flex-fill" onClick={() => handleAccion(s.id, "rechazado")}>
                    <i className="bi bi-x-circle me-1"></i> Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filtradas.length === 0 && (
          <div className="col-12 text-center py-5 text-muted">
            <i className="bi bi-inbox" style={{ fontSize: "3rem" }}></i>
            <p className="mt-2">No hay solicitudes en este estado.</p>
          </div>
        )}
      </div>

      <style>{`
        .filtro-btn {
          padding: 6px 16px; border-radius: 20px; border: 2px solid #e8e0d8;
          background: white; font-size: 0.82rem; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; transition: all 0.2s; color: #555;
        }
        .filtro-btn:hover { border-color: #ff9f22; color: #ff6b00; }
        .filtro-btn.active { background: linear-gradient(135deg, #ff9f22, #ff3300); color: white; border-color: transparent; }
        .filtro-count { background: rgba(0,0,0,0.1); border-radius: 10px; padding: 1px 7px; font-size: 0.75rem; }
        .filtro-btn.active .filtro-count { background: rgba(255,255,255,0.25); }
        .solicit-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 14px; font-size: 0.8rem; color: #666; margin-bottom: 6px; }
        .btn-accion { padding: 8px 14px; border-radius: 8px; border: none; font-size: 0.82rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 5px; transition: all 0.2s; }
        .btn-aceptar  { background: #d1fae5; color: #065f46; }
        .btn-rechazar { background: #fee2e2; color: #991b1b; }
        .btn-accion:hover { transform: scale(1.03); }
        .solicitud-card.aceptado { border-left: 4px solid #22c55e; }
        .solicitud-card.rechazado { border-left: 4px solid #ef4444; }
        .solicitud-card.pendiente { border-left: 4px solid #f59e0b; }
      `}</style>
    </div>
  );
}
export default SolicitudesRestaurantes;