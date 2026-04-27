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

// Solo letras, tildes y espacios
const soloTexto = (v) => v.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, "");
// Solo números
const soloNumeros = (v) => v.replace(/\D/g, "");

function RegistrarRestaurante() {
  const { agregarSolicitud } = useRestaurantes();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handle = (e) => {
    const { name, value } = e.target;
    let nuevoValor = value;

    // Campos de solo texto
    if (["nombre", "propietario", "distrito"].includes(name)) {
      nuevoValor = soloTexto(value);
    }
    // Campo teléfono: solo números, máx 9 dígitos
    if (name === "telefono") {
      nuevoValor = soloNumeros(value).slice(0, 9);
    }
    // Campo mesas: solo números
    if (name === "mesas") {
      nuevoValor = soloNumeros(value);
    }

    setForm((prev) => ({ ...prev, [name]: nuevoValor }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
    if (!form.email.trim()) {
      e.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Ingresa un email válido";
    }
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

  // ── Estilos ────────────────────────────────────────────────────────────────
  const inputBase = {
    width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: "0.9rem",
    outline: "none", background: "white", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s", fontFamily: "inherit",
  };
  const inputStyle = (field) => ({
    ...inputBase,
    border: `1.5px solid ${errors[field] ? "#ef4444" : "#e8e0d8"}`,
    boxShadow: errors[field] ? "0 0 0 3px rgba(239,68,68,0.1)" : "none",
  });
  const labelStyle = {
    fontSize: "0.82rem", fontWeight: 600, color: "#444",
    marginBottom: "6px", display: "block",
  };
  const errorMsg = (field) => errors[field]
    ? <small style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
        <i className="bi bi-exclamation-circle" />{errors[field]}
      </small>
    : null;

  // ── Pantalla de éxito ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", background: "#f8f7f5" }}>
        <div style={{
          background: "white", padding: "52px 44px", borderRadius: "24px",
          textAlign: "center", maxWidth: 540, width: "100%",
          boxShadow: "0 8px 40px rgba(0,0,0,0.09)", border: "1px solid #f0ece6",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#ff9f22,#ff3300)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", fontSize: "2rem", color: "white",
          }}>✓</div>
          <h3 style={{ color: "#1a1a2e", fontWeight: 800, marginBottom: 12, fontSize: "1.4rem" }}>
            ¡Solicitud Enviada!
          </h3>
          <p style={{ color: "#666", lineHeight: 1.7, marginBottom: 8 }}>
            Tu solicitud para <strong>{form.nombre}</strong> fue recibida correctamente.
          </p>
          <p style={{ color: "#888", fontSize: "0.88rem", marginBottom: 30 }}>
            Nuestro equipo revisará tu información y te responderá a <strong>{form.email}</strong>.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/")} style={{
              padding: "12px 28px", borderRadius: 10, border: "1.5px solid #e8e0d8",
              background: "white", color: "#555", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
            }}>Volver al inicio</button>
            <button onClick={() => { setForm(initialForm); setPreview(null); setSubmitted(false); }} style={{
              padding: "12px 28px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#ff9f22,#ff3300)",
              color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
            }}>Enviar otra solicitud</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#f8f7f5", minHeight: "100vh" }}>

      {/* ── Hero Banner ── */}
      <div style={{
        background: "linear-gradient(135deg,#ff9f22 0%,#ff3300 100%)",
        padding: "52px 24px 56px", textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        {/* Círculos decorativos */}
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.07)", top: -80, right: -40, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.07)", bottom: -60, left: 40, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)",
            color: "white", borderRadius: 20, padding: "5px 16px",
            fontSize: "0.78rem", fontWeight: 700, letterSpacing: 1, marginBottom: 16,
          }}>
            <i className="bi bi-shop-window" /> PARA RESTAURANTES
          </span>
          <h2 style={{ color: "white", fontWeight: 800, fontSize: "clamp(1.7rem,3vw,2.4rem)", marginBottom: 10, margin: "0 0 10px" }}>
            Registra tu Restaurante
          </h2>
          <p style={{ color: "rgba(255,255,255,0.88)", maxWidth: 520, margin: "0 auto", fontSize: "1rem", lineHeight: 1.65 }}>
            Completa el formulario y nuestro equipo revisará tu solicitud. Una vez aceptada, tu restaurante aparecerá en el catálogo.
          </p>
        </div>
      </div>

      {/* ── Formulario Card ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 16px 60px" }}>
        <div style={{
          background: "white", borderRadius: 24,
          boxShadow: "0 6px 32px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}>
          <form onSubmit={handleSubmit}>

            {/* ═══ SECCIÓN 1: IDENTIDAD ═══ */}
            <div style={{ padding: "32px 36px", borderBottom: "1px solid #f0ece6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg,#ff9f22,#ff3300)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
                }}>1</div>
                <div>
                  <p style={{ fontWeight: 700, color: "#1a1a2e", margin: 0, fontSize: "1rem" }}>Identidad del Restaurante</p>
                  <p style={{ color: "#aaa", margin: 0, fontSize: "0.8rem" }}>Nombre, tipo de cocina y descripción</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-7">
                  <label style={labelStyle}>Nombre Comercial <span style={{ color: "#ef4444" }}>*</span></label>
                  <input name="nombre" value={form.nombre} onChange={handle}
                    style={inputStyle("nombre")} placeholder="Nombre del restaurante" />
                  {errorMsg("nombre")}
                </div>
                <div className="col-md-5">
                  <label style={labelStyle}>Tipo de Cocina <span style={{ color: "#ef4444" }}>*</span></label>
                  <select name="tipo" value={form.tipo} onChange={handle} style={inputStyle("tipo")}>
                    <option value="">Seleccionar tipo...</option>
                    {tiposComida.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errorMsg("tipo")}
                </div>
                <div className="col-12">
                  <label style={labelStyle}>Eslogan o mensaje de bienvenida <span style={{ color: "#bbb", fontWeight: 400 }}>(opcional)</span></label>
                  <input name="mensaje_personalizado" value={form.mensaje_personalizado} onChange={handle}
                    style={inputStyle("mensaje_personalizado")}
                    placeholder='Ej: "El mejor sabor norteño en el corazón de la ciudad"' />
                </div>
                <div className="col-12">
                  <label style={labelStyle}>Descripción <span style={{ color: "#bbb", fontWeight: 400 }}>(opcional)</span></label>
                  <textarea name="descripcion" value={form.descripcion} onChange={handle}
                    style={{ ...inputStyle("descripcion"), resize: "vertical", minHeight: 90 }}
                    placeholder="Cuéntanos sobre tu restaurante, especialidades, historia..." />
                </div>
              </div>
            </div>

            {/* ═══ SECCIÓN 2: UBICACIÓN ═══ */}
            <div style={{ padding: "32px 36px", borderBottom: "1px solid #f0ece6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg,#ff9f22,#ff3300)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
                }}>2</div>
                <div>
                  <p style={{ fontWeight: 700, color: "#1a1a2e", margin: 0, fontSize: "1rem" }}>Ubicación</p>
                  <p style={{ color: "#aaa", margin: 0, fontSize: "0.8rem" }}>Distrito y dirección exacta</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-5">
                  <label style={labelStyle}>Distrito o Zona <span style={{ color: "#ef4444" }}>*</span></label>
                  <input name="distrito" list="lista-distritos-pub" value={form.distrito} onChange={handle}
                    style={inputStyle("distrito")} placeholder="Escribe o selecciona..." />
                  <datalist id="lista-distritos-pub">
                    {sugerenciasDistritos.map((d) => <option key={d} value={d} />)}
                  </datalist>
                  {errorMsg("distrito")}
                </div>
                <div className="col-md-7">
                  <label style={labelStyle}>Dirección Exacta <span style={{ color: "#ef4444" }}>*</span></label>
                  <input name="direccion" value={form.direccion} onChange={handle}
                    style={inputStyle("direccion")} placeholder="Av. / Jr. / Calle y número" />
                  {errorMsg("direccion")}
                </div>
              </div>
            </div>

            {/* ═══ SECCIÓN 3: PROPIETARIO Y CONTACTO ═══ */}
            <div style={{ padding: "32px 36px", borderBottom: "1px solid #f0ece6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg,#ff9f22,#ff3300)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
                }}>3</div>
                <div>
                  <p style={{ fontWeight: 700, color: "#1a1a2e", margin: 0, fontSize: "1rem" }}>Datos del Propietario y Contacto</p>
                  <p style={{ color: "#aaa", margin: 0, fontSize: "0.8rem" }}>Información del responsable del restaurante</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label style={labelStyle}>Nombre del Propietario <span style={{ color: "#ef4444" }}>*</span></label>
                  <input name="propietario" value={form.propietario} onChange={handle}
                    style={inputStyle("propietario")} placeholder="Nombre completo" />
                  {errorMsg("propietario")}
                </div>
                <div className="col-md-6">
                  <label style={labelStyle}>Email de Gestión <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="email" name="email" value={form.email} onChange={handle}
                    style={inputStyle("email")} placeholder="gerencia@restaurante.com" />
                  {errorMsg("email")}
                </div>
                <div className="col-md-6">
                  <label style={labelStyle}>Teléfono de Reservas <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="987654321"
                    value={form.telefono}
                    onChange={handle}
                    name="telefono"
                    maxLength={9}
                    style={inputStyle("telefono")}
                  />
                  {errors.telefono ? (
                    <small style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <i className="bi bi-exclamation-circle" />{errors.telefono}
                    </small>
                  ) : form.telefono.length > 0 && telefonoValido ? (
                    <small style={{ color: "#2ecc71", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                      <i className="bi bi-check-circle" />Teléfono válido
                    </small>
                  ) : null}
                </div>
              </div>
            </div>

            {/* ═══ SECCIÓN 4: IMAGEN ═══ */}
            <div style={{ padding: "32px 36px", borderBottom: "1px solid #f0ece6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg,#ff9f22,#ff3300)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
                }}>4</div>
                <div>
                  <p style={{ fontWeight: 700, color: "#1a1a2e", margin: 0, fontSize: "1rem" }}>Imagen del Restaurante</p>
                  <p style={{ color: "#aaa", margin: 0, fontSize: "0.8rem" }}>Foto de fachada o interior (opcional)</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{
                  border: "2px dashed #e8e0d8", borderRadius: 16, width: 220, height: 160,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", position: "relative", background: "#fcfcfc",
                  flexShrink: 0,
                }}>
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" onClick={() => setPreview(null)} style={{
                        position: "absolute", top: 6, right: 6, background: "#ef4444",
                        color: "white", border: "none", borderRadius: "50%",
                        width: 26, height: 26, cursor: "pointer", fontSize: "1.1rem",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>&times;</button>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", color: "#bbb" }}>
                      <i className="bi bi-image" style={{ fontSize: "2.2rem" }}></i>
                      <p style={{ fontSize: "0.72rem", marginTop: 6, marginBottom: 0, color: "#aaa" }}>Subir imagen</p>
                      <input type="file" accept="image/*" onChange={handleImagen}
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ fontSize: "0.83rem", color: "#888", lineHeight: 1.6, margin: 0 }}>
                    Sube una foto de la fachada o interior de tu restaurante para que los clientes puedan reconocerlo fácilmente en el catálogo.
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "#bbb", marginTop: 8, marginBottom: 0 }}>
                    Formatos: JPG, PNG, WEBP · Máx. 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* ═══ AVISO + ACCIONES ═══ */}
            <div style={{ padding: "28px 36px" }}>
              <div style={{
                background: "#fff8f0", border: "1px solid #ffd8b0", borderRadius: 12,
                padding: "14px 18px", marginBottom: 24, display: "flex", gap: 10, alignItems: "flex-start",
              }}>
                <i className="bi bi-info-circle-fill" style={{ color: "#ff9f22", fontSize: "1.1rem", marginTop: 2 }}></i>
                <div style={{ fontSize: "0.83rem", color: "#a05a00", lineHeight: 1.6 }}>
                  Tu solicitud será revisada por nuestro equipo. Una vez <strong>aceptada</strong>, tu restaurante
                  aparecerá en el <strong>catálogo público</strong> y en la sección de restaurantes activos.
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button type="button"
                  onClick={() => { setForm(initialForm); setPreview(null); setErrors({}); }}
                  style={{
                    padding: "12px 24px", borderRadius: 10, border: "1.5px solid #e8e0d8",
                    background: "white", color: "#999", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                  }}>
                  Limpiar
                </button>
                <button type="submit" style={{
                  padding: "12px 36px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg,#ff9f22,#ff3300)",
                  color: "white", fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(255,107,0,0.28)", fontSize: "0.95rem",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <i className="bi bi-send" />Enviar Solicitud
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default RegistrarRestaurante;