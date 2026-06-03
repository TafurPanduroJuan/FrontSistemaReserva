import React, { useState, useEffect } from "react";
import { useTables } from "../../context/TablesContext";
import { useRestaurants } from "../../context/RestaurantsContext";
import { useAuth } from "../../context/AuthContext";

const ESTADO_CONFIG = {
  pendiente:         { label: "Pendiente",             color: "#f59e0b", bg: "#fffaf0", icon: "bi-clock" },
  confirmada:        { label: "Confirmada",             color: "#22c55e", bg: "#f0fdf4", icon: "bi-check-circle-fill" },
  cancelada:         { label: "Cancelada",              color: "#dc3545", bg: "#fff5f5", icon: "bi-x-circle-fill" },
  cancelada_cliente: { label: "Cancelada por cliente",  color: "#7c3aed", bg: "#f5f3ff", icon: "bi-person-x-fill" },
};

const LABEL_FILTRO = {
  todos: "Todos",
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  cancelada_cliente: "Canc. Cliente",
};

function Bookings() {
  const { reservas, cargandoReservas, cargarReservas, cambiarEstadoReserva } = useTables();
  const { restaurantes: restaurantesCtx } = useRestaurants();
  const { user, isAdmin } = useAuth();

  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState("");

  // Para personal: filtrar por su restaurante asignado (buscamos por nombre en la lista)
  const restaurantePersonal = restaurantesCtx.find(
    (r) => r.nombre === user?.restaurante
  );

  const listaRestaurantes = isAdmin
    ? restaurantesCtx
    : (restaurantePersonal ? [restaurantePersonal] : []);

  const [restauranteActivo, setRestauranteActivo] = useState(null);

  // Inicializar restaurante activo
  useEffect(() => {
    if (listaRestaurantes.length > 0 && !restauranteActivo) {
      setRestauranteActivo(listaRestaurantes[0]);
    }
  }, [listaRestaurantes]);

  // Cargar reservas cuando cambia el restaurante activo
  useEffect(() => {
    if (restauranteActivo?.id) {
      cargarReservas(restauranteActivo.id, fechaFiltro || null, null);
    }
  }, [restauranteActivo]);

  // Recargar cuando cambia la fecha
  useEffect(() => {
    if (restauranteActivo?.id) {
      cargarReservas(restauranteActivo.id, fechaFiltro || null, null);
    }
  }, [fechaFiltro]);

  const filtradas = reservas.filter((r) => {
    const matchEstado = filtroEstado === "todos" || r.estado === filtroEstado;
    return matchEstado;
  });

  const obtenerConteo = (estado) =>
    reservas.filter((r) =>
      estado === "todos" || r.estado === estado
    ).length;

  const handleCambiarRestaurante = (rest) => {
    setRestauranteActivo(rest);
  };

  return (
    <>
      <style>{`
        .rv-page { padding: 24px; background: #fdfdfd; min-height: 100%; }
        .rv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #eee; flex-wrap: wrap; gap: 16px; }
        .rv-title { font-weight: 800; color: #1a1a2e; font-size: 1.6rem; margin: 0; }
        .rv-title span { color: #F4956A; }
        .rv-subtitle { color: #888; font-size: 0.88rem; margin: 5px 0 0; }
        .rv-filtro-local { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
        .rv-filtro-label { font-size: 0.63rem; font-weight: 800; color: #F4956A; letter-spacing: 1px; }
        .rv-select-local { padding: 9px 14px; border-radius: 11px; border: 2px solid #F4956A; font-weight: 700; outline: none; cursor: pointer; font-size: 0.88rem; font-family: inherit; background: white; color: #1a1a2e; }
        .rv-locked-badge { background: #fff8ee; color: #F4956A; border: 2px solid #F4956A; border-radius: 11px; padding: 9px 14px; font-weight: 700; display: flex; align-items: center; gap: 7px; font-size: 0.88rem; }
        .rv-stat-card { background: white; border-radius: 16px; padding: 16px 18px; display: flex; align-items: center; border: 1px solid transparent; box-shadow: 0 3px 10px rgba(0,0,0,0.04); }
        .rv-stat-icon { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; margin-right: 13px; flex-shrink: 0; }
        .rv-stat-num { margin: 0; font-size: 1.35rem; font-weight: 800; color: #1a1a2e; line-height: 1; }
        .rv-stat-label { margin: 0; font-size: 0.72rem; color: #999; font-weight: 600; }
        .rv-filtros { background: #f8f9fa; padding: 14px 16px; border-radius: 14px; display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
        .rv-filter-btns { display: flex; gap: 7px; flex-wrap: wrap; }
        .rv-filter-btn { padding: 7px 13px; border-radius: 9px; border: none; font-size: 0.78rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .rv-filter-btn.active { background: #1a1a2e; color: white; }
        .rv-filter-btn:not(.active) { background: white; color: #666; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
        .rv-date-group { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-wrap: wrap; }
        .rv-date-input { padding: 7px 11px; border-radius: 9px; border: 1.5px solid #e8e0d8; font-size: 0.83rem; outline: none; font-weight: 600; font-family: inherit; }
        .rv-clear-date { background: none; border: none; color: #F4956A; cursor: pointer; font-weight: 700; font-size: 0.8rem; }
        .rv-card { background: white; border-radius: 18px; padding: 22px; border: 1px solid #eee; border-left-width: 5px; box-shadow: 0 3px 12px rgba(0,0,0,0.03); position: relative; }
        .rv-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; flex-wrap: wrap; gap: 10px; }
        .rv-cliente-wrap { display: flex; gap: 13px; align-items: center; }
        .rv-avatar { width: 46px; height: 46px; background: #f0f0f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: #1a1a2e; font-weight: 800; flex-shrink: 0; }
        .rv-nombre { font-weight: 800; font-size: 1rem; color: #1a1a2e; }
        .rv-contacto { font-size: 0.73rem; color: #aaa; font-weight: 600; }
        .rv-estado-badge { padding: 5px 13px; border-radius: 10px; font-size: 0.68rem; font-weight: 800; text-transform: uppercase; white-space: nowrap; }
        .rv-info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
        .rv-info-cell { background: #fdfdfd; border: 1px solid #f0ebe4; border-radius: 10px; padding: 9px; text-align: center; }
        .rv-info-icon { font-size: 0.85rem; color: #F4956A; display: block; margin-bottom: 4px; }
        .rv-info-val { font-size: 0.78rem; font-weight: 800; color: #1a1a2e; display: block; }
        .rv-info-lbl { font-size: 0.58rem; color: #bbb; font-weight: 700; text-transform: uppercase; display: block; }
        .rv-notas { background: #fffaf0; border: 1px dashed #ff9f22; border-radius: 11px; padding: 11px 14px; font-size: 0.8rem; color: #92400e; margin-bottom: 16px; line-height: 1.5; }
        .rv-acciones { display: flex; gap: 8px; flex-wrap: wrap; }
        .rv-btn-confirmar { flex: 2; min-width: 120px; padding: 9px; border-radius: 11px; border: none; background: #22c55e; color: white; font-weight: 700; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 5px; transition: opacity 0.2s; }
        .rv-btn-confirmar:hover { opacity: 0.88; }
        .rv-btn-cancelar-res { flex: 1; min-width: 80px; padding: 9px; border-radius: 11px; border: none; background: #fee2e2; color: #dc3545; font-weight: 700; cursor: pointer; font-size: 0.8rem; transition: opacity 0.2s; }
        .rv-btn-cancelar-res:hover { opacity: 0.82; }
        .rv-btn-anular { width: 100%; padding: 9px; border-radius: 11px; border: 1.5px solid #fee2e2; background: white; color: #dc3545; font-weight: 700; cursor: pointer; font-size: 0.8rem; transition: background 0.2s; }
        .rv-btn-anular:hover { background: #fff5f5; }
        .rv-empty { text-align: center; padding: 60px 20px; color: #aaa; background: white; border-radius: 16px; }
        @media (max-width: 768px) {
          .rv-page { padding: 12px; }
          .rv-header { flex-direction: column; align-items: flex-start; }
          .rv-filtro-local { align-items: flex-start; }
          .rv-info-grid { grid-template-columns: repeat(2, 1fr); }
          .rv-date-group { margin-left: 0; width: 100%; }
        }
        @media (max-width: 480px) {
          .rv-title { font-size: 1.3rem; }
          .rv-info-grid { grid-template-columns: repeat(2, 1fr); }
          .rv-filter-btns { gap: 5px; }
          .rv-filter-btn { padding: 6px 10px; font-size: 0.73rem; }
        }
      `}</style>

      <div className="rv-page">

        {/* Encabezado */}
        <div className="rv-header">
          <div>
            <h2 className="rv-title">Libro de <span>Reservas</span></h2>
            <p className="rv-subtitle">Gestiona las visitas para {restauranteActivo?.nombre || "—"}</p>
          </div>
          <div className="rv-filtro-local">
            <span className="rv-filtro-label">FILTRAR POR LOCAL</span>
            {isAdmin ? (
              <select
                className="rv-select-local"
                value={restauranteActivo?.id || ""}
                onChange={(e) => {
                  const found = restaurantesCtx.find((r) => String(r.id) === e.target.value);
                  if (found) handleCambiarRestaurante(found);
                }}
              >
                {listaRestaurantes.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
              </select>
            ) : (
              <span className="rv-locked-badge">
                <i className="bi bi-lock-fill" style={{ fontSize: "0.78rem" }} />
                {restauranteActivo?.nombre || "—"}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {Object.entries(ESTADO_CONFIG).map(([k, v]) => (
            <div className="col-6 col-md-3" key={k}>
              <div className="rv-stat-card" style={{ borderColor: `${v.color}22` }}>
                <div className="rv-stat-icon" style={{ background: v.bg }}>
                  <i className={`bi ${v.icon}`} style={{ fontSize: "1.1rem", color: v.color }}></i>
                </div>
                <div>
                  <h3 className="rv-stat-num">{obtenerConteo(k)}</h3>
                  <p className="rv-stat-label">{v.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="rv-filtros">
          <div className="rv-filter-btns">
            {["todos", "pendiente", "confirmada", "cancelada", "cancelada_cliente"].map((f) => (
              <button
                key={f}
                className={`rv-filter-btn ${filtroEstado === f ? "active" : ""}`}
                onClick={() => setFiltroEstado(f)}
              >
                {LABEL_FILTRO[f]} ({obtenerConteo(f === "todos" ? "todos" : f)})
              </button>
            ))}
          </div>
          <div className="rv-date-group">
            <i className="bi bi-funnel text-muted"></i>
            <input
              type="date"
              className="rv-date-input"
              value={fechaFiltro}
              onChange={(e) => setFechaFiltro(e.target.value)}
            />
            {fechaFiltro && (
              <button className="rv-clear-date" onClick={() => setFechaFiltro("")}>Limpiar</button>
            )}
          </div>
        </div>

        {/* Cargando */}
        {cargandoReservas && (
          <div className="rv-empty">
            <div className="spinner-border text-warning" role="status"></div>
            <p className="mt-3">Cargando reservas...</p>
          </div>
        )}

        {/* Tarjetas */}
        {!cargandoReservas && (
          <div className="row g-3">
            {filtradas.length === 0 && (
              <div className="col-12">
                <div className="rv-empty">
                  <i className="bi bi-calendar-x" style={{ fontSize: "2.8rem", display: "block", marginBottom: 12 }}></i>
                  <p>No hay reservas para este filtro.</p>
                </div>
              </div>
            )}
            {filtradas.map((r) => {
              const ec = ESTADO_CONFIG[r.estado] || ESTADO_CONFIG["cancelada"];
              return (
                <div className="col-12 col-xl-6" key={r.id}>
                  <div className="rv-card" style={{ borderLeftColor: ec.color }}>
                    <div className="rv-card-top">
                      <div className="rv-cliente-wrap">
                        <div className="rv-avatar">{r.cliente?.charAt(0) || "?"}</div>
                        <div>
                          <div className="rv-nombre">{r.cliente}</div>
                          <div className="rv-contacto">{r.email} · {r.tel}</div>
                        </div>
                      </div>
                      <span className="rv-estado-badge" style={{ background: ec.bg, color: ec.color }}>
                        <i className={`bi ${ec.icon} me-1`}></i>{ec.label}
                      </span>
                    </div>

                    <div className="rv-info-grid">
                      {[
                        { icon: "bi-calendar-event", val: r.fecha,          label: "Fecha" },
                        { icon: "bi-clock",           val: r.hora,           label: "Hora" },
                        { icon: "bi-people",          val: `${r.personas}p`, label: "Personas" },
                        { icon: "bi-hash",            val: r.mesaNumero ? `Mesa ${r.mesaNumero}${r.zona ? " · " + r.zona : ""}` : "—", label: "Ubicación" },
                      ].map((item, i) => (
                        <div key={i} className="rv-info-cell">
                          <i className={`bi ${item.icon} rv-info-icon`}></i>
                          <span className="rv-info-val">{item.val}</span>
                          <span className="rv-info-lbl">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    {r.notas && (
                      <div className="rv-notas">
                        <strong>Observaciones:</strong> {r.notas}
                      </div>
                    )}

                    <div className="rv-acciones">
                      {r.estado === "pendiente" && (
                        <>
                          <button
                            className="rv-btn-confirmar"
                            onClick={() => cambiarEstadoReserva(r.id, "confirmada")}
                          >
                            <i className="bi bi-check2-all"></i>Confirmar Reserva
                          </button>
                          <button
                            className="rv-btn-cancelar-res"
                            onClick={() => cambiarEstadoReserva(r.id, "cancelada")}
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {r.estado === "confirmada" && (
                        <button
                          className="rv-btn-anular"
                          onClick={() => cambiarEstadoReserva(r.id, "cancelada")}
                        >
                          Anular Confirmación
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Bookings;
