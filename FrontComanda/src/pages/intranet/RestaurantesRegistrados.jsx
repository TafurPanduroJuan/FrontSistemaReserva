import React, { useState } from "react";
import { useRestaurantes } from "../../context/RestaurantesContext";

const tiposComida = ["Criolla","Italiana","Japonesa","Mariscos","Vegana","Parrilla","Mexicana","Peruana","Francesa","Fusión","Moderna","Asiática","Postres"];
const sugerenciasDistritos = ["Miraflores","San Isidro","Barranco","Surco","La Molina","Chorrillos","Lince","Jesús María","Pueblo Libre","Magdalena"];

function RestaurantesRegistrados() {
  const { restaurantes, editarRestaurante, eliminarRestaurante } = useRestaurantes();
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleEliminar = (id) => {
    if (window.confirm("¿Eliminar este restaurante permanentemente?")) {
      eliminarRestaurante(id);
    }
  };

  const abrirEditar = (res) => {
    setEditData({ ...res });
    setPreview(res.imagen);
    setShowModal(true);
  };

  const handleImagenEdit = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setEditData({ ...editData, imagen: reader.result });
    };
    reader.readAsDataURL(file);
  }
};

  const guardarCambios = (e) => {
    e.preventDefault();
    editarRestaurante({ ...editData, imagen: preview || editData.imagen });
    setShowModal(false);
  };

  const filtrados = restaurantes.filter(
    (r) =>
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (r.distrito || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const labelStyle = { fontSize:"0.75rem", fontWeight:"700", color:"#555", marginBottom:"5px", display:"block", textTransform:"uppercase" };
  const inputStyle = { width:"100%", padding:"10px", borderRadius:"10px", border:"1px solid #ddd", fontSize:"0.9rem", outline:"none" };

  return (
    <div id="restaurantes-listado-unique" style={{ padding:"30px", background:"#fdfdfd", minHeight:"100vh" }}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"30px" }}>
        <h2 style={{ fontWeight:800, color:"#1a1a2e" }}>
          Restaurantes <span style={{ color:"#ff6b00" }}>Activos</span>
          <span style={{ fontSize:"0.9rem", color:"#aaa", fontWeight:400, marginLeft:12 }}>({filtrados.length})</span>
        </h2>
        <input
          type="text"
          placeholder="Buscar restaurante o distrito..."
          style={{ ...inputStyle, width:"300px" }}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {filtrados.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 20px", color:"#aaa" }}>
          <i className="bi bi-shop" style={{ fontSize:"3rem" }}></i>
          <p style={{ marginTop:10 }}>No hay restaurantes registrados aún.</p>
          <p style={{ fontSize:"0.85rem" }}>Acepta solicitudes o registra un restaurante nuevo.</p>
        </div>
      )}

      <div className="row g-4">
        {filtrados.map((res) => (
          <div className="col-12 col-md-6 col-lg-4" key={res.id}>
            <div style={{ background:"white", borderRadius:"20px", boxShadow:"0 8px 20px rgba(0,0,0,0.05)", overflow:"hidden", height:"100%", display:"flex", flexDirection:"column" }}>
              {res.imagen ? (
                <img
                  src={res.imagen}
                  alt={res.nombre}
                  style={{ width:"100%", height:"180px", objectFit:"cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div style={{ width:"100%", height:"180px", background:"#f5f5f5", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <i className="bi bi-shop" style={{ fontSize:"2.5rem", color:"#ccc" }}></i>
                </div>
              )}

              <div style={{ padding:"20px", flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <span style={{ color:"#ff6b00", fontSize:"0.7rem", fontWeight:"800" }}>
                    {(res.tipo || "").toUpperCase()}
                  </span>
                  {res.origen === "solicitud" && (
                    <span style={{ fontSize:"0.65rem", background:"#e0f2fe", color:"#0369a1", padding:"2px 8px", borderRadius:"10px", fontWeight:700 }}>
                      Via Solicitud
                    </span>
                  )}
                </div>
                <h4 style={{ fontWeight:"700", margin:"5px 0" }}>{res.nombre}</h4>
                <p style={{ fontSize:"0.85rem", color:"#777" }}>
                  <i className="bi bi-geo-alt me-1"></i>{res.distrito}
                </p>
                {res.mensaje_personalizado && (
                  <div style={{ borderLeft:"3px solid #ff6b00", paddingLeft:"10px", fontStyle:"italic", fontSize:"0.85rem", color:"#555", margin:"15px 0" }}>
                    "{res.mensaje_personalizado}"
                  </div>
                )}
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"auto", paddingTop:"15px", borderTop:"1px solid #eee" }}>
                  <button onClick={() => abrirEditar(res)} style={{ background:"#f0f7ff", color:"#007bff", border:"none", padding:"8px 15px", borderRadius:"8px", cursor:"pointer" }}>
                    <i className="bi bi-pencil-square me-1"></i> Editar
                  </button>
                  <button onClick={() => handleEliminar(res.id)} style={{ background:"#fff5f5", color:"#dc3545", border:"none", padding:"8px 15px", borderRadius:"8px", cursor:"pointer" }}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && editData && (
        <div style={{ position:"fixed", top:0, left:0, width:"100%", height:"100%", background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10000, padding:"20px" }}>
          <div style={{ background:"white", width:"100%", maxWidth:"800px", borderRadius:"25px", overflowY:"auto", maxHeight:"90vh", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ padding:"20px 30px", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#fafafa" }}>
              <h5 style={{ margin:0, fontWeight:"800" }}>Editar: {editData.nombre}</h5>
              <button onClick={() => setShowModal(false)} style={{ border:"none", background:"none", fontSize:"1.8rem", cursor:"pointer" }}>&times;</button>
            </div>

            <form onSubmit={guardarCambios} style={{ padding:"30px" }}>
              <div style={{ marginBottom:"25px" }}>
                <p style={{ fontWeight:"700", color:"#ff6b00", fontSize:"0.85rem", marginBottom:"15px", borderBottom:"2px solid #fff3e0" }}>1. INFORMACIÓN GENERAL</p>
                <div className="row g-3">
                  <div className="col-md-7">
                    <label style={labelStyle}>Nombre del establecimiento</label>
                    <input style={inputStyle} value={editData.nombre} onChange={e => setEditData({...editData, nombre:e.target.value})} required />
                  </div>
                  <div className="col-md-5">
                    <label style={labelStyle}>Categoría de comida</label>
                    <select style={inputStyle} value={editData.tipo} onChange={e => setEditData({...editData, tipo:e.target.value})}>
                      {tiposComida.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label style={labelStyle}>Mensaje del Restaurante (Eslogan)</label>
                    <input style={inputStyle} value={editData.mensaje_personalizado || ""} onChange={e => setEditData({...editData, mensaje_personalizado:e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom:"25px" }}>
                <p style={{ fontWeight:"700", color:"#ff6b00", fontSize:"0.85rem", marginBottom:"15px", borderBottom:"2px solid #fff3e0" }}>2. UBICACIÓN</p>
                <div className="row g-3">
                  <div className="col-md-5">
                    <label style={labelStyle}>Distrito o Lugar</label>
                    <input list="distritos-edit" style={inputStyle} value={editData.distrito || ""} onChange={e => setEditData({...editData, distrito:e.target.value})} />
                    <datalist id="distritos-edit">
                      {sugerenciasDistritos.map(d => <option key={d} value={d} />)}
                    </datalist>
                  </div>
                  <div className="col-md-7">
                    <label style={labelStyle}>Dirección Exacta</label>
                    <input style={inputStyle} value={editData.direccion || ""} onChange={e => setEditData({...editData, direccion:e.target.value})} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom:"25px" }}>
                <p style={{ fontWeight:"700", color:"#ff6b00", fontSize:"0.85rem", marginBottom:"15px", borderBottom:"2px solid #fff3e0" }}>3. MULTIMEDIA Y CONTACTO</p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={labelStyle}>Imagen de Fachada</label>
                    <div style={{ border:"2px dashed #ddd", borderRadius:"15px", height:"150px", position:"relative", overflow:"hidden", background:"#f9f9f9" }}>
                      {preview && <img src={preview} alt="Fachada" style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
                      <input type="file" accept="image/*" onChange={handleImagenEdit} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", opacity:0, cursor:"pointer" }} />
                      <div style={{ position:"absolute", bottom:0, background:"rgba(0,0,0,0.5)", color:"white", width:"100%", fontSize:"0.65rem", textAlign:"center", padding:"3px" }}>Click para cambiar</div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-2">
                      <label style={labelStyle}>Teléfono</label>
                      <input style={inputStyle} value={editData.telefono || ""} onChange={e => setEditData({...editData, telefono:e.target.value})} />
                    </div>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" style={inputStyle} value={editData.email || ""} onChange={e => setEditData({...editData, email:e.target.value})} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display:"flex", gap:"15px", justifyContent:"flex-end", marginTop:"10px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding:"12px 25px", borderRadius:"12px", border:"1px solid #ddd", background:"white", fontWeight:"600", cursor:"pointer" }}>Cancelar</button>
                <button type="submit" style={{ padding:"12px 35px", borderRadius:"12px", border:"none", background:"#ff6b00", color:"white", fontWeight:"700", cursor:"pointer", boxShadow:"0 4px 15px rgba(255,107,0,0.3)" }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantesRegistrados;
