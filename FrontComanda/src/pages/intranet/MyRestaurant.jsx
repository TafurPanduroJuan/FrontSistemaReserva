import React, { useState, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRestaurants } from "../../context/RestaurantsContext";
import HorarioSemanalInput, {
  payloadToHorario,
  horarioToPayload,
} from "../../components/HorarioSemanalInput";

const tiposComida = [
  "Criolla","Italiana","Japonesa","Mariscos","Vegana",
  "Parrilla","Mexicana","Peruana","Francesa","Fusión",
  "Moderna","Asiática","Postres","Comida Rápida","China",
];

/* ── estilos compartidos ──────────────────────────────────────────────────── */
const inp = (hasError) => ({
  width: "100%", padding: "10px 14px", borderRadius: 10,
  fontSize: "0.875rem",
  border: `1.5px solid ${hasError ? "#ef4444" : "#e8e0d8"}`,
  outline: "none", background: "white", boxSizing: "border-box",
  transition: "border-color .2s", fontFamily: "inherit",
});
const lbl = {
  fontSize: "0.78rem", fontWeight: 700, color: "#555",
  marginBottom: 5, display: "block", textTransform: "uppercase", letterSpacing: "0.4px",
};
const sectionTitle = {
  fontWeight: 700, color: "#ff6b00", fontSize: "0.82rem",
  marginBottom: 14, paddingBottom: 8,
  borderBottom: "2px solid #fff3e0", letterSpacing: "0.5px",
};

/* ─────────────────────────────────────────────────────────────────────────── */
function MyRestaurant() {
  const { user } = useAuth();
  const { restaurantes, editarRestaurante, toggleCierre } = useRestaurants();

  /* Restaurante que pertenece a este usuario personal */
  const restaurante = useMemo(
    () => restaurantes.find(
      (r) => r.nombre?.toLowerCase() === user?.restaurante?.toLowerCase()
    ),
    [restaurantes, user]
  );

  /* ── estados del formulario de edición ── */
  const [editData, setEditData]   = useState(null);   // null = vista modo lectura
  const [horarios, setHorarios]   = useState({});
  const [preview, setPreview]     = useState(null);
  const [saving, setSaving]       = useState(false);
  const [saveOk, setSaveOk]       = useState(false);
  const [errEdit, setErrEdit]     = useState({});

  /* ── estados del modal de cierre ── */
  const [modalCierre, setModalCierre]   = useState(false);
  const [motivoCierre, setMotivoCierre] = useState("");
  const [cerrando, setCerrando]         = useState(false);
  const [reabriendo, setReabriendo]     = useState(false);

  /* ── abrir editor ── */
  const abrirEditar = () => {
    if (!restaurante) return;
    setEditData({ ...restaurante });
    setHorarios(payloadToHorario(restaurante));
    setPreview(restaurante.imagen || null);
    setSaveOk(false);
    setErrEdit({});
  };

  /* ── imagen ── */
  const handleImagen = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setEditData((prev) => ({ ...prev, imagen: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  /* ── teléfono ── */
  const handleTelefono = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 9);
    setEditData((prev) => ({ ...prev, telefono: val }));
    if (errEdit.telefono) setErrEdit((prev) => ({ ...prev, telefono: "" }));
  };

  /* ── guardar edición ── */
  const guardar = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!editData.nombre?.trim()) errs.nombre = "El nombre es requerido";
    if (editData.telefono && String(editData.telefono).length !== 9)
      errs.telefono = "Debe tener 9 dígitos";
    if (Object.keys(errs).length) { setErrEdit(errs); return; }

    setSaving(true);
    try {
      await editarRestaurante({
        ...editData,
        ...horarioToPayload(horarios),
        imagen: preview || editData.imagen,
        telefono: editData.telefono ? parseInt(editData.telefono) : null,
      });
      setSaveOk(true);
      setEditData(null);
      setTimeout(() => setSaveOk(false), 3000);
    } catch (err) {
      setErrEdit({ _global: err.message || "Error al guardar" });
    } finally {
      setSaving(false);
    }
  };

  /* ── cierre temporal ── */
  const confirmarCierre = async () => {
    if (!motivoCierre.trim()) return;
    setCerrando(true);
    try {
      await toggleCierre(restaurante.id, true, motivoCierre.trim());
      setModalCierre(false);
      setMotivoCierre("");
    } catch (err) {
      alert("Error al cerrar: " + err.message);
    } finally {
      setCerrando(false);
    }
  };

  /* ── reabrir ── */
  const reabrir = async () => {
    setReabriendo(true);
    try {
      await toggleCierre(restaurante.id, false, null);
    } catch (err) {
      alert("Error al reabrir: " + err.message);
    } finally {
      setReabriendo(false);
    }
  };

  /* ── cargando / sin restaurante ── */
  if (!restaurante) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>
        <i className="bi bi-shop" style={{ fontSize: "3rem", display: "block", marginBottom: 12 }} />
        <p>No se encontró el restaurante asociado a tu cuenta.</p>
        <p style={{ fontSize: "0.82rem" }}>Contacta al administrador.</p>
      </div>
    );
  }

  const telefonoStr = restaurante.telefono ? String(restaurante.telefono) : "—";
  const cerrado = restaurante.cerradoHoy;

  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>

      {/* ── Encabezado ── */}
      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontWeight: 800, color: "#1a1a2e", margin: 0, fontSize: "1.5rem" }}>
            Gestión de <span style={{ color: "#ff6b00" }}>Restaurante</span>
          </h2>
          <p style={{ color: "#888", fontSize: "0.85rem", margin: "4px 0 0" }}>
            Administra los datos, horarios y estado de tu restaurante.
          </p>
        </div>

        {/* Botones de acción principales */}
        {!editData && (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={abrirEditar} style={{
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: "#eff6ff", color: "#2563eb",
              fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <i className="bi bi-pencil-square" /> Editar datos
            </button>

            {cerrado ? (
              <button onClick={reabrir} disabled={reabriendo} style={{
                padding: "10px 20px", borderRadius: 10, border: "none",
                background: "#f0fdf4", color: "#15803d",
                fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {reabriendo
                  ? <><span className="spinner-border spinner-border-sm me-1" />Reabriendo...</>
                  : <><i className="bi bi-door-open" /> Reabrir restaurante</>}
              </button>
            ) : (
              <button onClick={() => { setMotivoCierre(""); setModalCierre(true); }} style={{
                padding: "10px 20px", borderRadius: 10, border: "none",
                background: "#fff7ed", color: "#c2410c",
                fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <i className="bi bi-door-closed" /> Cerrar hoy
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Banner de éxito ── */}
      {saveOk && (
        <div style={{
          background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d",
          borderRadius: 10, padding: "11px 16px", marginBottom: 18,
          fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className="bi bi-check-circle-fill" /> Cambios guardados correctamente.
        </div>
      )}

      {/* ── Banner cerrado ── */}
      {cerrado && !editData && (
        <div style={{
          background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c",
          borderRadius: 10, padding: "12px 16px", marginBottom: 18,
          fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 10,
        }}>
          <i className="bi bi-door-closed-fill" style={{ fontSize: "1.1rem" }} />
          <div>
            <strong>Restaurante cerrado hoy</strong>
            {restaurante.motivoCierre && <span> — {restaurante.motivoCierre}</span>}
            <div style={{ fontSize: "0.78rem", marginTop: 2, color: "#9a3412" }}>
              Los clientes con reserva fueron notificados. Puedes reabrir cuando estés listo.
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODO LECTURA */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {!editData && (
        <div style={{ background: "white", borderRadius: 18, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>

          {/* Imagen + nombre en cabecera */}
          <div style={{ position: "relative", height: 200, background: "#f5f0ea", overflow: "hidden" }}>
            {restaurante.imagen ? (
              <img src={restaurante.imagen} alt={restaurante.nombre}
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="bi bi-shop" style={{ fontSize: "3.5rem", color: "#ddd" }} />
              </div>
            )}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.65))",
              padding: "24px 24px 16px",
            }}>
              <div style={{ color: "#ff9f22", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", marginBottom: 2 }}>
                {restaurante.tipo}
              </div>
              <h3 style={{ color: "white", fontWeight: 800, margin: 0, fontSize: "1.4rem" }}>
                {restaurante.nombre}
              </h3>
            </div>
          </div>

          {/* Datos */}
          <div style={{ padding: "24px 28px", display: "grid", gap: 20 }}>

            {/* Fila info general */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <InfoItem icon="bi-geo-alt" label="Distrito" value={restaurante.distrito || "—"} />
              <InfoItem icon="bi-map" label="Dirección" value={restaurante.direccion || "—"} />
              <InfoItem icon="bi-telephone" label="Teléfono" value={telefonoStr} />
              <InfoItem icon="bi-envelope" label="Email" value={restaurante.email || "—"} />
            </div>

            {(restaurante.mensaje_personalizado || restaurante.mensajePersonalizado) && (
              <div style={{ borderLeft: "3px solid #ff6b00", paddingLeft: 12, fontStyle: "italic", color: "#666", fontSize: "0.9rem" }}>
                "{restaurante.mensaje_personalizado || restaurante.mensajePersonalizado}"
              </div>
            )}

            {/* Horarios */}
            <div>
              <p style={{ ...sectionTitle, marginBottom: 10 }}>HORARIO SEMANAL</p>
              <HorarioDisplay restaurante={restaurante} />
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODO EDICIÓN */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {editData && (
        <div style={{ background: "white", borderRadius: 18, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ padding: "18px 28px", borderBottom: "1px solid #f0ece6", background: "#fafaf8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h5 style={{ margin: 0, fontWeight: 800, color: "#1a1a2e", fontSize: "1rem" }}>
              Editar: {editData.nombre}
            </h5>
            <button onClick={() => setEditData(null)} style={{ border: "none", background: "none", fontSize: "1.6rem", cursor: "pointer", color: "#888", lineHeight: 1 }}>
              &times;
            </button>
          </div>

          <div style={{ padding: 28 }}>
            {errEdit._global && (
              <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 10, padding: "11px 16px", marginBottom: 18, fontSize: "0.85rem" }}>
                <i className="bi bi-exclamation-triangle me-2" />{errEdit._global}
              </div>
            )}

            <form onSubmit={guardar}>

              {/* 1. Info general */}
              <section style={{ marginBottom: 22 }}>
                <p style={sectionTitle}>1. INFORMACIÓN GENERAL</p>
                <div className="row g-3">
                  <div className="col-md-7">
                    <label style={lbl}>Nombre del establecimiento</label>
                    <input className="form-control" style={inp(errEdit.nombre)}
                      value={editData.nombre || ""}
                      onChange={(e) => setEditData({ ...editData, nombre: e.target.value })} required />
                    {errEdit.nombre && <small style={{ color: "#ef4444" }}>{errEdit.nombre}</small>}
                  </div>
                  <div className="col-md-5">
                    <label style={lbl}>Categoría de comida</label>
                    <select style={inp(false)}
                      value={editData.tipo || ""}
                      onChange={(e) => setEditData({ ...editData, tipo: e.target.value })}>
                      {tiposComida.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <label style={lbl}>Eslogan / Mensaje de bienvenida</label>
                    <input style={inp(false)}
                      value={editData.mensaje_personalizado || editData.mensajePersonalizado || ""}
                      onChange={(e) => setEditData({ ...editData, mensaje_personalizado: e.target.value })} />
                  </div>
                </div>
              </section>

              {/* 2. Ubicación */}
              <section style={{ marginBottom: 22 }}>
                <p style={sectionTitle}>2. UBICACIÓN</p>
                <div className="row g-3">
                  <div className="col-md-5">
                    <label style={lbl}>Distrito</label>
                    <input style={inp(false)}
                      value={editData.distrito || ""}
                      onChange={(e) => setEditData({ ...editData, distrito: e.target.value })} />
                  </div>
                  <div className="col-md-7">
                    <label style={lbl}>Dirección exacta</label>
                    <input style={inp(false)}
                      value={editData.direccion || ""}
                      onChange={(e) => setEditData({ ...editData, direccion: e.target.value })} />
                  </div>
                </div>
              </section>

              {/* 3. Multimedia y contacto */}
              <section style={{ marginBottom: 22 }}>
                <p style={sectionTitle}>3. MULTIMEDIA Y CONTACTO</p>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label style={lbl}>Imagen de fachada</label>
                    <div style={{ border: "2px dashed #ddd", borderRadius: 12, height: 150, position: "relative", overflow: "hidden", background: "#f9f9f9" }}>
                      {preview && <img src={preview} alt="Fachada" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                      <input type="file" accept="image/*" onChange={handleImagen}
                        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} />
                      <div style={{ position: "absolute", bottom: 0, background: "rgba(0,0,0,0.45)", color: "white", width: "100%", fontSize: "0.62rem", textAlign: "center", padding: 4 }}>
                        Clic para cambiar imagen
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div style={{ marginBottom: 14 }}>
                      <label style={lbl}>Teléfono</label>
                      <input type="text" inputMode="numeric" placeholder="999123456"
                        style={inp(errEdit.telefono)}
                        value={editData.telefono ? String(editData.telefono) : ""}
                        onChange={handleTelefono} />
                      {errEdit.telefono && <small style={{ color: "#ef4444" }}>{errEdit.telefono}</small>}
                    </div>
                    <div>
                      <label style={lbl}>Email</label>
                      <input type="email" style={inp(false)}
                        value={editData.email || ""}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. Horarios */}
              <section style={{ marginBottom: 22 }}>
                <p style={sectionTitle}>4. HORARIO DE ATENCIÓN</p>
                <HorarioSemanalInput
                  value={horarios}
                  onChange={setHorarios}
                  inputClassName="form-control"
                />
              </section>

              {/* Acciones */}
              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid #f0ece6" }}>
                <button type="button" onClick={() => setEditData(null)}
                  style={{ padding: "11px 22px", borderRadius: 11, border: "1.5px solid #e8e0d8", background: "white", fontWeight: 600, cursor: "pointer", fontSize: "0.88rem", color: "#555" }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: "11px 32px", borderRadius: 11, border: "none", background: saving ? "#ffb380" : "#ff6b00", color: "white", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: 6 }}>
                  {saving
                    ? <><span className="spinner-border spinner-border-sm" /> Guardando...</>
                    : <><i className="bi bi-check-lg" /> Guardar Cambios</>}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* MODAL CIERRE TEMPORAL */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {modalCierre && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 16 }}
          onClick={() => setModalCierre(false)}>
          <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 460, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <i className="bi bi-door-closed-fill" style={{ fontSize: "2.5rem", color: "#c2410c" }} />
            </div>
            <h4 style={{ fontWeight: 800, color: "#1a1a2e", textAlign: "center", margin: "0 0 6px" }}>
              Cerrar restaurante hoy
            </h4>
            <p style={{ fontSize: "0.83rem", color: "#666", textAlign: "center", marginBottom: 20 }}>
              Se notificará automáticamente a los clientes con reservas para hoy.
            </p>

            <label style={lbl}>Motivo del cierre <span style={{ color: "#ef4444" }}>*</span></label>
            <textarea
              style={{ ...inp(!motivoCierre.trim()), resize: "vertical", minHeight: 80 }}
              placeholder="Ej: Mantenimiento de cocina, falta de personal, emergencia..."
              value={motivoCierre}
              onChange={(e) => setMotivoCierre(e.target.value)}
              autoFocus
            />
            <small style={{ color: "#aaa", fontSize: "0.73rem" }}>
              El motivo será visible en el catálogo y en la notificación a los clientes.
            </small>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setModalCierre(false)}
                style={{ flex: 1, padding: 10, borderRadius: 11, border: "1.5px solid #e0e0e0", background: "white", color: "#666", fontWeight: 700, cursor: "pointer" }}>
                Cancelar
              </button>
              <button onClick={confirmarCierre} disabled={cerrando || !motivoCierre.trim()}
                style={{ flex: 2, padding: 10, borderRadius: 11, border: "none", background: !motivoCierre.trim() ? "#fca5a5" : "#dc2626", color: "white", fontWeight: 700, cursor: !motivoCierre.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {cerrando
                  ? <><span className="spinner-border spinner-border-sm" /> Cerrando...</>
                  : <><i className="bi bi-door-closed" /> Confirmar cierre</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-componente: muestra horario semanal en modo lectura ─────────────── */
const DIAS_MAP = [
  { label: "Lun", campo: "horarioLunes"     },
  { label: "Mar", campo: "horarioMartes"    },
  { label: "Mié", campo: "horarioMiercoles" },
  { label: "Jue", campo: "horarioJueves"    },
  { label: "Vie", campo: "horarioViernes"   },
  { label: "Sáb", campo: "horarioSabado"    },
  { label: "Dom", campo: "horarioDomingo"   },
];

function HorarioDisplay({ restaurante }) {
  const tieneDatos = DIAS_MAP.some(({ campo }) => restaurante[campo]);
  if (!tieneDatos) {
    return <p style={{ color: "#aaa", fontSize: "0.85rem", margin: 0 }}>Sin horario configurado.</p>;
  }
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
      {DIAS_MAP.map(({ label, campo }) => {
        const val = restaurante[campo];
        const [apertura, cierre] = val ? val.split("-") : [null, null];
        return (
          <div key={label} style={{
            background: val ? "#fff8f0" : "#f8f8f8",
            border: `1px solid ${val ? "#ffd8b0" : "#eee"}`,
            borderRadius: 10, padding: "10px 12px",
          }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 800, color: val ? "#c2410c" : "#bbb", textTransform: "uppercase", marginBottom: 4 }}>
              {label}
            </div>
            {val ? (
              <div style={{ fontSize: "0.82rem", color: "#444", fontWeight: 600 }}>
                {apertura} – {cierre}
              </div>
            ) : (
              <div style={{ fontSize: "0.8rem", color: "#ccc" }}>Cerrado</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Sub-componente: ítem de info en modo lectura ── */
function InfoItem({ icon, label, value }) {
  return (
    <div>
      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#aaa", textTransform: "uppercase", marginBottom: 3 }}>
        <i className={`bi ${icon} me-1`} />{label}
      </div>
      <div style={{ fontSize: "0.9rem", color: "#333", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

export default MyRestaurant;
