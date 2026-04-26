import React, { useState } from "react";
import { useRestaurantes } from "../context/RestaurantesContext";
import { useNavigate } from "react-router-dom";

const tiposComida = [
  "Criolla", "Italiana", "Japonesa", "Mariscos", "Vegana",
  "Parrilla", "Mexicana", "Peruana", "Francesa", "Fusión",
  "Moderna", "Asiática", "Postres",
];
const sugerenciasDistritos = [
  "Miraflores", "San Isidro", "Barranco", "Surco", "La Molina",
  "Chorrillos", "Lince", "Jesús María", "Pueblo Libre", "Magdalena",
];

const initialForm = {
  nombre: "", tipo: "", distrito: "", direccion: "",
  horario_apertura: "", horario_cierre: "", precio: "",
  mesas: "", descripcion: "", telefono: "", email: "",
  propietario: "", mensaje_personalizado: "",
};

function RegistrarRestaurante() {
  const { agregarSolicitud } = useRestaurantes();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTelefono = (e) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 9);
    setForm((prev) => ({ ...prev, telefono: valor }));
    if (errors.telefono) setErrors((prev) => ({ ...prev, telefono: "" }));
  };

  const telefonoValido = form.telefono.length === 9;

  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.tipo) e.tipo = "Selecciona un tipo de cocina";
    if (!form.distrito.trim()) e.distrito = "Ingresa un distrito o lugar";
    if (!form.direccion.trim()) e.direccion = "La dirección es requerida";
    if (!form.propietario.trim()) e.propietario = "El nombre del propietario es requerido";
    if (!form.email.trim()) e.email = "El email es requerido";
    if (!form.telefono.trim()) {
      e.telefono = "El teléfono es requerido";
    } else if (form.telefono.length !== 9) {
      e.telefono = "El teléfono debe tener 9 dígitos";
    }
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    agregarSolicitud({
      nombre: form.nombre,
      propietario: form.propietario,
      email: form.email,
      tipo: form.tipo,
      ciudad: form.distrito,
      telefono: form.telefono,
      descripcion: form.descripcion || form.mensaje_personalizado || "Solicitud enviada desde el formulario público.",
      imagen: preview || null,
    });

    setSubmitted(true);
  };

  const inputStyle = (field) => ({
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: "0.9rem",
    border: `1.5px solid ${errors[field] ? "#ef4444" : "#e8e0d8"}`,
    outline: "none", background: "white", boxSizing: "border-box",
    transition: "border-color 0.2s",
  });

  const labelStyle = {
    fontSize: "0.8rem", fontWeight: 600, color: "#555",
    marginBottom: "5px", display: "block",
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{
          background: "white", padding: "50px 40px", borderRadius: "20px",
          textAlign: "center", maxWidth: 540, width: "100%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid #f0f0f0",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>✅</div>
          <h3 style={{ color: "#1a1a2e", fontWeight: 700, marginBottom: 12 }}>
            ¡Solicitud Enviada!
          </h3>
          <p style={{ color: "#666", lineHeight: 1.6, marginBottom: 8 }}>
            Tu solicitud para registrar <strong>{form.nombre}</strong> ha sido recibida correctamente.
          </p>
          <p style={{ color: "#888", fontSize: "0.88rem", marginBottom: 28 }}>
            Nuestro equipo revisará tu información. Recibirás una respuesta a <strong>{form.email}</strong> pronto.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/")}
              style={{
                padding: "12px 28px", borderRadius: 10, border: "1.5px solid #e8e0d8",
                background: "white", color: "#555", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
              }}
            >
              Volver al inicio
            </button>
            <button
              onClick={() => { setForm(initialForm); setPreview(null); setSubmitted(false); }}
              style={{
                padding: "12px 28px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #ff9f22, #ff3300)",
                color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
              }}
            >
              Enviar otra solicitud
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f7f5", minHeight: "100vh", paddingTop: "30px", paddingBottom: "60px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32, padding: "0 20px" }}>
        <span style={{
          display: "inline-block", background: "linear-gradient(135deg,#ff9f22,#ff3300)",
          color: "white", borderRadius: 20, padding: "4px 18px",
          fontSize: "0.78rem", fontWeight: 700, letterSpacing: 1, marginBottom: 14,
        }}>
          PARA RESTAURANTES
        </span>
        <h2 style={{ color: "#1a1a2e", fontWeight: 800, fontSize: "1.9rem", marginBottom: 8 }}>
          Registra tu Restaurante
        </h2>
        <p style={{ color: "#888", maxWidth: 520, margin: "0 auto", fontSize: "0.95rem", lineHeight: 1.6 }}>
          Completa el formulario y nuestro equipo revisará tu solicitud. Una vez aceptada, tu restaurante aparecerá en el catálogo.
        </p>
      </div>

      {/* Formulario */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px" }}>
        <div style={{
          background: "white", padding: "40px 35px", borderRadius: 20,
          boxShadow: "0 4px 25px rgba(0,0,0,0.06)",
        }}>
          <form onSubmit={handleSubmit}>

            {/* SECCIÓN 1 */}
            <div style={{ marginBottom: 28, borderBottom: "1px solid #f0f0f0", paddingBottom: 24 }}>
              <p style={{ fontWeight: 700, color: "#ff6b00", fontSize: "0.88rem", marginBottom: 16, letterSpacing: 0.5 }}>
                1. IDENTIDAD DEL RESTAURANTE
              </p>
              <div className="row g-3">
                <div className="col-md-7">
                  <label style={labelStyle}>Nombre Comercial *</label>
                  <input name="nombre" value={form.nombre} onChange={handle}
                    style={inputStyle("nombre")} placeholder="Nombre del restaurante" />
                  {errors.nombre && <small style={{ color: "#ef4444" }}>{errors.nombre}</small>}
                </div>
                <div className="col-md-5">
                  <label style={labelStyle}>Tipo de Cocina *</label>
                  <select name="tipo" value={form.tipo} onChange={handle} style={inputStyle("tipo")}>
                    <option value="">Seleccionar tipo...</option>
                    {tiposComida.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.tipo && <small style={{ color: "#ef4444" }}>{errors.tipo}</small>}
                </div>
                <div className="col-12">
                  <label style={labelStyle}>Eslogan o mensaje de bienvenida</label>
                  <input name="mensaje_personalizado" value={form.mensaje_personalizado} onChange={handle}
                    style={inputStyle("mensaje_personalizado")}
                    placeholder="Ej: El mejor sabor norteño en el corazón de la ciudad" />
                </div>
                <div className="col-12">
                  <label style={labelStyle}>Descripción del restaurante</label>
                  <textarea name="descripcion" value={form.descripcion} onChange={handle}
                    style={{ ...inputStyle("descripcion"), resize: "vertical", minHeight: 80 }}
                    placeholder="Cuéntanos sobre tu restaurante, especialidades, historia..." />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2 */}
            <div style={{ marginBottom: 28, borderBottom: "1px solid #f0f0f0", paddingBottom: 24 }}>
              <p style={{ fontWeight: 700, color: "#ff6b00", fontSize: "0.88rem", marginBottom: 16, letterSpacing: 0.5 }}>
                2. UBICACIÓN
              </p>
              <div className="row g-3">
                <div className="col-md-5">
                  <label style={labelStyle}>Distrito o Zona *</label>
                  <input name="distrito" list="lista-distritos-pub" value={form.distrito} onChange={handle}
                    style={inputStyle("distrito")} placeholder="Escribe o selecciona..." />
                  <datalist id="lista-distritos-pub">
                    {sugerenciasDistritos.map((d) => <option key={d} value={d} />)}
                  </datalist>
                  {errors.distrito && <small style={{ color: "#ef4444" }}>{errors.distrito}</small>}
                </div>
                <div className="col-md-7">
                  <label style={labelStyle}>Dirección Exacta *</label>
                  <input name="direccion" value={form.direccion} onChange={handle}
                    style={inputStyle("direccion")} placeholder="Av. / Jr. / Calle y número" />
                  {errors.direccion && <small style={{ color: "#ef4444" }}>{errors.direccion}</small>}
                </div>
              </div>
            </div>

            {/* SECCIÓN 3 */}
            <div style={{ marginBottom: 28, borderBottom: "1px solid #f0f0f0", paddingBottom: 24 }}>
              <p style={{ fontWeight: 700, color: "#ff6b00", fontSize: "0.88rem", marginBottom: 16, letterSpacing: 0.5 }}>
                3. DATOS DEL PROPIETARIO Y CONTACTO
              </p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label style={labelStyle}>Nombre del Propietario *</label>
                  <input name="propietario" value={form.propietario} onChange={handle}
                    style={inputStyle("propietario")} placeholder="Nombre completo" />
                  {errors.propietario && <small style={{ color: "#ef4444" }}>{errors.propietario}</small>}
                </div>
                <div className="col-md-6">
                  <label style={labelStyle}>Email de Gestión *</label>
                  <input type="email" name="email" value={form.email} onChange={handle}
                    style={inputStyle("email")} placeholder="gerencia@restaurante.com" />
                  {errors.email && <small style={{ color: "#ef4444" }}>{errors.email}</small>}
                </div>
                <div className="col-md-6">
                  <label style={labelStyle}>Teléfono de Reservas *</label>
                  <input
                    type="text" inputMode="numeric" placeholder="999 123 456"
                    value={form.telefono} onChange={handleTelefono} maxLength={9}
                    style={inputStyle("telefono")}
                  />
                  {errors.telefono ? (
                    <small style={{ color: "#ef4444", display: "block", marginTop: 4 }}>
                      <i className="bi bi-exclamation-circle me-1" />{errors.telefono}
                    </small>
                  ) : form.telefono.length > 0 && telefonoValido ? (
                    <small style={{ color: "#2ecc71", display: "block", marginTop: 4 }}>
                      <i className="bi bi-check-circle me-1" />Teléfono válido
                    </small>
                  ) : null}
                </div>
              </div>
            </div>

            {/* SECCIÓN 4 */}
            <div style={{ marginBottom: 28 }}>
              <p style={{ fontWeight: 700, color: "#ff6b00", fontSize: "0.88rem", marginBottom: 16, letterSpacing: 0.5 }}>
                4. IMAGEN DEL RESTAURANTE
              </p>
              <div style={{
                border: "2px dashed #e8e0d8", borderRadius: 12, height: 180,
                display: "flex", alignItems: "center", justifyContent: "center",
                overflow: "hidden", position: "relative", background: "#fcfcfc", maxWidth: 360,
              }}>
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => setPreview(null)} style={{
                      position: "absolute", top: 8, right: 8, background: "#ef4444",
                      color: "white", border: "none", borderRadius: "50%",
                      width: 26, height: 26, cursor: "pointer", fontSize: "1.1rem",
                    }}>&times;</button>
                  </>
                ) : (
                  <div style={{ textAlign: "center", color: "#aaa" }}>
                    <i className="bi bi-camera" style={{ fontSize: "2rem" }}></i>
                    <p style={{ fontSize: "0.75rem", marginTop: 6 }}>Subir imagen de fachada (opcional)</p>
                    <input type="file" accept="image/*" onChange={handleImagen}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Aviso */}
            <div style={{
              background: "#fff8f0", border: "1px solid #ffd8b0", borderRadius: 10,
              padding: "14px 18px", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <i className="bi bi-info-circle-fill" style={{ color: "#ff9f22", fontSize: "1.1rem", marginTop: 2 }}></i>
              <div style={{ fontSize: "0.83rem", color: "#a05a00", lineHeight: 1.5 }}>
                Tu solicitud será revisada por nuestro equipo. Una vez <strong>aceptada</strong>, tu restaurante
                aparecerá en el <strong>catálogo público</strong> y en la sección de restaurantes activos.
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button type="button"
                onClick={() => { setForm(initialForm); setPreview(null); setErrors({}); }}
                style={{
                  padding: "12px 24px", borderRadius: 10, border: "1.5px solid #e8e0d8",
                  background: "white", color: "#999", fontWeight: 600, cursor: "pointer",
                }}>
                Limpiar
              </button>
              <button type="submit" style={{
                padding: "12px 36px", borderRadius: 10, border: "none",
                background: "linear-gradient(135deg, #ff9f22, #ff3300)",
                color: "white", fontWeight: 700, cursor: "pointer",
                boxShadow: "0 4px 14px rgba(255,107,0,0.25)", fontSize: "0.95rem",
              }}>
                <i className="bi bi-send me-2"></i>Enviar Solicitud
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrarRestaurante;