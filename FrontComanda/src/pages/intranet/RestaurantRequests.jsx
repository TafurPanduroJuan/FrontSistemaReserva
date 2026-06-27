import React, { useState } from "react";
import { useRestaurants } from "../../context/RestaurantsContext";

function RestaurantRequests() {
  const { solicitudes, aceptarSolicitud, rechazarSolicitud } = useRestaurants();
  const [filtro, setFiltro] = useState("todos");
  const [confirmando, setConfirmando] = useState(null);

  // Modal de rechazo con motivo
  const [modalRechazo, setModalRechazo] = useState(null); // { id, nombre, email }
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [rechazando, setRechazando] = useState(false);

  const filtradas = solicitudes.filter(
    (s) => filtro === "todos" || s.estado === filtro
  );

  const handleAceptar = (id) => {
    setConfirmando(id);
    aceptarSolicitud(id);
    setTimeout(() => setConfirmando(null), 1200);
  };

  const abrirModalRechazo = (s) => {
    setMotivoRechazo("");
    setModalRechazo({ id: s.id, nombre: s.nombre, email: s.email });
  };

  const confirmarRechazo = async () => {
    if (!modalRechazo) return;
    setRechazando(true);
    try {
      await rechazarSolicitud(modalRechazo.id, motivoRechazo.trim() || null);
      setModalRechazo(null);
      setMotivoRechazo("");
    } catch (e) {
      console.error(e);
    } finally {
      setRechazando(false);
    }
  };

  return (
    <div>
      {/* Modal de rechazo con motivo */}
      {modalRechazo && (
        <div className="rq-modal-overlay" onClick={() => setModalRechazo(null)}>
          <div className="rq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rq-modal-icon">
              <i className="bi bi-x-circle-fill" style={{ color: "#dc3545", fontSize: "2rem" }} />
            </div>
            <h4 className="rq-modal-title">Rechazar solicitud</h4>
            <p className="rq-modal-sub">
              <strong>{modalRechazo.nombre}</strong> — el solicitante recibirá un email
              a <strong>{modalRechazo.email}</strong> con la notificación del rechazo.
            </p>
            <label className="rq-modal-label">Motivo del rechazo</label>
            <textarea
              className="rq-modal-textarea"
              placeholder="Ej: La documentación está incompleta, la dirección no corresponde a la zona de servicio..."
              value={motivoRechazo}
              onChange={(e) => setMotivoRechazo(e.target.value)}
              autoFocus
            />
            <p className="rq-modal-hint">
              <i className="bi bi-info-circle me-1" />
              El motivo es opcional pero ayuda al solicitante a saber qué corregir.
            </p>
            <div className="rq-modal-btns">
              <button
                className="rq-modal-btn-cancel"
                onClick={() => setModalRechazo(null)}
                disabled={rechazando}
              >
                Volver
              </button>
              <button
                className="rq-modal-btn-confirm"
                onClick={confirmarRechazo}
                disabled={rechazando}
              >
                {rechazando
                  ? <><span className="spinner-border spinner-border-sm me-1" />Rechazando...</>
                  : <><i className="bi bi-x-circle me-1" />Confirmar rechazo</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="intra-page-header">
        <div className="intra-page-title">
          <i className="bi bi-shop-window"></i>
          Solicitudes de Restaurantes
        </div>
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {["todos", "pendiente", "aceptado", "rechazado"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`filtro-btn ${filtro === f ? "active" : ""}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ms-2 filtro-count">
              {f === "todos"
                ? solicitudes.length
                : solicitudes.filter((s) => s.estado === f).length}
            </span>
          </button>
        ))}
      </div>

      <div className="row g-3">
        {filtradas.map((s) => (
          <div className="col-12 col-lg-6" key={s.id}>
            <div className={`intra-card solicitud-card ${s.estado}`}>
              <div className="solicitud-img-wrapper">
                {s.imagen && (
                  <img src={s.imagen} alt={s.nombre} className="solicitud-img" />
                )}
                {!s.imagen && (
                  <div className="solicitud-img-fallback">
                    <i className="bi bi-shop" style={{ fontSize: "2rem", color: "#ccc" }}></i>
                  </div>
                )}
                <span className={`status-badge-img badge-${s.estado}`}>
                  {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
                </span>
              </div>

              <div className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "#1a1a2e" }}>
                      {s.nombre}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 2 }}>
                      <i className="bi bi-tag me-1"></i>{s.tipo} ·{" "}
                      <i className="bi bi-geo-alt me-1"></i>{s.ciudad}
                    </div>
                  </div>
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
                    <button
                      className="btn-accion btn-aceptar flex-fill"
                      onClick={() => handleAceptar(s.id)}
                      disabled={confirmando === s.id}
                    >
                      <i className={`bi ${confirmando === s.id ? "bi-check-circle-fill" : "bi-check-circle"} me-1`}></i>
                      {confirmando === s.id ? "Aceptado ✓" : "Aceptar"}
                    </button>
                    <button
                      className="btn-accion btn-rechazar flex-fill"
                      onClick={() => abrirModalRechazo(s)}
                    >
                      <i className="bi bi-x-circle me-1"></i> Rechazar
                    </button>
                  </div>
                )}

                {s.estado === "aceptado" && (
                  <div className="estado-info estado-aceptado">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Restaurante agregado a Restaurantes Registrados
                  </div>
                )}

                {s.estado === "rechazado" && (
                  <div className="estado-info estado-rechazado">
                    <i className="bi bi-x-circle-fill me-2"></i>
                    Solicitud rechazada — se notificó al solicitante
                  </div>
                )}
              </div>
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
        .filtro-btn { padding:6px 16px; border-radius:20px; border:2px solid #e8e0d8; background:white; font-size:0.82rem; font-weight:600; cursor:pointer; display:flex; align-items:center; transition:all 0.2s; color:#555; }
        .filtro-btn:hover { border-color:#ff9f22; color:#ff6b00; }
        .filtro-btn.active { background:#F4956A; color:white; border-color:transparent; }
        .filtro-count { background:rgba(0,0,0,0.1); border-radius:10px; padding:1px 7px; font-size:0.75rem; }
        .filtro-btn.active .filtro-count { background:rgba(255,255,255,0.25); }
        .solicitud-card { overflow:hidden; border-radius:16px; }
        .solicitud-card.aceptado { border-left:4px solid #22c55e; }
        .solicitud-card.rechazado { border-left:4px solid #ef4444; }
        .solicitud-card.pendiente { border-left:4px solid #f59e0b; }
        .solicitud-img-wrapper { position:relative; width:100%; height:160px; background:#f0f0f0; overflow:hidden; }
        .solicitud-img { width:100%; height:100%; object-fit:cover; display:block; }
        .solicitud-img-fallback { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#f5f5f5; }
        .status-badge-img { position:absolute; top:10px; right:10px; padding:3px 10px; border-radius:20px; font-size:0.72rem; font-weight:700; }
        .badge-pendiente { background:#fef3c7; color:#92400e; }
        .badge-aceptado  { background:#d1fae5; color:#065f46; }
        .badge-rechazado { background:#fee2e2; color:#991b1b; }
        .solicit-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:4px 14px; font-size:0.8rem; color:#666; margin-bottom:6px; }
        .btn-accion { padding:8px 14px; border-radius:8px; border:none; font-size:0.82rem; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; gap:5px; transition:all 0.2s; }
        .btn-accion:disabled { opacity:0.7; cursor:default; }
        .btn-aceptar  { background:#d1fae5; color:#065f46; }
        .btn-rechazar { background:#fee2e2; color:#991b1b; }
        .btn-accion:not(:disabled):hover { transform:scale(1.03); }
        .estado-info { padding:8px 14px; border-radius:8px; font-size:0.82rem; font-weight:600; display:flex; align-items:center; }
        .estado-aceptado { background:#d1fae5; color:#065f46; }
        .estado-rechazado { background:#fee2e2; color:#991b1b; }
        /* Modal */
        .rq-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; }
        .rq-modal { background:white; border-radius:20px; padding:28px; max-width:480px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,0.2); text-align:center; }
        .rq-modal-icon { margin-bottom:12px; }
        .rq-modal-title { font-weight:800; font-size:1.15rem; color:#1a1a2e; margin:0 0 6px; }
        .rq-modal-sub { font-size:0.83rem; color:#666; margin:0 0 20px; text-align:left; background:#fff8f8; border-radius:8px; padding:10px 14px; }
        .rq-modal-label { font-size:0.75rem; font-weight:800; color:#555; text-transform:uppercase; letter-spacing:0.5px; display:block; text-align:left; margin-bottom:6px; }
        .rq-modal-textarea { width:100%; border:1.5px solid #e0d8d0; border-radius:11px; padding:11px 14px; font-size:0.85rem; font-family:inherit; resize:vertical; min-height:90px; outline:none; transition:border-color 0.2s; box-sizing:border-box; }
        .rq-modal-textarea:focus { border-color:#dc3545; }
        .rq-modal-hint { font-size:0.72rem; color:#aaa; margin:6px 0 20px; text-align:left; }
        .rq-modal-btns { display:flex; gap:10px; }
        .rq-modal-btn-cancel { flex:1; padding:10px; border-radius:11px; border:1.5px solid #e0e0e0; background:white; color:#666; font-weight:700; cursor:pointer; font-size:0.85rem; }
        .rq-modal-btn-confirm { flex:2; padding:10px; border-radius:11px; border:none; background:#dc3545; color:white; font-weight:700; cursor:pointer; font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:6px; }
        .rq-modal-btn-confirm:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>
    </div>
  );
}

export default RestaurantRequests;