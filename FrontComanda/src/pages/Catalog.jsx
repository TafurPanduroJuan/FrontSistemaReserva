import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../assets/styles/catalog.css";
import { useRestaurantes } from "../context/RestaurantesContext";
import { restaurantes as restaurantesEstaticos } from "../data/datos";

const PRECIOS = ["$", "$$", "$$$", "$$$$"];
const DISPONIBILIDADES = ["Todos", "Hoy", "Mañana"];
const ORDENAR = [
  { value: "default", label: "Destacados" },
  { value: "rating", label: "Mejor calificación" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "mesas", label: "Más mesas disponibles" },
];

// Convierte restaurante del contexto (formato intranet/NuevoRestaurante) al formato del catálogo
function normalizarRestaurante(r) {
  // Si ya tiene el formato del catálogo (viene de datos.js vía contexto), lo respeta
  if (r.img && r.lugar) {
    return {
      id: r.id || r.nombre,
      nombre: r.nombre,
      lugar: r.lugar,
      hora: r.hora || "—",
      mesas: r.mesas ?? 0,
      precio: r.precio || "$",
      etiqueta: r.etiqueta || "Hoy",
      tipo: r.tipo || "Otro",
      img: r.img,
      rating: r.rating ?? 4.0,
      reseñas: r.reseñas ?? 0,
    };
  }
  // Formato intranet/NuevoRestaurante → normalizar al formato del catálogo
  return {
    id: r.id || r.nombre,
    nombre: r.nombre,
    lugar: r.distrito || r.direccion || "Lima",
    hora: r.horario_apertura || "—",
    mesas: r.mesas ?? 0,
    precio: r.precio || "$",
    etiqueta: r.etiqueta || "Hoy",
    tipo: r.tipo || "Otro",
    img:
      r.imagen ||
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400",
    rating: r.rating ?? 4.0,
    reseñas: r.reseñas ?? 0,
  };
}

const precioNum = (p) => (p || "").length;

function Catalog() {
  const [searchParams] = useSearchParams();
  const { restaurantes: restaurantesContexto } = useRestaurantes();

  // Combinar restaurantes del contexto con los estáticos sin duplicar
  const todosLosRestaurantes = useMemo(() => {
    const normalizados = restaurantesContexto.map(normalizarRestaurante);
    const nombresEnContexto = new Set(
      normalizados.map((r) => r.nombre.toLowerCase())
    );
    const estaticosExtra = restaurantesEstaticos
      .filter((r) => !nombresEnContexto.has(r.nombre.toLowerCase()))
      .map(normalizarRestaurante);

    return [...normalizados, ...estaticosExtra];
  }, [restaurantesContexto]);

  // Tipos únicos derivados de todos los restaurantes disponibles
  const TIPOS = useMemo(
    () => [...new Set(todosLosRestaurantes.map((r) => r.tipo))].sort(),
    [todosLosRestaurantes]
  );

  // Inicializar filtros desde URL params (viene desde Home)
  const [busqueda, setBusqueda] = useState(searchParams.get("busqueda") || "");
  const [tiposSeleccionados, setTiposSeleccionados] = useState(() => {
    const tipo = searchParams.get("tipo");
    return tipo ? [tipo] : [];
  });
  const [preciosSeleccionados, setPreciosSeleccionados] = useState(() => {
    const precio = searchParams.get("precio");
    return precio ? [precio] : [];
  });
  const [disponibilidad, setDisponibilidad] = useState(
    searchParams.get("disponibilidad") || "Todos"
  );
  const [orden, setOrden] = useState("default");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const tipo = searchParams.get("tipo");
    const precio = searchParams.get("precio");
    const busq = searchParams.get("busqueda");
    const disp = searchParams.get("disponibilidad");
    if (tipo) setTiposSeleccionados([tipo]);
    if (precio) setPreciosSeleccionados([precio]);
    if (busq) setBusqueda(busq);
    if (disp) setDisponibilidad(disp);
  }, [searchParams]);

  const toggleTipo = (tipo) => {
    setTiposSeleccionados((prev) =>
      prev.includes(tipo) ? prev.filter((t) => t !== tipo) : [...prev, tipo]
    );
  };

  const togglePrecio = (precio) => {
    setPreciosSeleccionados((prev) =>
      prev.includes(precio)
        ? prev.filter((p) => p !== precio)
        : [...prev, precio]
    );
  };

  const resetFiltros = () => {
    setBusqueda("");
    setTiposSeleccionados([]);
    setPreciosSeleccionados([]);
    setDisponibilidad("Todos");
    setOrden("default");
  };

  const resultado = useMemo(() => {
    let lista = todosLosRestaurantes.filter((r) => {
      const matchBusqueda =
        !busqueda ||
        r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.lugar.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.tipo.toLowerCase().includes(busqueda.toLowerCase());
      const matchTipo =
        tiposSeleccionados.length === 0 || tiposSeleccionados.includes(r.tipo);
      const matchPrecio =
        preciosSeleccionados.length === 0 ||
        preciosSeleccionados.includes(r.precio);
      const matchDisponibilidad =
        disponibilidad === "Todos" || r.etiqueta === disponibilidad;
      return matchBusqueda && matchTipo && matchPrecio && matchDisponibilidad;
    });

    if (orden === "rating")
      lista = [...lista].sort((a, b) => b.rating - a.rating);
    else if (orden === "precio-asc")
      lista = [...lista].sort(
        (a, b) => precioNum(a.precio) - precioNum(b.precio)
      );
    else if (orden === "precio-desc")
      lista = [...lista].sort(
        (a, b) => precioNum(b.precio) - precioNum(a.precio)
      );
    else if (orden === "mesas")
      lista = [...lista].sort((a, b) => b.mesas - a.mesas);

    return lista;
  }, [
    busqueda,
    tiposSeleccionados,
    preciosSeleccionados,
    disponibilidad,
    orden,
    todosLosRestaurantes,
  ]);

  const hayFiltrosActivos =
    busqueda ||
    tiposSeleccionados.length > 0 ||
    preciosSeleccionados.length > 0 ||
    disponibilidad !== "Todos";

  return (
    <div className="catalog-wrapper">
      {/* Hero Banner */}
      <div className="catalog-hero">
        <h1>🍽️ Catálogo de Restaurantes</h1>
        <p>Encuentra el lugar perfecto para tu próxima reserva</p>
        <div className="catalog-search-bar">
          <input
            type="text"
            placeholder="Busca por nombre, lugar o tipo de comida..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <i className="bi bi-search search-icon"></i>
        </div>
      </div>

      {/* Layout */}
      <div className="catalog-layout">
        {/* Sidebar */}
        <aside className={`catalog-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-title">
            <i className="bi bi-sliders"></i> Filtros
          </div>
          <div className="filter-section">
            <div className="filter-label">Tipo de comida</div>
            <div className="filter-chips">
              {TIPOS.map((tipo) => (
                <button
                  key={tipo}
                  className={`filter-chip ${
                    tiposSeleccionados.includes(tipo) ? "active" : ""
                  }`}
                  onClick={() => toggleTipo(tipo)}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <div className="filter-label">Precio</div>
            <div className="filter-chips">
              {PRECIOS.map((p) => (
                <button
                  key={p}
                  className={`filter-chip ${
                    preciosSeleccionados.includes(p) ? "active" : ""
                  }`}
                  onClick={() => togglePrecio(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-section">
            <div className="filter-label">Disponibilidad</div>
            <div className="availability-options">
              {DISPONIBILIDADES.map((d) => (
                <button
                  key={d}
                  className={`availability-btn ${
                    disponibilidad === d ? "active" : ""
                  }`}
                  onClick={() => setDisponibilidad(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button className="btn-reset-filters" onClick={resetFiltros}>
            <i className="bi bi-x-circle me-1"></i> Limpiar filtros
          </button>
        </aside>

        {/* Content */}
        <div className="catalog-content">
          <div className="catalog-top-bar">
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className={`mobile-filter-btn ${sidebarOpen ? "active" : ""}`}
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                <i className="bi bi-sliders"></i>
                {sidebarOpen ? "Ocultar filtros" : "Filtros"}
              </button>
              <span className="catalog-count">
                <strong>{resultado.length}</strong>{" "}
                {resultado.length === 1
                  ? "restaurante encontrado"
                  : "restaurantes encontrados"}
              </span>
            </div>
            <select
              className="sort-select"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              {ORDENAR.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {hayFiltrosActivos && (
            <div className="active-filters">
              {busqueda && (
                <span className="active-filter-tag">
                  🔍 "{busqueda}"
                  <button onClick={() => setBusqueda("")}>
                    <i className="bi bi-x"></i>
                  </button>
                </span>
              )}
              {tiposSeleccionados.map((t) => (
                <span key={t} className="active-filter-tag">
                  {t}
                  <button onClick={() => toggleTipo(t)}>
                    <i className="bi bi-x"></i>
                  </button>
                </span>
              ))}
              {preciosSeleccionados.map((p) => (
                <span key={p} className="active-filter-tag">
                  {p}
                  <button onClick={() => togglePrecio(p)}>
                    <i className="bi bi-x"></i>
                  </button>
                </span>
              ))}
              {disponibilidad !== "Todos" && (
                <span className="active-filter-tag">
                  {disponibilidad}
                  <button onClick={() => setDisponibilidad("Todos")}>
                    <i className="bi bi-x"></i>
                  </button>
                </span>
              )}
              <button
                className="active-filter-tag"
                style={{
                  cursor: "pointer",
                  border: "none",
                  background: "#ffeee0",
                }}
                onClick={resetFiltros}
              >
                Limpiar todo
              </button>
            </div>
          )}

          {resultado.length === 0 ? (
            <div className="catalog-empty">
              <div>
                <i className="bi bi-search"></i>
              </div>
              <h4>No se encontraron restaurantes</h4>
              <p>Intenta con otros filtros o términos de búsqueda.</p>
              <button
                className="btn-catalog-reserva"
                style={{ marginTop: "16px" }}
                onClick={resetFiltros}
              >
                Ver todos
              </button>
            </div>
          ) : (
            <div className="catalog-grid">
              {resultado.map((rest) => (
                <div key={rest.id || rest.nombre} className="catalog-card">
                  <div className="catalog-card-img-wrapper">
                    <img src={rest.img} alt={rest.nombre} />
                    <span className="catalog-badge">{rest.etiqueta}</span>
                    <span className="catalog-badge-tipo">{rest.tipo}</span>
                  </div>
                  <div className="catalog-card-body">
                    <div className="catalog-card-title">{rest.nombre}</div>
                    <div className="catalog-card-meta">
                      <span>📍 {rest.lugar}</span>
                      <span>🕒 {rest.hora}</span>
                      <span>🍽️ {rest.mesas} mesas disponibles</span>
                      <span>
                        ⭐ {rest.rating}{" "}
                        {rest.reseñas > 0 && `(${rest.reseñas}+ reseñas)`}
                      </span>
                    </div>
                    <div className="catalog-card-footer">
                      <span className="catalog-card-price">{rest.precio}</span>
                      <button className="btn-catalog-reserva">
                        Reservar Ahora
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Catalog;
