import React, { useState } from "react";
import { useRestaurantes } from "../../context/RestaurantesContext";

const tiposComida = ["Criolla","Italiana","Japonesa","Mariscos","Vegana","Parrilla","Mexicana","Peruana","Francesa","Fusión","Moderna","Asiática","Postres"];
const sugerenciasDistritos = ["Miraflores","San Isidro","Barranco","Surco","La Molina","Chorrillos","Lince","Jesús María","Pueblo Libre","Magdalena"];

const initialForm = {
  nombre:"", tipo:"", distrito:"", direccion:"",
  horario_apertura:"", horario_cierre:"", precio:"",
  mesas:"", descripcion:"", telefono:"", email:"",
  etiqueta:"", mensaje_personalizado:""
};

function NuevoRestaurante() {
  const { agregarRestaurante } = useRestaurantes();
  const [form, setForm] = useState(initialForm);
  const [imagen, setImagen] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleImagen = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagen(file);
      setPreview(reader.result); 
    };
    reader.readAsDataURL(file);
  }
};

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es requerido";
    if (!form.tipo) e.tipo = "Selecciona un tipo";
    if (!form.distrito.trim()) e.distrito = "Ingresa un distrito o lugar";
    if (!form.direccion.trim()) e.direccion = "La dirección es requerida";
    if (!form.telefono.trim()) e.telefono = "El teléfono es requerido";
    if (!form.email.trim()) e.email = "El email es requerido";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Agregar al contexto global -> aparece en RestaurantesRegistrados
    agregarRestaurante({
      ...form,
      mesas: parseInt(form.mesas) || 0,
      imagen: preview || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400",
    });
    setSubmitted(true);
  };

  const inputStyle = (field) => ({
    width:"100%", padding:"10px 14px", borderRadius:10, fontSize:"0.875rem",
    border:`1.5px solid ${errors[field] ? "#ef4444" : "#e8e0d8"}`,
    outline:"none", background:"white", boxSizing:"border-box"
  });

  const labelStyle = { fontSize:"0.8rem", fontWeight:600, color:"#555", marginBottom:"5px", display:"block" };

  if (submitted) {
    return (
      <div id="final-success-wrapper">
        <div style={{ background:"white", padding:"50px", borderRadius:"15px", textAlign:"center", maxWidth:520, margin:"60px auto", boxShadow:"0 4px 20px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize:"4rem", marginBottom:16 }}>✅</div>
          <h4 style={{ color:"#1a1a2e", fontWeight:700 }}>¡Registro Completado!</h4>
          <p style={{ color:"#666" }}>
            El restaurante <strong>{form.nombre}</strong> ha sido dado de alta y ya aparece en{" "}
            <strong>Restaurantes Registrados</strong>.
          </p>
          <button
            style={{ background:"#ff6b00", color:"white", border:"none", padding:"12px 24px", borderRadius:"10px", fontWeight:"600", cursor:"pointer", marginTop:"20px" }}
            onClick={() => { setForm(initialForm); setPreview(null); setImagen(null); setSubmitted(false); }}
          >
            Registrar otro restaurante
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="comanda-form-container-v4">
      <div style={{ marginBottom:"25px" }}>
        <div style={{ fontSize:"1.5rem", fontWeight:"700", color:"#1a1a2e" }}>
          <i className="bi bi-shop" style={{ marginRight:"10px", color:"#ff6b00" }}></i> Registrar Restaurante
        </div>
      </div>

      <div id="restaurante-form-card-unique" style={{ background:"white", padding:"35px", borderRadius:"20px", maxWidth:860, margin:"0 auto", boxShadow:"0 4px 25px rgba(0,0,0,0.06)" }}>
        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom:"25px", borderBottom:"1px solid #f0f0f0", paddingBottom:"20px" }}>
            <p style={{ fontWeight:"700", color:"#ff6b00", fontSize:"0.9rem", marginBottom:"15px" }}>1. IDENTIDAD DEL RESTAURANTE</p>
            <div className="row g-3">
              <div className="col-md-7">
                <label style={labelStyle}>Nombre Comercial *</label>
                <input name="nombre" value={form.nombre} onChange={handle} style={inputStyle("nombre")} placeholder="Nombre del restaurante" />
                {errors.nombre && <small style={{color:"#ef4444"}}>{errors.nombre}</small>}
              </div>
              <div className="col-md-5">
                <label style={labelStyle}>Tipo de Cocina *</label>
                <select name="tipo" value={form.tipo} onChange={handle} style={inputStyle("tipo")}>
                  <option value="">Seleccionar tipo...</option>
                  {tiposComida.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.tipo && <small style={{color:"#ef4444"}}>{errors.tipo}</small>}
              </div>
              <div className="col-12">
                <label style={labelStyle}>Mensaje del Restaurante (Eslogan o bienvenida)</label>
                <input name="mensaje_personalizado" value={form.mensaje_personalizado} onChange={handle} style={inputStyle("mensaje_personalizado")} placeholder="Ej: El mejor sabor norteño en el corazón de la ciudad" />
              </div>
            </div>
          </div>

          <div style={{ marginBottom:"25px", borderBottom:"1px solid #f0f0f0", paddingBottom:"20px" }}>
            <p style={{ fontWeight:"700", color:"#ff6b00", fontSize:"0.9rem", marginBottom:"15px" }}>2. UBICACIÓN</p>
            <div className="row g-3">
              <div className="col-md-5">
                <label style={labelStyle}>Distrito o Zona *</label>
                <input name="distrito" list="lista-distritos-v4" value={form.distrito} onChange={handle} style={inputStyle("distrito")} placeholder="Escribe o selecciona lugar..." />
                <datalist id="lista-distritos-v4">
                  {sugerenciasDistritos.map(d => <option key={d} value={d} />)}
                </datalist>
                {errors.distrito && <small style={{color:"#ef4444"}}>{errors.distrito}</small>}
              </div>
              <div className="col-md-7">
                <label style={labelStyle}>Dirección Exacta *</label>
                <input name="direccion" value={form.direccion} onChange={handle} style={inputStyle("direccion")} placeholder="Av. / Jr. / Calle y número" />
                {errors.direccion && <small style={{color:"#ef4444"}}>{errors.direccion}</small>}
              </div>
            </div>
          </div>

          <div style={{ marginBottom:"25px" }}>
            <p style={{ fontWeight:"700", color:"#ff6b00", fontSize:"0.9rem", marginBottom:"15px" }}>3. MULTIMEDIA Y CONTACTO</p>
            <div className="row g-3">
              <div className="col-md-6">
                <label style={labelStyle}>Foto de la Fachada</label>
                <div style={{ border:"2px dashed #e8e0d8", borderRadius:"12px", height:"160px", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", position:"relative", background:"#fcfcfc" }}>
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      <button type="button" onClick={() => { setPreview(null); setImagen(null); }} style={{ position:"absolute", top:"8px", right:"8px", background:"#ef4444", color:"white", border:"none", borderRadius:"50%", width:"25px", height:"25px", cursor:"pointer" }}>&times;</button>
                    </>
                  ) : (
                    <div style={{ textAlign:"center", color:"#aaa" }}>
                      <i className="bi bi-camera" style={{ fontSize:"1.8rem" }}></i>
                      <p style={{ fontSize:"0.7rem", marginTop:"5px" }}>Subir imagen de fachada</p>
                      <input type="file" accept="image/*" onChange={handleImagen} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", opacity:0, cursor:"pointer" }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div style={{ marginBottom:"15px" }}>
                  <label style={labelStyle}>Teléfono de Reservas *</label>
                  <input name="telefono" value={form.telefono} onChange={handle} style={inputStyle("telefono")} placeholder="900 000 000" />
                  {errors.telefono && <small style={{color:"#ef4444"}}>{errors.telefono}</small>}
                </div>
                <div>
                  <label style={labelStyle}>Email de Gestión *</label>
                  <input type="email" name="email" value={form.email} onChange={handle} style={inputStyle("email")} placeholder="gerencia@restaurante.com" />
                  {errors.email && <small style={{color:"#ef4444"}}>{errors.email}</small>}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:"12px", justifyContent:"flex-end", marginTop:"10px" }}>
            <button type="button" onClick={() => { setForm(initialForm); setPreview(null); setImagen(null); }} style={{ padding:"12px 25px", borderRadius:"10px", border:"1px solid #e8e0d8", background:"white", color:"#999", fontWeight:"600", cursor:"pointer" }}>
              Limpiar
            </button>
            <button type="submit" style={{ padding:"12px 35px", borderRadius:"10px", border:"none", background:"#ff6b00", color:"white", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 12px rgba(255,107,0,0.2)" }}>
              Finalizar Registro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NuevoRestaurante;
