import React, { useState, useRef } from "react";
import HorarioSemanalInput, { horarioVacio, horarioToPayload } from "../../components/HorarioSemanalInput";
import { useRestaurants } from "../../context/RestaurantsContext";

const tiposComida = [
  "Criolla","Italiana","Japonesa","Mariscos","Vegana",
  "Parrilla","Mexicana","Peruana","Francesa","Fusión",
  "Moderna","Asiática","Postres","Comida Rápida","China"
];
const sugerenciasDistritos = [
  "Miraflores","San Isidro","Barranco","Surco","La Molina",
  "Chorrillos","Lince","Jesús María","Pueblo Libre","Magdalena",
  "San Borja","San Miguel","Breña","Rímac","Comas",
  "Los Olivos","Independencia","San Martín de Porres"
];

const initialForm = {
  nombre: "", tipo: "", distrito: "", direccion: "",
  mesas: "", telefono: "", email: "",
  mensajePersonalizado: "", imagen: "",
};

/* ── Convierte File a base64 data-URL ── */
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function NewRestaurant() {
  const { agregarRestaurante } = useRestaurants();
  const [form, setForm]           = useState(initialForm);
  const [horarios, setHorarios]     = useState(horarioVacio());
  const [preview, setPreview]     = useState(null);
  const [imgFile, setImgFile]     = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});
  const [dragOver, setDragOver]   = useState(false);
  const fileInputRef = useRef(null);

  /* ── Handlers generales ── */
  const handle = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleTelefono = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
    setForm(prev => ({ ...prev, telefono: val }));
    if (errors.telefono) setErrors(prev => ({ ...prev, telefono: "" }));
  };

  /* ── Manejo de imagen ── */
  const processImage = async (file) => {
    if (!file) return;
    const allowed = ["image/jpeg","image/png","image/webp","image/gif"];
    if (!allowed.includes(file.type)) {
      setErrors(prev => ({ ...prev, imagen: "Solo se permiten imágenes JPG, PNG o WEBP" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, imagen: "La imagen no debe superar 5 MB" }));
      return;
    }
    setErrors(prev => ({ ...prev, imagen: "" }));
    setImgFile(file);
    const b64 = await fileToBase64(file);
    setPreview(b64);
    setForm(prev => ({ ...prev, imagen: b64 }));
  };

  const handleFileChange = (e) => processImage(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processImage(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setImgFile(null);
    setPreview(null);
    setForm(prev => ({ ...prev, imagen: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Validación ── */
  const validate = () => {
    const e = {};
    if (!form.nombre.trim())           e.nombre           = "El nombre es requerido";
    if (!form.tipo)                    e.tipo             = "Selecciona un tipo de cocina";
    if (!form.distrito.trim())         e.distrito         = "Ingresa un distrito o zona";
    if (!form.direccion.trim())        e.direccion        = "La dirección exacta es requerida";
    if (!form.email.trim())            e.email            = "El email es requerido";
    if (!form.telefono.trim()) {
      e.telefono = "El teléfono es requerido";
    } else if (form.telefono.length !== 9) {
      e.telefono = "El teléfono debe tener exactamente 9 dígitos";
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      await agregarRestaurante({
        ...form,
        ...horarioToPayload(horarios),
        mesas:    parseInt(form.mesas)    || 0,
        telefono: parseInt(form.telefono) || null,
      });
      setSubmitted(true);
    } catch (err) {
      setErrors({ _global: err.message || "Error al guardar el restaurante" });
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setForm(initialForm);
    setHorarios(horarioVacio());
    setPreview(null);
    setImgFile(null);
    setErrors({});
    setSubmitted(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Helpers de estilo ── */
  const inp = (field) => ({
    width: "100%", padding: "10px 14px", borderRadius: 10,
    fontSize: "0.875rem",
    border: `1.5px solid ${errors[field] ? "#ef4444" : "#e8e0d8"}`,
    outline: "none", background: "white", boxSizing: "border-box",
    transition: "border-color .2s",
  });
  const lbl = { fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: 5, display: "block" };

  /* ── Pantalla de éxito ── */
  if (submitted) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"60px 20px" }}>
        <div style={{ background:"white", padding:"50px 40px", borderRadius:20, textAlign:"center",
                      maxWidth:520, width:"100%", boxShadow:"0 4px 24px rgba(0,0,0,0.07)" }}>
          <div style={{ fontSize:"4rem", marginBottom:16 }}>✅</div>
          <h4 style={{ color:"#1a1a2e", fontWeight:700, marginBottom:8 }}>¡Restaurante Registrado!</h4>
          <p style={{ color:"#666", marginBottom:0 }}>
            <strong>{form.nombre}</strong> ya está disponible en el catálogo.
          </p>
          {preview && (
            <img src={preview} alt={form.nombre}
              style={{ marginTop:20, height:100, width:"100%", borderRadius:12,
                       objectFit:"cover", boxShadow:"0 2px 10px rgba(0,0,0,0.1)" }} />
          )}
          <button onClick={resetAll}
            style={{ marginTop:24, background:"#ff6b00", color:"white", border:"none",
                     padding:"12px 28px", borderRadius:10, fontWeight:700, cursor:"pointer",
                     boxShadow:"0 4px 12px rgba(255,107,0,0.25)" }}>
            Registrar otro restaurante
          </button>
        </div>
      </div>
    );
  }

  /* ── Formulario ── */
  return (
    <div id="comanda-form-container-v4">
      {/* Cabecera */}
      <div style={{ marginBottom:25 }}>
        <div style={{ fontSize:"1.5rem", fontWeight:700, color:"#1a1a2e" }}>
          <i className="bi bi-shop" style={{ marginRight:10, color:"#ff6b00" }}></i>
          Registrar Restaurante
        </div>
        <p style={{ color:"#888", fontSize:"0.85rem", margin:"4px 0 0" }}>
          Los datos ingresados se publicarán directamente en el catálogo.
        </p>
      </div>

      {errors._global && (
        <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", color:"#dc2626",
                      borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:"0.875rem" }}>
          <i className="bi bi-exclamation-triangle me-2" />
          {errors._global}
        </div>
      )}

      <div style={{ background:"white", padding:"35px", borderRadius:20, maxWidth:860,
                    margin:"0 auto", boxShadow:"0 4px 25px rgba(0,0,0,0.06)" }}>
        <form onSubmit={handleSubmit} noValidate>

          {/* ── 1. Identidad ── */}
          <section style={{ marginBottom:25, borderBottom:"1px solid #f0f0f0", paddingBottom:20 }}>
            <p style={{ fontWeight:700, color:"#ff6b00", fontSize:"0.9rem", marginBottom:15 }}>
              1. IDENTIDAD DEL RESTAURANTE
            </p>
            <div className="row g-3">
              <div className="col-md-7">
                <label style={lbl}>Nombre Comercial *</label>
                <input name="nombre" value={form.nombre} onChange={handle}
                  style={inp("nombre")} placeholder="Nombre del restaurante" />
                {errors.nombre && <small style={{ color:"#ef4444" }}>{errors.nombre}</small>}
              </div>
              <div className="col-md-5">
                <label style={lbl}>Tipo de Cocina *</label>
                <select name="tipo" value={form.tipo} onChange={handle} style={inp("tipo")}>
                  <option value="">Seleccionar tipo...</option>
                  {tiposComida.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.tipo && <small style={{ color:"#ef4444" }}>{errors.tipo}</small>}
              </div>
              <div className="col-12">
                <label style={lbl}>Eslogan o mensaje de bienvenida</label>
                <input name="mensajePersonalizado" value={form.mensajePersonalizado}
                  onChange={handle} style={inp("mensajePersonalizado")}
                  placeholder="Ej: El mejor sabor norteño en el corazón de la ciudad" />
              </div>
            </div>
          </section>

          {/* ── 2. Ubicación ── */}
          <section style={{ marginBottom:25, borderBottom:"1px solid #f0f0f0", paddingBottom:20 }}>
            <p style={{ fontWeight:700, color:"#ff6b00", fontSize:"0.9rem", marginBottom:15 }}>
              2. UBICACIÓN
            </p>
            <div className="row g-3">
              <div className="col-md-5">
                <label style={lbl}>Distrito o Zona *</label>
                <input name="distrito" list="lista-distritos-v4" value={form.distrito}
                  onChange={handle} style={inp("distrito")} placeholder="Escribe o selecciona..." />
                <datalist id="lista-distritos-v4">
                  {sugerenciasDistritos.map(d => <option key={d} value={d} />)}
                </datalist>
                {errors.distrito && <small style={{ color:"#ef4444" }}>{errors.distrito}</small>}
              </div>
              <div className="col-md-7">
                <label style={lbl}>Dirección Exacta *</label>
                <input name="direccion" value={form.direccion} onChange={handle}
                  style={inp("direccion")} placeholder="Av. / Jr. / Calle y número" />
                {errors.direccion && <small style={{ color:"#ef4444" }}>{errors.direccion}</small>}
              </div>
            </div>
          </section>

          {/* ── 3. Horarios y Mesas ── */}
          <section style={{ marginBottom:25, borderBottom:"1px solid #f0f0f0", paddingBottom:20 }}>
            <p style={{ fontWeight:700, color:"#ff6b00", fontSize:"0.9rem", marginBottom:15 }}>
              3. HORARIOS Y CAPACIDAD
            </p>
            <div className="row g-3">
              <div className="col-12">
                <HorarioSemanalInput
                  value={horarios}
                  onChange={setHorarios}
                  inputStyle={inp}
                />
              </div>
              <div className="col-md-4">
                <label style={lbl}>N° de Mesas</label>
                <input type="number" name="mesas" value={form.mesas} onChange={handle}
                  min="0" style={inp("mesas")} placeholder="Ej: 20" />
              </div>
            </div>
          </section>

          {/* ── 4. Multimedia y contacto ── */}
          <section style={{ marginBottom:25 }}>
            <p style={{ fontWeight:700, color:"#ff6b00", fontSize:"0.9rem", marginBottom:15 }}>
              4. IMAGEN Y CONTACTO
            </p>
            <div className="row g-3">

              {/* Uploader de imagen */}
              <div className="col-md-6">
                <label style={lbl}>Imagen de Fachada</label>

                {/* Zona de drop */}
                {!preview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    style={{
                      border: `2px dashed ${dragOver ? "#ff6b00" : errors.imagen ? "#ef4444" : "#d1c4b8"}`,
                      borderRadius: 12,
                      padding: "28px 20px",
                      textAlign: "center",
                      cursor: "pointer",
                      background: dragOver ? "#fff7f0" : "#fafafa",
                      transition: "all .2s",
                    }}
                  >
                    <div style={{ fontSize:"2rem", marginBottom:8, color:"#ccc" }}>🖼️</div>
                    <p style={{ margin:0, fontSize:"0.82rem", color:"#888", lineHeight:1.5 }}>
                      <strong style={{ color:"#ff6b00" }}>Haz clic</strong> para subir o arrastra aquí<br />
                      <span style={{ fontSize:"0.75rem" }}>JPG, PNG, WEBP — máx. 5 MB</span>
                    </p>
                  </div>
                ) : (
                  /* Preview */
                  <div style={{ position:"relative", borderRadius:12, overflow:"hidden",
                                boxShadow:"0 2px 12px rgba(0,0,0,0.1)" }}>
                    <img src={preview} alt="Preview"
                      style={{ width:"100%", height:160, objectFit:"cover", display:"block" }} />
                    <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:6 }}>
                      <button type="button"
                        onClick={() => fileInputRef.current?.click()}
                        title="Cambiar imagen"
                        style={{ background:"rgba(0,0,0,0.55)", color:"white", border:"none",
                                 borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:"0.75rem" }}>
                        ✏️ Cambiar
                      </button>
                      <button type="button" onClick={removeImage} title="Quitar imagen"
                        style={{ background:"rgba(220,38,38,0.85)", color:"white", border:"none",
                                 borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:"0.75rem" }}>
                        ✕
                      </button>
                    </div>
                    {imgFile && (
                      <div style={{ background:"rgba(0,0,0,0.45)", color:"white",
                                    fontSize:"0.7rem", padding:"4px 10px", textAlign:"center" }}>
                        {imgFile.name} · {(imgFile.size / 1024).toFixed(0)} KB
                      </div>
                    )}
                  </div>
                )}

                {/* Input oculto */}
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange} style={{ display:"none" }} />

                {errors.imagen && (
                  <small style={{ color:"#ef4444", display:"block", marginTop:5 }}>
                    <i className="bi bi-exclamation-circle me-1" />{errors.imagen}
                  </small>
                )}
              </div>

              {/* Teléfono + Email */}
              <div className="col-md-6">
                <div style={{ marginBottom:15 }}>
                  <label style={lbl}>Teléfono de Reservas *</label>
                  <input type="text" inputMode="numeric" placeholder="999 123 456"
                    value={form.telefono} onChange={handleTelefono} maxLength={9}
                    style={inp("telefono")} />
                  {errors.telefono ? (
                    <small style={{ color:"#ef4444", display:"block", marginTop:4 }}>
                      <i className="bi bi-exclamation-circle me-1" />{errors.telefono}
                    </small>
                  ) : form.telefono.length === 9 ? (
                    <small style={{ color:"#16a34a", display:"block", marginTop:4 }}>
                      <i className="bi bi-check-circle me-1" />Teléfono válido
                    </small>
                  ) : null}
                </div>
                <div>
                  <label style={lbl}>Email de Gestión *</label>
                  <input type="email" name="email" value={form.email} onChange={handle}
                    style={inp("email")} placeholder="gerencia@restaurante.com" />
                  {errors.email && (
                    <small style={{ color:"#ef4444", display:"block", marginTop:4 }}>
                      {errors.email}
                    </small>
                  )}
                </div>
              </div>

            </div>
          </section>

          {/* ── Acciones ── */}
          <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:10,
                        borderTop:"1px solid #f0f0f0", paddingTop:20 }}>
            <button type="button" onClick={resetAll} disabled={loading}
              style={{ padding:"12px 25px", borderRadius:10, border:"1px solid #e8e0d8",
                       background:"white", color:"#999", fontWeight:600, cursor:"pointer" }}>
              Limpiar
            </button>
            <button type="submit" disabled={loading}
              style={{ padding:"12px 35px", borderRadius:10, border:"none",
                       background: loading ? "#ffb380" : "#ff6b00",
                       color:"white", fontWeight:700, cursor: loading ? "not-allowed" : "pointer",
                       boxShadow:"0 4px 12px rgba(255,107,0,0.2)",
                       display:"flex", alignItems:"center", gap:8 }}>
              {loading ? (
                <>
                  <span style={{ width:16, height:16, border:"2px solid white",
                                 borderTopColor:"transparent", borderRadius:"50%",
                                 animation:"spin .7s linear infinite", display:"inline-block" }} />
                  Guardando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg" /> Finalizar Registro
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: #ff6b00 !important; }
      `}</style>
    </div>
  );
}

export default NewRestaurant;