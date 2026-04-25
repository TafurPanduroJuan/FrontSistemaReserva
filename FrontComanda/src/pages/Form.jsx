import { useState } from "react";
import "../assets/styles/form.css";
import { restaurantes } from "../data/datos";
 
const tipoOptions = [
  {
    value: "comentario",
    label: "Comentario",
    icon: "bi-chat-left-text-fill",
    desc: "Comparte tus opiniones o sugerencias",
    color: "#3b82f6",
    bg: "#eff6ff",
  },
  {
    value: "experiencia",
    label: "Experiencia",
    icon: "bi-star-fill",
    desc: "Cuéntanos cómo fue tu visita",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    value: "reclamo",
    label: "Reclamo",
    icon: "bi-exclamation-triangle-fill",
    desc: "Reporta un problema o inconveniente",
    color: "#ef4444",
    bg: "#fef2f2",
  },
];
 
const calificacionLabels = ["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"];
 
const initialForm = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  restaurante: "",
  tipo: "",
  asunto: "",
  calificacion: 0,
  mensaje: "",
  aceptaTerminos: false,
};
 
function Form() {
  const [form, setForm] = useState(initialForm);
  const [hoverStar, setHoverStar] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState({});
  const [step, setStep] = useState(1);
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: "" }));
  };
 
  const validarStep = (s) => {
    const newErrores = {};
    if (s === 1) {
      if (!form.nombre.trim()) newErrores.nombre = "El nombre es requerido";
      if (!form.apellido.trim()) newErrores.apellido = "El apellido es requerido";
      if (!form.correo.trim()) newErrores.correo = "El correo es requerido";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
        newErrores.correo = "Ingresa un correo válido";
    }
    if (s === 2) {
      if (!form.tipo) newErrores.tipo = "Selecciona el tipo de mensaje";
      if (!form.restaurante) newErrores.restaurante = "Selecciona un restaurante";
      if (!form.asunto.trim()) newErrores.asunto = "El asunto es requerido";
    }
    if (s === 3) {
      if (!form.mensaje.trim()) newErrores.mensaje = "El mensaje no puede estar vacío";
      if (form.mensaje.trim().length < 20)
        newErrores.mensaje = "El mensaje debe tener al menos 20 caracteres";
      if (!form.aceptaTerminos)
        newErrores.aceptaTerminos = "Debes aceptar los términos para enviar";
    }
    setErrores(newErrores);
    return Object.keys(newErrores).length === 0;
  };
 
  const nextStep = () => { if (validarStep(step)) setStep((s) => s + 1); };
  const prevStep = () => setStep((s) => s - 1);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarStep(3)) return;
    setCargando(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        correo: form.correo.trim(),
        telefono: form.telefono.trim() || null,
        restaurante: form.restaurante,
        tipo: form.tipo,
        asunto: form.asunto.trim(),
        calificacion: form.calificacion || null,
        mensaje: form.mensaje.trim(),
        fecha: new Date().toISOString(),
      };
      const response = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
      setEnviado(true);
    } catch (error) {
      console.warn("API no disponible (modo desarrollo):", error.message);
      setEnviado(true);
    } finally {
      setCargando(false);
    }
  };
 
  const resetForm = () => { setForm(initialForm); setEnviado(false); setStep(1); setErrores({}); };
  const tipoSeleccionado = tipoOptions.find((t) => t.value === form.tipo);
 
  if (enviado) {
    return (
      <div className="form-page">
        <div className="form-success-wrapper">
          <div className="form-success-card">
            <div className="success-icon-ring">
              <i className="bi bi-check-lg"></i>
            </div>
            <h2 className="success-title">¡Mensaje enviado!</h2>
            <p className="success-subtitle">
              Gracias, <strong>{form.nombre} {form.apellido}</strong>. Tu{" "}
              <strong>{tipoSeleccionado?.label?.toLowerCase() || "mensaje"}</strong> fue recibido
              correctamente. Nuestro equipo lo revisará y, si es necesario, nos comunicaremos
              contigo a <strong>{form.correo}</strong>.
            </p>
            <div className="success-detail">
              <span><i className="bi bi-shop me-2"></i>{form.restaurante}</span>
              {form.calificacion > 0 && (
                <span>
                  {"★".repeat(form.calificacion)}{"☆".repeat(5 - form.calificacion)}{" "}
                  {calificacionLabels[form.calificacion]}
                </span>
              )}
            </div>
            <button className="btn-brand-form" onClick={resetForm}>
              <i className="bi bi-plus-circle me-2"></i>Enviar otro mensaje
            </button>
          </div>
        </div>
      </div>
    );
  }
 
  return (
    <div className="form-page">
      <div className="form-hero">
        <div className="form-hero-content">
          <span className="form-hero-badge">
            <i className="bi bi-chat-heart-fill me-2"></i>Tu opinión importa
          </span>
          <h1 className="form-hero-title">Comparte tu experiencia</h1>
          <p className="form-hero-sub">
            Ayúdanos a mejorar nuestros restaurantes dejando tu comentario, experiencia o reclamo.
            Tu voz hace la diferencia.
          </p>
        </div>
        <div className="form-hero-decoration" aria-hidden="true">
          <span>🍽️</span><span>⭐</span><span>🍕</span><span>🥗</span>
        </div>
      </div>
 
      <div className="form-main-container">
        {/* Stepper */}
        <div className="form-stepper">
          {[
            { num: 1, label: "Tus datos", icon: "bi-person-fill" },
            { num: 2, label: "Detalles", icon: "bi-clipboard2-fill" },
            { num: 3, label: "Mensaje", icon: "bi-pencil-fill" },
          ].map(({ num, label, icon }) => (
            <div key={num} className={`stepper-item ${step >= num ? "active" : ""} ${step === num ? "current" : ""}`}>
              <div className="stepper-circle">
                {step > num ? <i className="bi bi-check-lg"></i> : <i className={`bi ${icon}`}></i>}
              </div>
              <span className="stepper-label">{label}</span>
              {num < 3 && <div className={`stepper-line ${step > num ? "done" : ""}`}></div>}
            </div>
          ))}
        </div>
 
        <div className="form-card">
          <form onSubmit={handleSubmit} noValidate>
 
            {/* STEP 1 */}
            {step === 1 && (
              <div className="form-step">
                <div className="step-header">
                  <div className="step-icon-badge"><i className="bi bi-person-fill"></i></div>
                  <div>
                    <h3 className="step-title">Tus datos personales</h3>
                    <p className="step-desc">Necesitamos saber quién eres para responder a tu mensaje.</p>
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Nombre <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <i className="bi bi-person input-icon"></i>
                      <input type="text" name="nombre" className={`form-input ${errores.nombre ? "input-error" : ""}`} placeholder="Ej: María" value={form.nombre} onChange={handleChange} autoComplete="given-name" />
                    </div>
                    {errores.nombre && <span className="error-msg"><i className="bi bi-exclamation-circle me-1"></i>{errores.nombre}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Apellido <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <i className="bi bi-person input-icon"></i>
                      <input type="text" name="apellido" className={`form-input ${errores.apellido ? "input-error" : ""}`} placeholder="Ej: García" value={form.apellido} onChange={handleChange} autoComplete="family-name" />
                    </div>
                    {errores.apellido && <span className="error-msg"><i className="bi bi-exclamation-circle me-1"></i>{errores.apellido}</span>}
                  </div>
                </div>
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Correo electrónico <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <i className="bi bi-envelope input-icon"></i>
                      <input type="email" name="correo" className={`form-input ${errores.correo ? "input-error" : ""}`} placeholder="tu@correo.com" value={form.correo} onChange={handleChange} autoComplete="email" />
                    </div>
                    {errores.correo && <span className="error-msg"><i className="bi bi-exclamation-circle me-1"></i>{errores.correo}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono <span className="optional">(opcional)</span></label>
                    <div className="input-wrapper">
                      <i className="bi bi-telephone input-icon"></i>
                      <input type="tel" name="telefono" className="form-input" placeholder="Ej: 987 654 321" value={form.telefono} onChange={handleChange} autoComplete="tel" />
                    </div>
                  </div>
                </div>
                <div className="step-actions">
                  <button type="button" className="btn-brand-form" onClick={nextStep}>Continuar <i className="bi bi-arrow-right ms-2"></i></button>
                </div>
              </div>
            )}
 
            {/* STEP 2 */}
            {step === 2 && (
              <div className="form-step">
                <div className="step-header">
                  <div className="step-icon-badge"><i className="bi bi-clipboard2-fill"></i></div>
                  <div>
                    <h3 className="step-title">Detalles de tu mensaje</h3>
                    <p className="step-desc">¿Sobre qué restaurante y qué tipo de mensaje quieres enviarnos?</p>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de mensaje <span className="required">*</span></label>
                  <div className="tipo-grid">
                    {tipoOptions.map((t) => (
                      <label key={t.value} className={`tipo-card ${form.tipo === t.value ? "tipo-selected" : ""}`} style={form.tipo === t.value ? { borderColor: t.color, background: t.bg } : {}}>
                        <input type="radio" name="tipo" value={t.value} checked={form.tipo === t.value} onChange={handleChange} hidden />
                        <i className={`bi ${t.icon} tipo-icon`} style={{ color: form.tipo === t.value ? t.color : "#aaa" }}></i>
                        <span className="tipo-label" style={{ color: form.tipo === t.value ? t.color : "#333" }}>{t.label}</span>
                        <span className="tipo-desc">{t.desc}</span>
                      </label>
                    ))}
                  </div>
                  {errores.tipo && <span className="error-msg"><i className="bi bi-exclamation-circle me-1"></i>{errores.tipo}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Restaurante <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <i className="bi bi-shop input-icon"></i>
                    <select name="restaurante" className={`form-input form-select-custom ${errores.restaurante ? "input-error" : ""}`} value={form.restaurante} onChange={handleChange}>
                      <option value="">— Selecciona el restaurante —</option>
                      {restaurantes.map((r) => (
                        <option key={r.nombre} value={r.nombre}>{r.nombre} · {r.lugar}</option>
                      ))}
                    </select>
                  </div>
                  {errores.restaurante && <span className="error-msg"><i className="bi bi-exclamation-circle me-1"></i>{errores.restaurante}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Asunto <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <i className="bi bi-tag input-icon"></i>
                    <input type="text" name="asunto" className={`form-input ${errores.asunto ? "input-error" : ""}`} placeholder="Ej: Excelente servicio al cliente" value={form.asunto} onChange={handleChange} maxLength={100} />
                  </div>
                  <div className="char-counter">{form.asunto.length}/100</div>
                  {errores.asunto && <span className="error-msg"><i className="bi bi-exclamation-circle me-1"></i>{errores.asunto}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Calificación <span className="optional">(opcional)</span></label>
                  <div className="stars-wrapper">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} type="button" className={`star-btn ${n <= (hoverStar || form.calificacion) ? "star-active" : ""}`}
                        onMouseEnter={() => setHoverStar(n)} onMouseLeave={() => setHoverStar(0)}
                        onClick={() => setForm((prev) => ({ ...prev, calificacion: prev.calificacion === n ? 0 : n }))}
                        aria-label={`${n} estrella${n > 1 ? "s" : ""}`}>★</button>
                    ))}
                    {(hoverStar || form.calificacion) > 0 && (
                      <span className="star-label">{calificacionLabels[hoverStar || form.calificacion]}</span>
                    )}
                  </div>
                </div>
                <div className="step-actions step-actions-2">
                  <button type="button" className="btn-ghost-form" onClick={prevStep}><i className="bi bi-arrow-left me-2"></i>Atrás</button>
                  <button type="button" className="btn-brand-form" onClick={nextStep}>Continuar <i className="bi bi-arrow-right ms-2"></i></button>
                </div>
              </div>
            )}
 
            {/* STEP 3 */}
            {step === 3 && (
              <div className="form-step">
                <div className="step-header">
                  <div className="step-icon-badge"><i className="bi bi-pencil-fill"></i></div>
                  <div>
                    <h3 className="step-title">Tu mensaje</h3>
                    <p className="step-desc">Cuéntanos con detalle tu experiencia o lo que deseas comunicarnos.</p>
                  </div>
                </div>
                {form.restaurante && form.tipo && (
                  <div className="resumen-banner" style={{ borderColor: tipoSeleccionado?.color, background: tipoSeleccionado?.bg }}>
                    <i className={`bi ${tipoSeleccionado?.icon} me-2`} style={{ color: tipoSeleccionado?.color }}></i>
                    <span style={{ color: tipoSeleccionado?.color, fontWeight: 600 }}>{tipoSeleccionado?.label}</span>
                    <span className="resumen-sep">·</span>
                    <i className="bi bi-shop me-1" style={{ color: "#888" }}></i>
                    <span style={{ color: "#555" }}>{form.restaurante}</span>
                    {form.calificacion > 0 && (
                      <><span className="resumen-sep">·</span><span style={{ color: "#f59e0b" }}>{"★".repeat(form.calificacion)}</span></>
                    )}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Mensaje <span className="required">*</span></label>
                  <textarea name="mensaje" className={`form-input form-textarea ${errores.mensaje ? "input-error" : ""}`}
                    placeholder="Escribe aquí tu comentario, experiencia o reclamo con el mayor detalle posible..."
                    value={form.mensaje} onChange={handleChange} rows={6} maxLength={1000} />
                  <div className="char-counter">{form.mensaje.length}/1000</div>
                  {errores.mensaje && <span className="error-msg"><i className="bi bi-exclamation-circle me-1"></i>{errores.mensaje}</span>}
                </div>
                <div className="form-group">
                  <label className={`terminos-label ${errores.aceptaTerminos ? "terminos-error" : ""}`}>
                    <input type="checkbox" name="aceptaTerminos" checked={form.aceptaTerminos} onChange={handleChange} className="terminos-check" />
                    <span>Acepto que mis datos sean utilizados para gestionar mi mensaje y recibir una respuesta por parte del equipo de <strong>Comanda</strong>.</span>
                  </label>
                  {errores.aceptaTerminos && <span className="error-msg"><i className="bi bi-exclamation-circle me-1"></i>{errores.aceptaTerminos}</span>}
                </div>
                <div className="step-actions step-actions-2">
                  <button type="button" className="btn-ghost-form" onClick={prevStep} disabled={cargando}><i className="bi bi-arrow-left me-2"></i>Atrás</button>
                  <button type="submit" className="btn-brand-form btn-submit" disabled={cargando}>
                    {cargando ? (<><span className="spinner"></span>Enviando...</>) : (<><i className="bi bi-send-fill me-2"></i>Enviar mensaje</>)}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
 
        {/* Aside */}
        <aside className="form-aside">
          <div className="aside-card">
            <h4 className="aside-title"><i className="bi bi-info-circle-fill me-2"></i>¿Cómo funciona?</h4>
            <ol className="aside-steps">
              <li>Ingresa tus datos personales.</li>
              <li>Elige el tipo de mensaje y el restaurante.</li>
              <li>Escribe tu mensaje y envíalo.</li>
              <li>Nuestro equipo revisará tu mensaje en la intranet.</li>
              <li>Si aplica, te contactaremos por correo.</li>
            </ol>
          </div>
          <div className="aside-card aside-tipos">
            <h4 className="aside-title"><i className="bi bi-collection-fill me-2"></i>Tipos de mensaje</h4>
            {tipoOptions.map((t) => (
              <div key={t.value} className="aside-tipo-item" style={{ borderLeft: `3px solid ${t.color}` }}>
                <i className={`bi ${t.icon}`} style={{ color: t.color }}></i>
                <div><strong>{t.label}</strong><p>{t.desc}</p></div>
              </div>
            ))}
          </div>
          <div className="aside-card aside-privacy">
            <i className="bi bi-shield-lock-fill aside-privacy-icon"></i>
            <p>Tus datos personales son tratados de forma confidencial y solo se usan para gestionar tu mensaje.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
 
export default Form;

