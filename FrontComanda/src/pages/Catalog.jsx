import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../assets/styles/catalog.css";
import BookingModal from "../components/BookingModal";
import { useAuth } from "../context/AuthContext";

const PRECIOS   = ["$", "$$", "$$$", "$$$$"];
const DIAS_LABEL = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const ORDENAR   = [
  { value: "default",     label: "Destacados"           },
  { value: "rating",      label: "Mejor calificación"   },
  { value: "precio-asc",  label: "Precio: menor a mayor"},
  { value: "precio-desc", label: "Precio: mayor a menor"},
  { value: "mesas",       label: "Más mesas disponibles"},
];

const precioNum = (p) => (p || "").length;

/* Estrellitas de rating */
function Stars({ rating }) {
  return (
    <span className="cat-stars" aria-label={`Rating ${rating}`}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} viewBox="0 0 20 20" className={i <= Math.round(rating) ? "star-filled" : "star-empty"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118L5.2 11.969a1 1 0 00-.364-1.118L1.457 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69L9.049 2.927z"/>
        </svg>
      ))}
    </span>
  );
}

/* Horario semanal expandible (preparado para cuando el back agregue horarios por día) */
function HorarioSemanal({ horarioApertura, horarioCierre, horariosSemana }) {
  const [expanded, setExpanded] = useState(false);
  // Si no hay horarios por día, mostramos el horario general para todos los días
  const dias = horariosSemana || DIAS_LABEL.map(d => ({
    dia: d,
    apertura: horarioApertura,
    cierre:   horarioCierre,
  }));

  return (
    <div className="cat-horario-wrap">
      <button
        className="cat-horario-toggle"
        onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
        aria-expanded={expanded}
      >
        <i className="bi bi-clock"></i>
        <span>Horario semanal</span>
        <i className={`bi bi-chevron-${expanded ? "up" : "down"} cat-chevron`}></i>
      </button>
      {expanded && (
        <div className="cat-horario-grid">
          {dias.map(({ dia, apertura, cierre }) => (
            <div key={dia} className="cat-horario-row">
              <span className="cat-horario-dia">{dia}</span>
              <span className="cat-horario-hrs">
                {apertura && cierre ? `${apertura} – ${cierre}` : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Normaliza datos del backend al formato del catálogo */
function normalizarRestaurante(r) {
  return {
    id:                  r.id,
    nombre:              r.nombre,
    lugar:               r.distrito || "Lima",
    direccion:           r.direccion || null,
    horaApertura:        r.horarioApertura || "—",
    horaCierre:          r.horarioCierre   || "—",
    horariosSemana: (() => {
      const map = [
        { dia: "LUN", campo: "horarioLunes"     },
        { dia: "MAR", campo: "horarioMartes"    },
        { dia: "MIÉ", campo: "horarioMiercoles" },
        { dia: "JUE", campo: "horarioJueves"    },
        { dia: "VIE", campo: "horarioViernes"   },
        { dia: "SÁB", campo: "horarioSabado"    },
        { dia: "DOM", campo: "horarioDomingo"   },
      ];
      const tiene = map.some(({ campo }) => r[campo]);
      if (!tiene) return null;
      return map.map(({ dia, campo }) => {
        const val = r[campo];
        if (!val) return { dia, apertura: null, cierre: null };
        const [apertura, cierre] = val.split("-");
        return { dia, apertura: apertura || null, cierre: cierre || null };
      });
    })(),
    mesas:               r.mesas ?? 0,
    precio:              "$",
    tipo:                r.tipo || "Otro",
    img:                 r.imagen || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800",
    rating:              r.rating ?? 4.0,
    reseñas:             r.reseñas ?? 0,
    etiqueta:            r.cerradoHoy ? "Cerrado" : "Abierto hoy",
    cerrado:             r.cerradoHoy ?? false,
    motivoCierre:        r.motivoCierre || null,
    eslogan:             r.mensaje_personalizado || r.mensajePersonalizado || null,
    telefono:            r.telefono || null,
    email:               r.email    || null,
    etiquetas:           r.etiquetas || [],       // futuro campo del back
  };
}

/* ─── Catalog ─────────────────────────────────────────────────────────────── */
function Catalog() {
  const [searchParams]              = useSearchParams();
  const [restaurantesBackend, setRestaurantesBackend] = useState([]);
  const navigate                    = useNavigate();
  const { user }                    = useAuth();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/restaurants`)
      .then(r => r.json())
      .then(setRestaurantesBackend)
      .catch(console.error);
  }, []);

  const todosLosRestaurantes = useMemo(
    () => restaurantesBackend.map(normalizarRestaurante),
    [restaurantesBackend]
  );

  // Filtros dinámicos derivados de los datos
  const TIPOS     = useMemo(() => [...new Set(todosLosRestaurantes.map(r => r.tipo))].sort(), [todosLosRestaurantes]);
  const DISTRITOS = useMemo(() => [...new Set(todosLosRestaurantes.map(r => r.lugar).filter(Boolean))].sort(), [todosLosRestaurantes]);

  // Estados de filtros
  const [busqueda,             setBusqueda            ] = useState(searchParams.get("busqueda") || "");
  const [tiposSeleccionados,   setTiposSeleccionados  ] = useState(() => { const t = searchParams.get("tipo");    return t ? [t] : []; });
  const [preciosSeleccionados, setPreciosSeleccionados] = useState(() => { const p = searchParams.get("precio");  return p ? [p] : []; });
  const [distritoSeleccionado, setDistritoSeleccionado] = useState(searchParams.get("distrito") || "");
  const [soloAbiertos,         setSoloAbiertos        ] = useState(false);
  const [orden,                setOrden               ] = useState("default");
  const [sidebarOpen,          setSidebarOpen         ] = useState(false);

  // Modal de reserva
  const [isModalOpen,  setIsModalOpen ] = useState(false);
  const [selectedRest, setSelectedRest] = useState(null);

  const handleBooking = (restaurante) => {
    if (!user) {
      navigate("/login", { state: { from: "/catalog", mensaje: "Inicia sesión para hacer una reserva" } });
      return;
    }
    setSelectedRest(restaurante);
    setIsModalOpen(true);
  };

  // Sincronizar query params
  useEffect(() => {
    const tipo     = searchParams.get("tipo");
    const precio   = searchParams.get("precio");
    const busq     = searchParams.get("busqueda");
    const distrito = searchParams.get("distrito");
    if (tipo)     setTiposSeleccionados([tipo]);
    if (precio)   setPreciosSeleccionados([precio]);
    if (busq)     setBusqueda(busq);
    if (distrito) setDistritoSeleccionado(distrito);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const toggleTipo  = (t) => setTiposSeleccionados(prev => prev.includes(t)  ? prev.filter(x => x !== t)  : [...prev, t]);
  const togglePrecio = (p) => setPreciosSeleccionados(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const resetFiltros = () => {
    setBusqueda(""); setTiposSeleccionados([]); setPreciosSeleccionados([]);
    setDistritoSeleccionado(""); setSoloAbiertos(false); setOrden("default");
  };

  const resultado = useMemo(() => {
    let lista = todosLosRestaurantes.filter(r => {
      const matchBusqueda   = !busqueda || r.nombre.toLowerCase().includes(busqueda.toLowerCase()) || r.lugar.toLowerCase().includes(busqueda.toLowerCase()) || r.tipo.toLowerCase().includes(busqueda.toLowerCase());
      const matchTipo       = tiposSeleccionados.length === 0   || tiposSeleccionados.includes(r.tipo);
      const matchPrecio     = preciosSeleccionados.length === 0 || preciosSeleccionados.includes(r.precio);
      const matchDistrito   = !distritoSeleccionado             || r.lugar === distritoSeleccionado;
      const matchAbierto    = !soloAbiertos                     || !r.cerrado;
      return matchBusqueda && matchTipo && matchPrecio && matchDistrito && matchAbierto;
    });
    if (orden === "rating")      lista = [...lista].sort((a, b) => b.rating - a.rating);
    else if (orden === "precio-asc")  lista = [...lista].sort((a, b) => precioNum(a.precio) - precioNum(b.precio));
    else if (orden === "precio-desc") lista = [...lista].sort((a, b) => precioNum(b.precio) - precioNum(a.precio));
    else if (orden === "mesas")  lista = [...lista].sort((a, b) => b.mesas - a.mesas);
    return lista;
  }, [busqueda, tiposSeleccionados, preciosSeleccionados, distritoSeleccionado, soloAbiertos, orden, todosLosRestaurantes]);

  const hayFiltrosActivos = busqueda || tiposSeleccionados.length > 0 || preciosSeleccionados.length > 0 || distritoSeleccionado || soloAbiertos;
  const conteoFiltros = tiposSeleccionados.length + preciosSeleccionados.length + (distritoSeleccionado ? 1 : 0) + (soloAbiertos ? 1 : 0) + (busqueda ? 1 : 0);

  return (
    <div className="cat-wrapper">

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="cat-hero">
        <div className="cat-hero-inner">
          <p className="cat-hero-eyebrow">DESCUBRE LIMA</p>
          <h1 className="cat-hero-title">Catálogo de Restaurantes</h1>
          <p className="cat-hero-sub">Encuentra el lugar perfecto para tu próxima reserva</p>
          <div className="cat-search-bar">
            <i className="bi bi-search cat-search-icon"></i>
            <input
              type="text"
              placeholder="Busca por nombre, lugar o tipo de comida..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && (
              <button className="cat-search-clear" onClick={() => setBusqueda("")}>
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── LAYOUT ───────────────────────────────────────── */}
      <div className="cat-layout">

        {/* SIDEBAR */}
        <aside className={`cat-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="cat-sidebar-header">
            <span className="cat-sidebar-title"><i className="bi bi-sliders2"></i> Filtros</span>
            {hayFiltrosActivos && (
              <button className="cat-clear-all" onClick={resetFiltros}>Limpiar</button>
            )}
          </div>

          {/* Tipo de comida */}
          <div className="cat-filter-section">
            <p className="cat-filter-label">Tipo de comida</p>
            <div className="cat-chips">
              {TIPOS.map(tipo => (
                <button
                  key={tipo}
                  className={`cat-chip ${tiposSeleccionados.includes(tipo) ? "active" : ""}`}
                  onClick={() => toggleTipo(tipo)}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Precio */}
          <div className="cat-filter-section">
            <p className="cat-filter-label">Precio</p>
            <div className="cat-chips">
              {PRECIOS.map(p => (
                <button
                  key={p}
                  className={`cat-chip ${preciosSeleccionados.includes(p) ? "active" : ""}`}
                  onClick={() => togglePrecio(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Distrito */}
          {DISTRITOS.length > 0 && (
            <div className="cat-filter-section">
              <p className="cat-filter-label">Distrito</p>
              <select
                className="cat-select"
                value={distritoSeleccionado}
                onChange={e => setDistritoSeleccionado(e.target.value)}
              >
                <option value="">Todos los distritos</option>
                {DISTRITOS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {/* Solo abiertos */}
          <div className="cat-filter-section">
            <label className="cat-toggle-row">
              <span>Solo abiertos hoy</span>
              <span
                className={`cat-toggle ${soloAbiertos ? "on" : ""}`}
                role="switch"
                aria-checked={soloAbiertos}
                onClick={() => setSoloAbiertos(v => !v)}
              >
                <span className="cat-toggle-knob"></span>
              </span>
            </label>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="cat-content">

          {/* Top bar */}
          <div className="cat-top-bar">
            <div className="cat-top-left">
              <button
                className={`cat-mobile-filter-btn ${sidebarOpen ? "active" : ""}`}
                onClick={() => setSidebarOpen(v => !v)}
              >
                <i className="bi bi-sliders2"></i>
                Filtros {conteoFiltros > 0 && <span className="cat-filter-badge">{conteoFiltros}</span>}
              </button>
              <span className="cat-count">
                <strong>{resultado.length}</strong>{" "}
                {resultado.length === 1 ? "restaurante encontrado" : "restaurantes encontrados"}
              </span>
            </div>
            <div className="cat-top-right">
              <label className="cat-sort-label">Ordenar por</label>
              <select className="cat-sort-select" value={orden} onChange={e => setOrden(e.target.value)}>
                {ORDENAR.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Tags de filtros activos */}
          {hayFiltrosActivos && (
            <div className="cat-active-tags">
              {busqueda && (
                <span className="cat-tag">
                  🔍 "{busqueda}"
                  <button onClick={() => setBusqueda("")}><i className="bi bi-x"></i></button>
                </span>
              )}
              {tiposSeleccionados.map(t => (
                <span key={t} className="cat-tag">
                  {t}<button onClick={() => toggleTipo(t)}><i className="bi bi-x"></i></button>
                </span>
              ))}
              {preciosSeleccionados.map(p => (
                <span key={p} className="cat-tag">
                  {p}<button onClick={() => togglePrecio(p)}><i className="bi bi-x"></i></button>
                </span>
              ))}
              {distritoSeleccionado && (
                <span className="cat-tag">
                  📍 {distritoSeleccionado}
                  <button onClick={() => setDistritoSeleccionado("")}><i className="bi bi-x"></i></button>
                </span>
              )}
              {soloAbiertos && (
                <span className="cat-tag">
                  Solo abiertos<button onClick={() => setSoloAbiertos(false)}><i className="bi bi-x"></i></button>
                </span>
              )}
              <button className="cat-tag cat-tag-clear" onClick={resetFiltros}>Limpiar todo</button>
            </div>
          )}

          {/* Grid / Empty */}
          {resultado.length === 0 ? (
            <div className="cat-empty">
              <i className="bi bi-search"></i>
              <h4>No se encontraron restaurantes</h4>
              <p>Intenta con otros filtros o términos de búsqueda.</p>
              <button className="cat-btn-reservar" onClick={resetFiltros}>Ver todos</button>
            </div>
          ) : (
            <div className="cat-grid">
              {resultado.map(rest => (
                <article key={rest.id || rest.nombre} className={`cat-card ${rest.cerrado ? "cerrado" : ""}`}>

                  {/* Imagen */}
                  <div className="cat-card-img">
                    <img src={rest.img} alt={rest.nombre} loading="lazy" />
                    <div className="cat-card-img-overlay"></div>

                    {/* Badges sobre imagen */}
                    <div className="cat-card-badges-top">
                      <span className="cat-badge-tipo">{rest.tipo}</span>
                    </div>
                    <div className="cat-card-badges-bottom">
                      <span className={`cat-badge-estado ${rest.cerrado ? "cerrado" : "abierto"}`}>
                        <span className="cat-estado-dot"></span>
                        {rest.etiqueta}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo */}
                  <div className="cat-card-body">

                    {/* Cabecera */}
                    <div className="cat-card-header">
                      <div>
                        <h3 className="cat-card-nombre">{rest.nombre}</h3>
                        {rest.eslogan && (
                          <p className="cat-card-eslogan">"{rest.eslogan}"</p>
                        )}
                      </div>
                      <div className="cat-card-rating">
                        <Stars rating={rest.rating} />
                        <span className="cat-rating-num">{rest.rating.toFixed(1)}</span>
                        {rest.reseñas > 0 && <span className="cat-rating-reviews">({rest.reseñas})</span>}
                      </div>
                    </div>

                    {/* Info principal */}
                    <div className="cat-card-info">
                      <span className="cat-info-item">
                        <i className="bi bi-geo-alt-fill"></i>
                        {rest.direccion ? `${rest.lugar} · ${rest.direccion}` : rest.lugar}
                      </span>
                      {rest.telefono && (
                        <span className="cat-info-item">
                          <i className="bi bi-telephone-fill"></i>
                          {rest.telefono}
                        </span>
                      )}
                    </div>

                    {/* Etiquetas */}
                    {rest.etiquetas.length > 0 && (
                      <div className="cat-card-tags">
                        {rest.etiquetas.map(tag => (
                          <span key={tag} className="cat-etiqueta">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Horario semanal */}
                    <HorarioSemanal
                      horarioApertura={rest.horaApertura}
                      horaCierre={rest.horaCierre}
                      horariosSemana={rest.horariosSemana}
                    />

                    {/* Aviso de cierre temporal */}
                    {rest.cerrado && rest.motivoCierre && (
                      <div className="cat-card-cierre-aviso">
                        <i className="bi bi-info-circle-fill"></i>
                        {rest.motivoCierre}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="cat-card-footer">
                      <div className="cat-card-footer-left">
                        <span className="cat-precio">{rest.precio}</span>
                        <span className="cat-mesas">
                          <i className="bi bi-people-fill"></i>
                          {rest.mesas} {rest.mesas === 1 ? "mesa" : "mesas"}
                        </span>
                      </div>
                      <button
                        className={`cat-btn-reservar ${rest.cerrado ? "disabled" : ""}`}
                        onClick={() => !rest.cerrado && handleBooking(rest)}
                        disabled={rest.cerrado}
                        title={rest.cerrado ? "Restaurante cerrado temporalmente" : "Reservar ahora"}
                      >
                        {rest.cerrado ? "Sin disponibilidad" : "Reservar"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de reserva */}
      {selectedRest && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedRest(null); }}
          restaurante={selectedRest}
        />
      )}
    </div>
  );
}

export default Catalog;
