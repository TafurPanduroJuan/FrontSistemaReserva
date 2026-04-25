import React, { useState, useEffect } from "react";
import { useMesas } from "../../context/MesasContext";

const ESTADOS = {
  disponible: { label: "Disponible", color: "#10b981", bg: "#ecfdf5", icon: "bi-check-circle-fill" },
  reservada:  { label: "Reservada",  color: "#f59e0b", bg: "#fffbeb", icon: "bi-clock-fill" },
  ocupada:    { label: "Ocupada",    color: "#ef4444", bg: "#fef2f2", icon: "bi-person-fill" },
};

function GestionMesas() {
  const { getMesas, cambiarEstadoMesa } = useMesas();

  const [listaRestaurantes, setListaRestaurantes] = useState([]);
  const [restauranteActivo, setRestauranteActivo] = useState("");
  const [filtroZona, setFiltroZona] = useState("Todas");
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem("comanda_restaurantes") || "[]");
    const nombres = guardados.length > 0
      ? guardados.map(r => r.nombre)
      : ["La Bella Italia", "Parrillas Don Julio"];
    setListaRestaurantes(nombres);
    if (!restauranteActivo) setRestauranteActivo(nombres[0]);
  }, []);

  const mesasActuales = restauranteActivo ? getMesas(restauranteActivo) : [];
  const filtradas = mesasActuales.filter(m => filtroZona === "Todas" || m.zona === filtroZona);

  const cambiarEstado = (mesaId, nuevoEstado) => {
    cambiarEstadoMesa(restauranteActivo, mesaId, nuevoEstado);
    setMesaSeleccionada(null);
  };

  const conteos = Object.fromEntries(
    Object.keys(ESTADOS).map(e => [e, mesasActuales.filter(m => m.estado === e).length])
  );

  return (
    <div id="gestion-mesas-premium" style={{ padding: "40px", backgroundColor: "#fef6ea", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* CABECERA */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <div>
          <h2 style={{ fontWeight: 800, color: "#000000", fontSize: "2.2rem", letterSpacing: "-1px", margin: 0 }}>
            Panel de <span style={{ color: "#ff7818" }}>Mesas</span>
          </h2>
          <p style={{ color: "#000000", fontWeight: 500, marginTop: "5px" }}>Optimiza la ocupación de tu local en tiempo real.</p>
        </div>
        <div style={{ background: "white", padding: "10px 20px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.7rem", color: "#000000", fontWeight: 700, display: "block" }}>RESTAURANTE SELECCIONADO</span>
            <span style={{ fontWeight: 700, color: "rgb(24,24,24)" }}>{restauranteActivo}</span>
          </div>
          <select
            value={restauranteActivo}
            onChange={(e) => { setRestauranteActivo(e.target.value); setMesaSeleccionada(null); }}
            style={{ border: "1px solid #e0e5f2", borderRadius: "12px", padding: "8px", outline: "none", cursor: "pointer", color: "#ff0000", fontWeight: 600 }}
          >
            {listaRestaurantes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="row g-4 mb-5">
        {Object.entries(ESTADOS).map(([k, v]) => (
          <div className="col-md-4" key={k}>
            <div style={{ background: "white", borderRadius: "24px", padding: "25px", display: "flex", alignItems: "center", boxShadow: "0 10px 20px rgba(112,144,176,0.08)", border: "1px solid #f0f0f0" }}>
              <div style={{ background: v.bg, width: "60px", height: "60px", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "20px" }}>
                <i className={`bi ${v.icon}`} style={{ fontSize: "1.5rem", color: v.color }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 800, color: "#1b254b" }}>{conteos[k]}</h3>
                <p style={{ margin: 0, color: "#a3aed0", fontWeight: 600, fontSize: "0.9rem" }}>Mesas {v.label}s</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FILTROS DE ZONAS */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "35px", background: "#eef2f8", padding: "6px", borderRadius: "16px", width: "fit-content" }}>
        {["Todas", "Terraza", "Salón Interior", "VIP"].map(z => (
          <button key={z} onClick={() => setFiltroZona(z)}
            style={{
              padding: "10px 24px", borderRadius: "12px", border: "none", cursor: "pointer",
              background: filtroZona === z ? "white" : "transparent",
              color: filtroZona === z ? "#ff8b18" : "#a3aed0",
              boxShadow: filtroZona === z ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
              fontWeight: 700, fontSize: "0.85rem", transition: "0.3s"
            }}>
            {z}
          </button>
        ))}
      </div>

      {/* GRID DE MESAS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "25px" }}>
        {filtradas.map(m => {
          const est = ESTADOS[m.estado];
          const isSelected = mesaSeleccionada === m.id;
          return (
            <div key={m.id}
              onClick={() => setMesaSeleccionada(isSelected ? null : m.id)}
              style={{
                background: "white", borderRadius: "24px", padding: "25px", cursor: "pointer",
                transition: "0.3s transform", border: isSelected ? `2px solid ${est.color}` : "2px solid transparent",
                boxShadow: isSelected ? `0 20px 40px ${est.color}22` : "0 4px 12px rgba(0,0,0,0.03)",
                transform: isSelected ? "translateY(-5px)" : "none",
                textAlign: "center", position: "relative"
              }}>
              <div style={{ position: "absolute", top: "15px", right: "15px", width: "10px", height: "10px", borderRadius: "50%", background: est.color }}></div>
              <div style={{ fontSize: "2.5rem", marginBottom: "15px" }}>
                {m.capacidad >= 6 ? "🏯" : m.capacidad >= 4 ? "🍽️" : "☕"}
              </div>
              <h4 style={{ fontWeight: 800, color: "#1b254b", margin: "0 0 5px 0" }}>Mesa {m.numero}</h4>
              <p style={{ color: "#a3aed0", fontSize: "0.8rem", fontWeight: 600, marginBottom: "15px" }}>{m.zona} • {m.capacidad} pers.</p>
              <div style={{ background: est.bg, color: est.color, padding: "6px 12px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: 800 }}>
                {est.label.toUpperCase()}
              </div>

              {isSelected && (
                <div style={{ marginTop: "20px", display: "grid", gap: "8px", borderTop: "1px solid #f0f0f0", paddingTop: "15px" }}>
                  {Object.entries(ESTADOS).filter(([k]) => k !== m.estado).map(([k, v]) => (
                    <button key={k}
                      onClick={(e) => { e.stopPropagation(); cambiarEstado(m.id, k); }}
                      style={{ background: v.bg, color: v.color, border: "none", borderRadius: "10px", padding: "8px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                      Marcar {v.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GestionMesas;
