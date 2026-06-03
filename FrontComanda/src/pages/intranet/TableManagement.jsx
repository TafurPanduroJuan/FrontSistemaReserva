import React, { useState, useEffect } from "react";
import { useTables } from "../../context/TablesContext";
import { useRestaurants } from "../../context/RestaurantsContext";
import { useAuth } from "../../context/AuthContext";

const ESTADOS = {
  disponible: { label: "Disponible", color: "#10b981", bg: "#ecfdf5", icon: "bi-check-circle-fill" },
  reservada:  { label: "Reservada",  color: "#f59e0b", bg: "#fffbeb", icon: "bi-clock-fill" },
  ocupada:    { label: "Ocupada",    color: "#ef4444", bg: "#fef2f2", icon: "bi-person-fill" },
};

function TableManagement() {
  const { getMesas, crearMesa, eliminarMesa, mesasDesactualizadas, setMesasDesactualizadas } = useTables();
  const { restaurantes: restaurantesCtx } = useRestaurants();
  const { user, isAdmin } = useAuth();

  const [filtroZona, setFiltroZona] = useState("Todas");
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [msg, setMsg] = useState("");

  // Formulario para crear mesa
  const [showCrear, setShowCrear] = useState(false);
  const [formMesa, setFormMesa] = useState({ numero: "", capacidad: 2, zona: "Salón Interior", estado: "disponible" });
  const [creando, setCreando] = useState(false);

  const listaRestaurantes = isAdmin
    ? restaurantesCtx
    : restaurantesCtx.filter((r) => r.nombre === user?.restaurante);

  const [restauranteActivo, setRestauranteActivo] = useState(null);

  useEffect(() => {
    if (listaRestaurantes.length > 0 && !restauranteActivo) {
      setRestauranteActivo(listaRestaurantes[0]);
    }
    if (!isAdmin && user?.restaurante) {
      const found = restaurantesCtx.find((r) => r.nombre === user.restaurante);
      if (found) setRestauranteActivo(found);
    }
  }, [listaRestaurantes, isAdmin, user?.restaurante]);

  // Cargar mesas del restaurante activo
  useEffect(() => {
    if (restauranteActivo?.id) {
      loadMesas(restauranteActivo.id);
    }
  }, [restauranteActivo]);

  // Recargar mesas si una reserva fue cancelada desde Bookings
  useEffect(() => {
    if (mesasDesactualizadas && restauranteActivo?.id) {
      loadMesas(restauranteActivo.id);
      setMesasDesactualizadas(false);
    }
  }, [mesasDesactualizadas]);

  const loadMesas = async (restaurantId) => {
    setCargando(true);
    try {
      const data = await getMesas(restaurantId);
      setMesas(data);
    } catch (err) {
      notificar("❌ Error cargando mesas: " + err.message);
    } finally {
      setCargando(false);
    }
  };

  function notificar(texto) {
    setMsg(texto);
    setTimeout(() => setMsg(""), 3000);
  }

  const filtradas = mesas.filter((m) => filtroZona === "Todas" || m.zona === filtroZona);
  const zonas = ["Todas", ...new Set(mesas.map((m) => m.zona).filter(Boolean))];

  const conteos = Object.fromEntries(
    Object.keys(ESTADOS).map((e) => [e, mesas.filter((m) => m.estado === e).length])
  );

  const handleCrearMesa = async () => {
    if (!formMesa.numero || !restauranteActivo?.id) return;
    setCreando(true);
    try {
      await crearMesa(restauranteActivo.id, {
        numero: parseInt(formMesa.numero),
        capacidad: parseInt(formMesa.capacidad),
        zona: formMesa.zona,
        estado: formMesa.estado,
      });
      notificar("✅ Mesa creada correctamente");
      setShowCrear(false);
      setFormMesa({ numero: "", capacidad: 2, zona: "Salón Interior", estado: "disponible" });
      await loadMesas(restauranteActivo.id);
    } catch (err) {
      notificar("❌ " + err.message);
    } finally {
      setCreando(false);
    }
  };

  const handleEliminar = async (mesaId) => {
    if (!window.confirm("¿Eliminar esta mesa?")) return;
    try {
      await eliminarMesa(mesaId);
      notificar("🗑️ Mesa eliminada");
      setMesaSeleccionada(null);
      await loadMesas(restauranteActivo.id);
    } catch (err) {
      notificar("❌ " + err.message);
    }
  };

  return (
    <>
      <style>{`
        .gm-page { padding: 24px; background: #fef6ea; min-height: 100%; font-family: 'Segoe UI', system-ui, sans-serif; }
        .gm-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .gm-title { font-weight: 800; color: #1a1a2e; font-size: 1.8rem; letter-spacing: -0.5px; margin: 0; }
        .gm-title span { color: #ff7818; }
        .gm-subtitle { color: #555; font-weight: 500; margin: 4px 0 0; font-size: 0.9rem; }
        .gm-selector-box { background: white; padding: 12px 18px; border-radius: 18px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .gm-selector-label { font-size: 0.65rem; color: #888; font-weight: 700; display: block; letter-spacing: 1px; }
        .gm-selector-value { font-weight: 700; color: #1a1a2e; font-size: 0.95rem; }
        .gm-select { border: 1.5px solid #e8e0d8; border-radius: 10px; padding: 7px 12px; outline: none; cursor: pointer; color: #ff7818; font-weight: 700; font-size: 0.88rem; background: white; font-family: inherit; }
        .gm-locked-badge { background: #fff8ee; color: #ff7818; border: 1.5px solid #ffd4a0; border-radius: 10px; padding: 7px 14px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; }
        .gm-stats { margin-bottom: 24px; }
        .gm-stat-card { background: white; border-radius: 20px; padding: 20px; display: flex; align-items: center; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid #f0ebe4; }
        .gm-stat-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-right: 16px; flex-shrink: 0; }
        .gm-stat-num { margin: 0; font-size: 1.6rem; font-weight: 800; color: #1a1a2e; line-height: 1; }
        .gm-stat-label { margin: 0; color: #a3aed0; font-weight: 600; font-size: 0.82rem; }
        .gm-zone-filters { display: flex; gap: 8px; margin-bottom: 24px; background: #eef2f8; padding: 5px; border-radius: 14px; width: fit-content; flex-wrap: wrap; }
        .gm-zone-btn { padding: 8px 20px; border-radius: 10px; border: none; cursor: pointer; font-weight: 700; font-size: 0.83rem; transition: all 0.25s; }
        .gm-zone-btn.active { background: white; color: #ff8b18; box-shadow: 0 3px 10px rgba(0,0,0,0.06); }
        .gm-zone-btn:not(.active) { background: transparent; color: #a3aed0; }
        .gm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
        .gm-mesa-card { background: white; border-radius: 20px; padding: 22px; cursor: pointer; transition: all 0.25s; text-align: center; position: relative; border: 2px solid transparent; box-shadow: 0 3px 10px rgba(0,0,0,0.04); }
        .gm-mesa-card.selected { transform: translateY(-4px); }
        .gm-mesa-dot { position: absolute; top: 13px; right: 13px; width: 9px; height: 9px; border-radius: 50%; }
        .gm-mesa-emoji { font-size: 2.2rem; margin-bottom: 12px; display: block; }
        .gm-mesa-nombre { font-weight: 800; color: #1a1a2e; margin: 0 0 4px; font-size: 0.95rem; }
        .gm-mesa-info { color: #a3aed0; font-size: 0.76rem; font-weight: 600; margin-bottom: 12px; }
        .gm-mesa-badge { padding: 5px 10px; border-radius: 8px; font-size: 0.68rem; font-weight: 800; display: inline-block; }
        .gm-mesa-actions { margin-top: 16px; display: grid; gap: 7px; border-top: 1px solid #f0ebe4; padding-top: 14px; }
        .gm-accion-btn { border: none; border-radius: 9px; padding: 8px; font-size: 0.73rem; font-weight: 700; cursor: pointer; transition: opacity 0.2s; }
        .gm-accion-btn:hover { opacity: 0.85; }
        .gm-empty { text-align: center; padding: 60px 20px; color: #aaa; background: white; border-radius: 18px; grid-column: 1/-1; }
        @media (max-width: 576px) {
          .gm-page { padding: 12px; }
          .gm-header { flex-direction: column; align-items: flex-start; }
          .gm-title { font-size: 1.4rem; }
          .gm-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
          .gm-zone-filters { width: 100%; overflow-x: auto; flex-wrap: nowrap; }
        }
      `}</style>

      <div className="gm-page">

        {/* Cabecera */}
        <div className="gm-header">
          <div>
            <h2 className="gm-title">Panel de <span>Mesas</span></h2>
            <p className="gm-subtitle">Gestiona las mesas de tu restaurante.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div className="gm-selector-box">
              <div>
                <span className="gm-selector-label">RESTAURANTE ACTIVO</span>
                <span className="gm-selector-value">{restauranteActivo?.nombre || "—"}</span>
              </div>
              {isAdmin ? (
                <select
                  className="gm-select"
                  value={restauranteActivo?.id || ""}
                  onChange={(e) => {
                    const found = restaurantesCtx.find((r) => String(r.id) === e.target.value);
                    if (found) { setRestauranteActivo(found); setMesaSeleccionada(null); }
                  }}
                >
                  {listaRestaurantes.map((r) => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                  ))}
                </select>
              ) : (
                <span className="gm-locked-badge">
                  <i className="bi bi-lock-fill" style={{ fontSize: "0.75rem" }} />
                  {restauranteActivo?.nombre || "—"}
                </span>
              )}
            </div>
            <button
              onClick={() => setShowCrear(true)}
              style={{ background: "#ff7818", color: "white", border: "none", borderRadius: 12, padding: "10px 18px", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <i className="bi bi-plus-lg" /> Crear Mesa
            </button>
          </div>
        </div>

        {msg && (
          <div style={{ background: "#f0fff4", border: "1px solid #b7f7cb", borderRadius: 10, padding: "10px 16px", marginBottom: 16, color: "#1a7a3f", fontWeight: 600 }}>
            {msg}
          </div>
        )}

        {/* Estadísticas */}
        <div className="row g-3 gm-stats">
          {Object.entries(ESTADOS).map(([k, v]) => (
            <div className="col-12 col-sm-4" key={k}>
              <div className="gm-stat-card">
                <div className="gm-stat-icon" style={{ background: v.bg }}>
                  <i className={`bi ${v.icon}`} style={{ fontSize: "1.4rem", color: v.color }}></i>
                </div>
                <div>
                  <h3 className="gm-stat-num">{conteos[k] || 0}</h3>
                  <p className="gm-stat-label">Mesas {v.label}s</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros de zona */}
        <div className="gm-zone-filters">
          {zonas.map((z) => (
            <button key={z} className={`gm-zone-btn ${filtroZona === z ? "active" : ""}`}
              onClick={() => setFiltroZona(z)}>
              {z}
            </button>
          ))}
        </div>

        {/* Cargando */}
        {cargando && (
          <div className="gm-grid">
            <div className="gm-empty">
              <div className="spinner-border text-warning" role="status"></div>
              <p className="mt-3">Cargando mesas...</p>
            </div>
          </div>
        )}

        {/* Grid de mesas */}
        {!cargando && (
          <div className="gm-grid">
            {filtradas.length === 0 && (
              <div className="gm-empty">
                <i className="bi bi-grid-3x3-gap" style={{ fontSize: "2.5rem", display: "block", marginBottom: 12 }}></i>
                <p>No hay mesas{filtroZona !== "Todas" ? ` en "${filtroZona}"` : ""}. Crea la primera.</p>
              </div>
            )}
            {filtradas.map((m) => {
              const est = ESTADOS[m.estado] || ESTADOS.disponible;
              const isSelected = mesaSeleccionada === m.id;
              return (
                <div key={m.id} className={`gm-mesa-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setMesaSeleccionada(isSelected ? null : m.id)}
                  style={{
                    borderColor: isSelected ? est.color : "transparent",
                    boxShadow: isSelected ? `0 12px 32px ${est.color}22` : undefined,
                  }}>
                  <div className="gm-mesa-dot" style={{ background: est.color }}></div>
                  <span className="gm-mesa-emoji">
                    {m.capacidad >= 6 ? "🏯" : m.capacidad >= 4 ? "🍽️" : "☕"}
                  </span>
                  <h4 className="gm-mesa-nombre">Mesa {m.numero}</h4>
                  <p className="gm-mesa-info">{m.zona} · {m.capacidad} pers.</p>
                  <span className="gm-mesa-badge" style={{ background: est.bg, color: est.color }}>
                    {est.label.toUpperCase()}
                  </span>

                  {isSelected && (
                    <div className="gm-mesa-actions">
                      <button
                        className="gm-accion-btn"
                        style={{ background: "#fff0ef", color: "#842029" }}
                        onClick={(e) => { e.stopPropagation(); handleEliminar(m.id); }}
                      >
                        <i className="bi bi-trash me-1" /> Eliminar Mesa
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Crear Mesa */}
        {showCrear && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowCrear(false); }}
          >
            <div style={{ background: "white", borderRadius: 18, padding: "28px 24px", width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
              <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800, color: "#1a1a2e" }}>
                <i className="bi bi-table me-2" style={{ color: "#ff7818" }} />
                Nueva Mesa — {restauranteActivo?.nombre}
              </h3>

              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Número de mesa *</label>
              <input
                type="number" min="1"
                value={formMesa.numero}
                onChange={(e) => setFormMesa({ ...formMesa, numero: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8ddd3", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "#fdf8f3", marginBottom: 12 }}
              />

              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Capacidad (personas) *</label>
              <input
                type="number" min="1" max="20"
                value={formMesa.capacidad}
                onChange={(e) => setFormMesa({ ...formMesa, capacidad: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8ddd3", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "#fdf8f3", marginBottom: 12 }}
              />

              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Zona *</label>
              <select
                value={formMesa.zona}
                onChange={(e) => setFormMesa({ ...formMesa, zona: e.target.value })}
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e8ddd3", borderRadius: 8, fontSize: "0.9rem", outline: "none", background: "#fdf8f3", marginBottom: 20 }}
              >
                <option value="Salón Interior">Salón Interior</option>
                <option value="Terraza">Terraza</option>
                <option value="VIP">VIP</option>
              </select>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleCrearMesa}
                  disabled={creando || !formMesa.numero}
                  style={{ flex: 1, background: "#ff7818", color: "white", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  {creando ? "Creando..." : "Crear Mesa"}
                </button>
                <button
                  onClick={() => setShowCrear(false)}
                  style={{ flex: 1, background: "#f5f5f5", color: "#888", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default TableManagement;
