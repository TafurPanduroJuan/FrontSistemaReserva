import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurants } from "../../context/RestaurantsContext";

// ── Opciones reutilizadas del formulario público ──────────────────────────────
const tiposComida = [
  "Criolla", "Italiana", "Japonesa", "Mariscos", "Vegana",
  "Parrilla", "Mexicana", "Peruana", "Francesa", "Fusión",
  "Moderna", "Asiática", "Postres",
];

const sugerenciasDistritos = [
  "Miraflores", "San Isidro", "Barranco", "Surco", "La Molina",
  "Chorrillos", "Lince", "Jesús María", "Pueblo Libre", "Magdalena",
];

// ── Estado inicial (todos los campos de RestaurantEntity) ─────────────────────
const initialForm = {
  nombre: "",
  tipo: "",
  distrito: "",
  direccion: "",
  mensajePersonalizado: "",
  mesas: "",
  telefono: "",
  email: "",
  imagen: "",
  horarioApertura: "",
  horarioCierre: "",
};

export default function CreateRestaurant() {
  const { agregarRestaurante } = useRestaurants();
  // FIX: la ruta definida en App.jsx es /intranet/restaurants (inglés)
  // Antes se redirigía a /intranet/restaurantes (español) → pantalla en blanco
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Manejador genérico de campos ──────────────────────────────────────────
  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ── Validaciones ──────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};
    if (!form.nombre.trim())      e.nombre      = "El nombre es requerido.";
    if (!form.tipo)               e.tipo         = "Selecciona un tipo de cocina.";
    if (!form.distrito.trim())    e.distrito     = "El distrito es requerido.";
    if (!form.direccion.trim())   e.direccion    = "La dirección es requerida.";
    if (!form.horarioApertura)    e.horarioApertura = "El horario de apertura es requerido.";
    if (!form.horarioCierre)      e.horarioCierre   = "El horario de cierre es requerido.";
    if (!form.mesas || parseInt(form.mesas) < 1)
                                  e.mesas        = "Ingresa al menos 1 mesa.";
    if (form.telefono && !/^\d{9}$/.test(form.telefono))
                                  e.telefono     = "El teléfono debe tener 9 dígitos.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                  e.email        = "Ingresa un email válido.";
    return e;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validaciones = validar();
    if (Object.keys(validaciones).length > 0) {
      setErrors(validaciones);
      return;
    }

    setLoading(true);
    try {
      await agregarRestaurante({
        ...form,
        telefono:        parseInt(form.telefono) || null,
        mesas:           parseInt(form.mesas),
        horarioApertura: form.horarioApertura,
        horarioCierre:   form.horarioCierre,
      });
      // FIX: ruta corregida de /intranet/restaurantes → /intranet/restaurants
      navigate("/intranet/restaurants");
    } catch (err) {
      setError("Error al crear el restaurante: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (name) =>
    `form-control${errors[name] ? " is-invalid" : ""}`;

  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      {/* Cabecera */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          // FIX: ruta corregida aquí también
          onClick={() => navigate("/intranet/restaurants")}
        >
          <i className="bi bi-arrow-left me-1" />
          Volver
        </button>
        <h4 className="mb-0">
          <i className="bi bi-shop-window me-2 text-warning" />
          Crear restaurante
        </h4>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Sección 1: Identidad ──────────────────────────────────────── */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header fw-semibold">
            <i className="bi bi-info-circle me-2 text-primary" />
            Sección 1 — Identidad
          </div>
          <div className="card-body">
            <div className="row g-3">

              {/* Nombre */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Nombre del restaurante <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handle}
                  className={fieldClass("nombre")}
                  placeholder="Ej: La Huerta del Sabor"
                />
                {errors.nombre && (
                  <div className="invalid-feedback">{errors.nombre}</div>
                )}
              </div>

              {/* Tipo */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Tipo de cocina <span className="text-danger">*</span>
                </label>
                <select
                  name="tipo"
                  value={form.tipo}
                  onChange={handle}
                  className={fieldClass("tipo")}
                >
                  <option value="">Seleccionar tipo...</option>
                  {tiposComida.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.tipo && (
                  <div className="invalid-feedback">{errors.tipo}</div>
                )}
              </div>

              {/* Mensaje personalizado */}
              <div className="col-12">
                <label className="form-label fw-semibold">
                  Mensaje personalizado{" "}
                  <span className="text-muted fw-normal">(slogan / bienvenida)</span>
                </label>
                <textarea
                  name="mensajePersonalizado"
                  value={form.mensajePersonalizado}
                  onChange={handle}
                  className="form-control"
                  rows={3}
                  placeholder="Ej: ¡El mejor sabor norteño en el corazón de la ciudad!"
                />
              </div>

            </div>
          </div>
        </div>

        {/* ── Sección 2: Ubicación y Horarios ──────────────────────────── */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header fw-semibold">
            <i className="bi bi-geo-alt me-2 text-danger" />
            Sección 2 — Ubicación y Horarios
          </div>
          <div className="card-body">
            <div className="row g-3">

              {/* Distrito */}
              <div className="col-md-5">
                <label className="form-label fw-semibold">
                  Distrito <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="distrito"
                  value={form.distrito}
                  onChange={handle}
                  list="lista-distritos-intra"
                  className={fieldClass("distrito")}
                  placeholder="Escribe o selecciona..."
                />
                <datalist id="lista-distritos-intra">
                  {sugerenciasDistritos.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
                {errors.distrito && (
                  <div className="invalid-feedback">{errors.distrito}</div>
                )}
              </div>

              {/* Dirección */}
              <div className="col-md-7">
                <label className="form-label fw-semibold">
                  Dirección exacta <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={form.direccion}
                  onChange={handle}
                  className={fieldClass("direccion")}
                  placeholder="Av. / Jr. / Calle y número"
                />
                {errors.direccion && (
                  <div className="invalid-feedback">{errors.direccion}</div>
                )}
              </div>

              {/* Horario apertura */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Horario de apertura <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  name="horarioApertura"
                  value={form.horarioApertura}
                  onChange={handle}
                  className={fieldClass("horarioApertura")}
                />
                {errors.horarioApertura && (
                  <div className="invalid-feedback">{errors.horarioApertura}</div>
                )}
              </div>

              {/* Horario cierre */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Horario de cierre <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  name="horarioCierre"
                  value={form.horarioCierre}
                  onChange={handle}
                  className={fieldClass("horarioCierre")}
                />
                {errors.horarioCierre && (
                  <div className="invalid-feedback">{errors.horarioCierre}</div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── Sección 3: Operación ──────────────────────────────────────── */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header fw-semibold">
            <i className="bi bi-gear me-2 text-success" />
            Sección 3 — Operación
          </div>
          <div className="card-body">
            <div className="row g-3">

              {/* Mesas */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  Cantidad de mesas <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  name="mesas"
                  value={form.mesas}
                  onChange={handle}
                  min="1"
                  className={fieldClass("mesas")}
                  placeholder="Ej: 12"
                />
                {errors.mesas && (
                  <div className="invalid-feedback">{errors.mesas}</div>
                )}
              </div>

              {/* Imagen (URL) */}
              <div className="col-md-8">
                <label className="form-label fw-semibold">
                  URL de imagen{" "}
                  <span className="text-muted fw-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="imagen"
                  value={form.imagen}
                  onChange={handle}
                  className="form-control"
                  placeholder="https://ejemplo.com/foto.jpg"
                />
                {form.imagen && (
                  <img
                    src={form.imagen}
                    alt="Preview"
                    className="mt-2 rounded"
                    style={{ height: 80, objectFit: "cover" }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── Sección 4: Contacto ───────────────────────────────────────── */}
        <div className="card mb-4 shadow-sm">
          <div className="card-header fw-semibold">
            <i className="bi bi-telephone me-2 text-info" />
            Sección 4 — Contacto
          </div>
          <div className="card-body">
            <div className="row g-3">

              {/* Teléfono */}
              <div className="col-md-4">
                <label className="form-label fw-semibold">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={(e) =>
                    handle({ target: { name: "telefono", value: e.target.value.replace(/\D/g, "").slice(0, 9) } })
                  }
                  className={fieldClass("telefono")}
                  placeholder="9 dígitos"
                  maxLength={9}
                />
                {errors.telefono && (
                  <div className="invalid-feedback">{errors.telefono}</div>
                )}
              </div>

              {/* Email */}
              <div className="col-md-8">
                <label className="form-label fw-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handle}
                  className={fieldClass("email")}
                  placeholder="contacto@restaurante.com"
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── Botones de acción ─────────────────────────────────────────── */}
        <div className="d-flex gap-3 justify-content-end">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => navigate("/intranet/restaurants")}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-warning fw-semibold px-4"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Creando...
              </>
            ) : (
              <>
                <i className="bi bi-plus-circle me-2" />
                Crear restaurante
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}