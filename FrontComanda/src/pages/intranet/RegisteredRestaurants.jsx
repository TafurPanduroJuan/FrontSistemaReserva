import React, { useState } from "react";
import HorarioSemanalInput, { payloadToHorario, horarioToPayload } from "../../components/HorarioSemanalInput";
import { useRestaurants } from "../../context/RestaurantsContext";

const tiposComida = ["Criolla","Italiana","Japonesa","Mariscos","Vegana","Parrilla","Mexicana","Peruana","Francesa","Fusión","Moderna","Asiática","Postres"];
const sugerenciasDistritos = ["Miraflores","San Isidro","Barranco","Surco","La Molina","Chorrillos","Lince","Jesús María","Pueblo Libre","Magdalena"];

function RegisteredRestaurants() {
  const { restaurantes, editarRestaurante, eliminarRestaurante, toggleCierre } = useRestaurants();
  const [busqueda, setBusqueda] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [preview, setPreview] = useState(null);

  const [modalCierre, setModalCierre] = useState(null); // null | restaurantObj
  const [motivoCierre, setMotivoCierre] = useState("");

  const handleEliminar = (id) => {
    if (window.confirm("¿Eliminar este restaurante permanentemente?")) {
      eliminarRestaurante(id);
    }
  };

  const handleToggleCierre = async () => {
    if (!modalCierre) return;
    try {
      await toggleCierre(modalCierre.id, true, motivoCierre);
      setModalCierre(null);
      setMotivoCierre("");
    } catch (err) {
      alert("Error al cerrar el restaurante: " + err.message);
    }
  };

  const handleReabrir = async (restaurant) => {
    try {
      await toggleCierre(restaurant.id, false, null);
    } catch (err) {
      alert("Error al reabrir el restaurante: " + err.message);
    }
  };

  const abrirEditar = (res) => {
    setEditData({
      ...res,
      // Bug 1: normalizar campo eslogan (backend puede devolver camelCase o snake_case)
      mensaje_personalizado: res.mensaje_personalizado || res.mensajePersonalizado || "",
      // Bug 2: convertir teléfono a string para que .length funcione correctamente
      telefono: res.telefono != null ? String(res.telefono) : "",
      horarios: payloadToHorario(res),
    });
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

  const handleTelefonoEdit = (e) => {
    const valor = e.target.value.replace(/\D/g, "").slice(0, 9);
    setEditData({ ...editData, telefono: valor });
  };

  const telefonoValido = editData?.telefono?.length === 9;

  const guardarCambios = (e) => {
    e.preventDefault();
    if (editData.telefono && editData.telefono.length !== 9) {
      alert("Por favor, ingresa un número de teléfono válido (9 dígitos).");
      return;
    }
    const { horarios, ...restEditData } = editData;
    editarRestaurante({
      ...restEditData,
      ...horarioToPayload(horarios || {}),
      imagen: preview || editData.imagen,
    });
    setShowModal(false);
  };

  const filtrados = restaurantes.filter(
    (r) =>
      r.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (r.distrito || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      <style>{`
        /* ── Restaurantes Registrados — estilos scoped ── */
        .rr-page { padding: 24px; }

        .rr-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .rr-title { font-weight: 800; color: #1a1a2e; font-size: 1.5rem; margin: 0; }
        .rr-title span { color: #F4956A; }
        .rr-count { font-size: 0.85rem; color: #aaa; font-weight: 400; margin-left: 8px; }

        .rr-search {
          padding: 10px 16px;
          border-radius: 12px;
          border: 1.5px solid #e8e0d8;
          font-size: 0.9rem;
          outline: none;
          width: 280px;
          max-width: 100%;
          transition: border-color 0.2s;
        }
        .rr-search:focus { border-color: #F4956A; }

        .rr-empty {
          text-align: center;
          padding: 60px 20px;
          color: #aaa;
          background: white;
          border-radius: 16px;
        }
        .rr-empty i { font-size: 3rem; display: block; margin-bottom: 12px; }

        /* Cards */
        .rr-card {
          background: white;
          border-radius: 18px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid #f0ebe4;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .rr-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .rr-card-img { width: 100%; height: 170px; object-fit: cover; }
        .rr-card-img-placeholder {
          width: 100%; height: 170px;
          background: #f5f0ea;
          display: flex; align-items: center; justify-content: center;
          color: #ccc; font-size: 2.5rem;
        }
        .rr-card-body { padding: 18px; flex: 1; display: flex; flex-direction: column; }
        .rr-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
        .rr-tipo { color: #F4956A; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .rr-badge-solicitud { font-size: 0.62rem; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 10px; font-weight: 700; }
        .rr-badge-catalogo { font-size: 0.62rem; background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 10px; font-weight: 700; }
        .rr-nombre { font-weight: 700; margin: 4px 0; color: #1a1a2e; font-size: 1rem; }
        .rr-distrito { font-size: 0.83rem; color: #777; margin-bottom: 8px; }
        .rr-slogan {
          border-left: 3px solid #F4956A;
          padding-left: 10px;
          font-style: italic;
          font-size: 0.82rem;
          color: #666;
          margin: 10px 0;
          line-height: 1.4;
        }
        .rr-card-footer {
          display: flex; justify-content: space-between;
          margin-top: auto; padding-top: 14px;
          border-top: 1px solid #f0ebe4;
        }
        .rr-btn-editar {
          background: #eff6ff; color: #2563eb;
          border: none; padding: 8px 14px;
          border-radius: 9px; cursor: pointer;
          font-size: 0.82rem; font-weight: 600;
          display: flex; align-items: center; gap: 5px;
          transition: background 0.2s;
        }
        .rr-btn-editar:hover { background: #dbeafe; }
        .rr-btn-eliminar {
          background: #fff5f5; color: #dc3545;
          border: none; padding: 8px 12px;
          border-radius: 9px; cursor: pointer;
          transition: background 0.2s;
        }
        .rr-btn-eliminar:hover { background: #fee2e2; }

        .rr-btn-cerrar {
          background: #fff7ed; color: #c2410c;
          border: none; padding: 8px 14px;
          border-radius: 9px; cursor: pointer;
          font-size: 0.82rem; font-weight: 600;
          display: flex; align-items: center; gap: 5px;
          transition: background 0.2s;
        }
        .rr-btn-cerrar:hover { background: #ffedd5; }

        .rr-btn-reabrir {
          background: #f0fdf4; color: #15803d;
          border: none; padding: 8px 14px;
          border-radius: 9px; cursor: pointer;
          font-size: 0.82rem; font-weight: 600;
          display: flex; align-items: center; gap: 5px;
          transition: background 0.2s;
        }
        .rr-btn-reabrir:hover { background: #dcfce7; }

        .rr-badge-cerrado {
          background: #fff7ed; color: #c2410c;
          border: 1px solid #fed7aa;
          padding: 6px 10px; border-radius: 8px;
          font-size: 0.78rem; font-weight: 600;
          margin-bottom: 8px;
          display: flex; align-items: center;
        }

        /* Modal */
        .rr-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 10000; padding: 16px;
        }
        .rr-modal {
          background: white; width: 100%; max-width: 780px;
          border-radius: 22px; overflow-y: auto; max-height: 92vh;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .rr-modal-header {
          padding: 18px 28px; border-bottom: 1px solid #f0ebe4;
          display: flex; justify-content: space-between; align-items: center;
          background: #fafaf8; border-radius: 22px 22px 0 0;
          position: sticky; top: 0; z-index: 1;
        }
        .rr-modal-title { margin: 0; font-weight: 800; color: #1a1a2e; font-size: 1.05rem; }
        .rr-modal-close { border: none; background: none; font-size: 1.8rem; cursor: pointer; color: #888; line-height: 1; }
        .rr-modal-body { padding: 28px; }
        .rr-section-label { font-weight: 700; color: #F4956A; font-size: 0.82rem; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 2px solid #fff3e0; }
        .rr-label { font-size: 0.73rem; font-weight: 700; color: #666; margin-bottom: 5px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
        .rr-input {
          width: 100%; padding: 10px 14px; border-radius: 10px;
          border: 1.5px solid #e8e0d8; font-size: 0.9rem; outline: none;
          transition: border-color 0.2s; font-family: inherit;
        }
        .rr-input:focus { border-color: #F4956A; }
        .rr-input-error { border-color: #dc3545 !important; }
        .rr-input-success { border-color: #28a745 !important; }
        .rr-feedback-error { font-size: 0.73rem; color: #dc3545; margin-top: 4px; }
        .rr-feedback-ok { font-size: 0.73rem; color: #28a745; margin-top: 4px; }
        .rr-img-drop {
          border: 2px dashed #ddd; border-radius: 14px;
          height: 150px; position: relative; overflow: hidden; background: #f9f9f9;
        }
        .rr-img-drop img { width: 100%; height: 100%; object-fit: cover; }
        .rr-img-drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .rr-img-hint { position: absolute; bottom: 0; background: rgba(0,0,0,0.45); color: white; width: 100%; font-size: 0.62rem; text-align: center; padding: 4px; }
        .rr-modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 8px; flex-wrap: wrap; }
        .rr-btn-cancelar {
          padding: 11px 22px; border-radius: 11px; border: 1.5px solid #e8e0d8;
          background: white; font-weight: 600; cursor: pointer; font-size: 0.88rem; color: #555;
        }
        .rr-btn-guardar {
          padding: 11px 32px; border-radius: 11px; border: none;
          background: #F4956A; color: white; font-weight: 700; cursor: pointer;
          font-size: 0.88rem; box-shadow: 0 4px 12px rgba(244,149,106,0.35);
          transition: background 0.2s, transform 0.2s;
        }
        .rr-btn-guardar:hover { background: #e0784d; transform: translateY(-1px); }

        @media (max-width: 576px) {
          .rr-page { padding: 12px; }
          .rr-header { flex-direction: column; align-items: flex-start; }
          .rr-search { width: 100%; }
          .rr-modal-body { padding: 16px; }
          .rr-modal-actions { flex-direction: column-reverse; }
          .rr-btn-cancelar, .rr-btn-guardar { width: 100%; text-align: center; justify-content: center; }
        }
      `}</style>

      <div className="rr-page">
        {/* Encabezado */}
        <div className="rr-header">
          <h2 className="rr-title">
            Restaurantes <span>Activos</span>
            <span className="rr-count">({filtrados.length})</span>
          </h2>
          <input
            type="text"
            className="rr-search"
            placeholder="🔍  Buscar por nombre o distrito..."
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* Estado vacío */}
        {filtrados.length === 0 && (
          <div className="rr-empty">
            <i className="bi bi-shop"></i>
            <p>No hay restaurantes registrados aún.</p>
            <p style={{ fontSize: "0.85rem" }}>Acepta solicitudes o registra un restaurante nuevo.</p>
          </div>
        )}

        {/* Grid de tarjetas */}
        <div className="row g-4">
          {filtrados.map((res) => (
            <div className="col-12 col-sm-6 col-xl-4" key={res.id}>
              <div className="rr-card">
                {res.imagen ? (
                  <img src={res.imagen} alt={res.nombre} className="rr-card-img"
                    onError={(e) => { e.target.style.display = "none"; }} />
                ) : (
                  <div className="rr-card-img-placeholder">
                    <i className="bi bi-shop"></i>
                  </div>
                )}
                <div className="rr-card-body">
                  <div className="rr-card-top">
                    <span className="rr-tipo">{(res.tipo || "").toUpperCase()}</span>
                    {res.origen === "solicitud" && <span className="rr-badge-solicitud">Vía Solicitud</span>}
                    {res.origen === "catalogo"  && <span className="rr-badge-catalogo">🌐 Catálogo</span>}
                  </div>
                  <h4 className="rr-nombre">{res.nombre}</h4>
                  <p className="rr-distrito">
                    <i className="bi bi-geo-alt me-1"></i>{res.distrito}
                  </p>
                  
                  {res.cerradoHoy && (
                    <div className="rr-badge-cerrado">
                      <i className="bi bi-door-closed-fill me-1"></i>
                      Cerrado hoy — {res.motivoCierre || "Sin motivo especificado"}
                    </div>
                  )}

                  {res.mensaje_personalizado && (
                    <div className="rr-slogan">"{res.mensaje_personalizado}"</div>
                  )}
                  <div className="rr-card-footer">
                    <button className="rr-btn-editar" onClick={() => abrirEditar(res)}>
                      <i className="bi bi-pencil-square"></i> Editar
                    </button>

                    {res.cerradoHoy ? (
                      <button className="rr-btn-reabrir" onClick={() => handleReabrir(res)}>
                        <i className="bi bi-door-open"></i> Reabrir
                      </button>
                    ) : (
                      <button className="rr-btn-cerrar" onClick={() => { setModalCierre(res); setMotivoCierre(""); }}>
                        <i className="bi bi-door-closed"></i> Cerrar
                      </button>
                    )}

                    <button className="rr-btn-eliminar" onClick={() => handleEliminar(res.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de edición */}
      {showModal && editData && (
        <div className="rr-modal-overlay" onClick={(e) => { if (e.target.classList.contains("rr-modal-overlay")) setShowModal(false); }}>
          <div className="rr-modal">
            <div className="rr-modal-header">
              <h5 className="rr-modal-title">Editar: {editData.nombre}</h5>
              <button className="rr-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="rr-modal-body">
              <form onSubmit={guardarCambios}>

                {/* Sección 1 */}
                <div style={{ marginBottom: "22px" }}>
                  <p className="rr-section-label">1. INFORMACIÓN GENERAL</p>
                  <div className="row g-3">
                    <div className="col-12 col-md-7">
                      <label className="rr-label">Nombre del establecimiento</label>
                      <input className="rr-input" value={editData.nombre}
                        onChange={e => setEditData({ ...editData, nombre: e.target.value })} required />
                    </div>
                    <div className="col-12 col-md-5">
                      <label className="rr-label">Categoría de comida</label>
                      <select className="rr-input" value={editData.tipo}
                        onChange={e => setEditData({ ...editData, tipo: e.target.value })}>
                        {tiposComida.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="rr-label">Eslogan / Mensaje del restaurante</label>
                      <input className="rr-input" value={editData.mensaje_personalizado || ""}
                        onChange={e => setEditData({ ...editData, mensaje_personalizado: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Sección 2 */}
                <div style={{ marginBottom: "22px" }}>
                  <p className="rr-section-label">2. UBICACIÓN</p>
                  <div className="row g-3">
                    <div className="col-12 col-md-5">
                      <label className="rr-label">Distrito</label>
                      <input list="distritos-edit" className="rr-input" value={editData.distrito || ""}
                        onChange={e => setEditData({ ...editData, distrito: e.target.value })} />
                      <datalist id="distritos-edit">
                        {sugerenciasDistritos.map(d => <option key={d} value={d} />)}
                      </datalist>
                    </div>
                    <div className="col-12 col-md-7">
                      <label className="rr-label">Dirección exacta</label>
                      <input className="rr-input" value={editData.direccion || ""}
                        onChange={e => setEditData({ ...editData, direccion: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* Sección 3 */}
                <div style={{ marginBottom: "22px" }}>
                  <p className="rr-section-label">3. MULTIMEDIA Y CONTACTO</p>
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="rr-label">Imagen de fachada</label>
                      <div className="rr-img-drop">
                        {preview && <img src={preview} alt="Fachada" />}
                        <input type="file" accept="image/*" onChange={handleImagenEdit} />
                        <div className="rr-img-hint">Clic para cambiar imagen</div>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="mb-3">
                        <label className="rr-label">Teléfono</label>
                        <input
                          className={`rr-input ${editData.telefono && !telefonoValido ? "rr-input-error" : editData.telefono && telefonoValido ? "rr-input-success" : ""}`}
                          type="text" inputMode="numeric" placeholder="999123456"
                          value={editData.telefono || ""} onChange={handleTelefonoEdit}
                        />
                        {editData.telefono && editData.telefono.length > 0 && (
                          <div className={telefonoValido ? "rr-feedback-ok" : "rr-feedback-error"}>
                            <i className={`bi ${telefonoValido ? "bi-check-circle" : "bi-exclamation-circle"} me-1`}></i>
                            {telefonoValido ? "Teléfono válido" : `Debe tener 9 dígitos (${editData.telefono.length}/9)`}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="rr-label">Email</label>
                        <input type="email" className="rr-input" value={editData.email || ""}
                          onChange={e => setEditData({ ...editData, email: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección 4 */}
                <div style={{ marginBottom: "22px" }}>
                  <p className="rr-section-label">4. HORARIO DE ATENCIÓN</p>
                  <HorarioSemanalInput
                    value={editData.horarios || {}}
                    onChange={(h) => setEditData({ ...editData, horarios: h })}
                    inputClassName="rr-input"
                  />
                </div>

                <div className="rr-modal-actions">
                  <button type="button" className="rr-btn-cancelar" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="rr-btn-guardar">Guardar Cambios</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Modal de motivo de cierre */}
      {modalCierre && (
        <div className="rr-modal-overlay" onClick={(e) => { if (e.target.classList.contains("rr-modal-overlay")) setModalCierre(null); }}>
          <div className="rr-modal" style={{ maxWidth: "420px" }}>
            <div className="rr-modal-header">
              <h5 className="rr-modal-title">Cerrar: {modalCierre.nombre}</h5>
              <button className="rr-modal-close" onClick={() => setModalCierre(null)}>&times;</button>
            </div>
            <div className="rr-modal-body">
              <label className="rr-label">Motivo del cierre</label>
              <textarea
                className="rr-input"
                rows={3}
                placeholder="Ej: Mantenimiento de cocina, falta de personal, etc."
                value={motivoCierre}
                onChange={(e) => setMotivoCierre(e.target.value)}
              />
              <div className="rr-modal-actions">
                <button type="button" className="rr-btn-cancelar" onClick={() => setModalCierre(null)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="rr-btn-guardar"
                  disabled={!motivoCierre.trim()}
                  onClick={handleToggleCierre}
                >
                  Confirmar cierre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RegisteredRestaurants;
