import React, { useState, useEffect } from "react";

const ESTADO_CONFIG = {
    pendiente: { label: "Pendiente", color: "#f59e0b", bg: "#fffaf0", icon: "bi-clock" },
    confirmada: { label: "Confirmada", color: "#22c55e", bg: "#f0fdf4", icon: "bi-check-circle-fill" },
    cancelada: { label: "Cancelada", color: "#dc3545", bg: "#fff5f5", icon: "bi-x-circle-fill" },
};

// Datos iniciales de ejemplo 
const initialReservas = [
    { id: 1, cliente: "María López", email: "maria@gmail.com", tel: "987654321", restaurante: "La Bella Italia", fecha: "2026-04-25", hora: "19:30", personas: 2, mesa: 3, notas: "Aniversario", estado: "pendiente" },
    { id: 2, cliente: "Roberto Silva", email: "roberto@gmail.com", tel: "976543210", restaurante: "La Bella Italia", fecha: "2026-04-25", hora: "20:00", personas: 4, mesa: 7, notas: "", estado: "confirmada" },
];

function Reservas() {
    const [listaRestaurantes, setListaRestaurantes] = useState([]);
    const [restauranteActivo, setRestauranteActivo] = useState("");

    // Estado maestro de todas las reservas de todos los locales
    const [todasLasReservas, setTodasLasReservas] = useState(() => {
        const guardadas = localStorage.getItem("comanda_reservas_maestro");
        return guardadas ? JSON.parse(guardadas) : initialReservas;
    });

    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [fechaFiltro, setFechaFiltro] = useState("");

    // Cargar lista de restaurantes registrados
    useEffect(() => {
        const registrados = JSON.parse(localStorage.getItem("comanda_restaurantes") || "[]");
        const nombres = registrados.length > 0 ? registrados.map(r => r.nombre) : ["La Bella Italia"];
        setListaRestaurantes(nombres);
        if (!restauranteActivo) setRestauranteActivo(nombres[0]);
    }, []);

    // Guardar en LocalStorage 
    useEffect(() => {
        localStorage.setItem("comanda_reservas_maestro", JSON.stringify(todasLasReservas));
    }, [todasLasReservas]);

    // Filtrado lógico: Por Restaurante -> Por Estado -> Por Fecha
    const filtradas = todasLasReservas.filter(r => {
        const matchRestaurante = r.restaurante === restauranteActivo;
        const matchEstado = filtroEstado === "todos" || r.estado === filtroEstado;
        const matchFecha = !fechaFiltro || r.fecha === fechaFiltro;
        return matchRestaurante && matchEstado && matchFecha;
    });

    const cambiarEstado = (id, nuevoEstado) => {
        setTodasLasReservas(prev => prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r));
    };

    const obtenerConteo = (estado) => {
        return todasLasReservas.filter(r => r.restaurante === restauranteActivo && (estado === "todos" || r.estado === estado)).length;
    };

    return (
        <div id="comanda-reservas-section" style={{ padding: "30px", backgroundColor: "#fdfdfd", minHeight: "100vh" }}>

            {/* HEADER DINÁMICO */}
            <div id="reservas-header-main" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "35px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
                <div>
                    <h2 style={{ fontWeight: 800, color: "#1a1a2e", fontSize: "1.8rem", margin: 0 }}>
                        Libro de <span style={{ color: "#ff6b00" }}>Reservas</span>
                    </h2>
                    <p style={{ color: "#888", fontSize: "0.9rem", margin: "5px 0 0 0" }}>Gestiona las visitas para {restauranteActivo}</p>
                </div>

                <div id="reservas-selector-local" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <label style={{ fontSize: "0.65rem", fontWeight: 800, color: "#ff6b00", letterSpacing: "1px", marginBottom: "5px" }}>FILTRAR POR LOCAL</label>
                    <select
                        value={restauranteActivo}
                        onChange={(e) => setRestauranteActivo(e.target.value)}
                        style={{ padding: "10px 15px", borderRadius: "12px", border: "2px solid #ff6b00", fontWeight: 700, outline: "none", cursor: "pointer" }}
                    >
                        {listaRestaurantes.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            {/* STATS DE RESERVAS */}
            <div className="row g-4 mb-5" id="reservas-stats-row">
                {Object.entries(ESTADO_CONFIG).map(([k, v]) => (
                    <div className="col-md-4" key={k}>
                        <div style={{ background: "white", borderRadius: "18px", padding: "20px", display: "flex", alignItems: "center", border: `1px solid ${v.color}30`, boxShadow: "0 4px 12px rgba(0,0,0,0.02)" }}>
                            <div style={{ background: v.bg, width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "15px" }}>
                                <i className={`bi ${v.icon}`} style={{ fontSize: "1.2rem", color: v.color }}></i>
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "#1a1a2e" }}>{obtenerConteo(k)}</h3>
                                <p style={{ margin: 0, color: "#999", fontWeight: 600, fontSize: "0.75rem" }}>{v.label}s</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* FILTROS Y BUSCADOR */}
            <div id="reservas-controls" className="d-flex gap-3 mb-4 flex-wrap align-items-center" style={{ background: "#f8f9fa", padding: "15px", borderRadius: "15px" }}>
                <div className="d-flex gap-2">
                    {["todos", "pendiente", "confirmada", "cancelada"].map(f => (
                        <button key={f} onClick={() => setFiltroEstado(f)}
                            style={{
                                padding: "8px 16px", borderRadius: "10px", border: "none",
                                background: filtroEstado === f ? "#1a1a2e" : "white",
                                color: filtroEstado === f ? "white" : "#666",
                                fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                            }}>
                            {f.toUpperCase()} ({obtenerConteo(f)})
                        </button>
                    ))}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
                    <i className="bi bi-filter text-muted"></i>
                    <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)}
                        style={{ padding: "8px 12px", borderRadius: "10px", border: "1px solid #ddd", fontSize: "0.85rem", outline: "none", fontWeight: 600 }} />
                    {fechaFiltro && <button onClick={() => setFechaFiltro("")} style={{ background: "none", border: "none", color: "#ff6b00", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}>Limpiar</button>}
                </div>
            </div>

            {/* LISTA DE TARJETAS */}
            <div className="row g-4" id="reservas-cards-container">
                {filtradas.map(r => {
                    const ec = ESTADO_CONFIG[r.estado];
                    return (
                        <div className="col-12 col-xl-6" key={r.id}>
                            <div style={{ background: "white", borderRadius: "20px", padding: "25px", border: "1px solid #eee", borderLeft: `6px solid ${ec.color}`, boxShadow: "0 5px 15px rgba(0,0,0,0.02)", position: "relative" }}>

                                <div className="d-flex justify-content-between align-items-start mb-4">
                                    <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                                        <div style={{ width: "50px", height: "50px", background: "#f0f0f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", color: "#1a1a2e", fontWeight: 800 }}>
                                            {r.cliente.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1a1a2e" }}>{r.cliente}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#aaa", fontWeight: 600 }}>{r.email} • {r.tel}</div>
                                        </div>
                                    </div>
                                    <span style={{ background: ec.bg, color: ec.color, padding: "6px 14px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase" }}>
                                        <i className={`bi ${ec.icon} me-1`}></i>{ec.label}
                                    </span>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
                                    {[
                                        { icon: "bi-calendar-event", val: r.fecha, label: "Fecha" },
                                        { icon: "bi-clock", val: r.hora, label: "Hora" },
                                        { icon: "bi-people", val: `${r.personas}p`, label: "Pax" },
                                        { icon: "bi-hash", val: `Mesa ${r.mesa}`, label: "Ubicación" },
                                    ].map((item, i) => (
                                        <div key={i} style={{ background: "#fdfdfd", border: "1px solid #f0f0f0", borderRadius: "12px", padding: "10px", textAlign: "center" }}>
                                            <i className={`bi ${item.icon}`} style={{ color: "#ff6b00", fontSize: "0.9rem", display: "block", marginBottom: "4px" }}></i>
                                            <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#1a1a2e" }}>{item.val}</div>
                                            <div style={{ fontSize: "0.6rem", color: "#bbb", fontWeight: 700, textTransform: "uppercase" }}>{item.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {r.notas && (
                                    <div style={{ background: "#fffaf0", border: "1px dashed #ff9f22", borderRadius: "12px", padding: "12px", fontSize: "0.8rem", color: "#92400e", marginBottom: "20px" }}>
                                        <strong>Observaciones:</strong> {r.notas}
                                    </div>
                                )}

                                {/* ACCIONES DINÁMICAS */}
                                <div style={{ display: "flex", gap: "10px" }}>
                                    {r.estado === "pendiente" && (
                                        <>
                                            <button onClick={() => cambiarEstado(r.id, "confirmada")}
                                                style={{ flex: 2, padding: "10px", borderRadius: "12px", border: "none", background: "#22c55e", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>
                                                <i className="bi bi-check2-all me-1"></i>Confirmar Reserva
                                            </button>
                                            <button onClick={() => cambiarEstado(r.id, "cancelada")}
                                                style={{ flex: 1, padding: "10px", borderRadius: "12px", border: "none", background: "#fee2e2", color: "#dc3545", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>
                                                Cancelar
                                            </button>
                                        </>
                                    )}
                                    {r.estado === "confirmada" && (
                                        <button onClick={() => cambiarEstado(r.id, "cancelada")}
                                            style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "1px solid #fee2e2", background: "white", color: "#dc3545", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>
                                            Anular Confirmación
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
export default Reservas;