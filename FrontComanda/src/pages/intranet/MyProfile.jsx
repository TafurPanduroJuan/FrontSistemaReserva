import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const inp = (hasError = false) => ({
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

const card = {
  background: "white", borderRadius: 14, padding: "24px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #e8e0d8",
  marginBottom: 20,
};

const sectionTitle = {
  fontWeight: 700, color: "#F4956A", fontSize: "0.82rem",
  marginBottom: 16, paddingBottom: 8,
  borderBottom: "2px solid #fff3e0", letterSpacing: "0.5px",
  textTransform: "uppercase",
};

export default function MyProfile() {
  const { user, updateProfile } = useAuth();

  /* ── Avatar ── */
  const [avatarModal, setAvatarModal]       = useState(false);
  const [uploadType, setUploadType]         = useState("local");
  const [avatarUrl, setAvatarUrl]           = useState(user?.avatar || "");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [avatarSaving, setAvatarSaving]     = useState(false);

  /* ── Perfil form ── */
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nombre:      user?.nombre      || "",
    telefono:    user?.telefono    ? String(user.telefono) : "",
    googleEmail: user?.googleEmail || "",
  });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState(null); 

  /* ── Campos faltantes ── */
  const camposFaltantes = [
    !user?.telefono    && { key: "telefono",    label: "Teléfono de contacto",      icon: "bi-telephone-fill" },
    !user?.googleEmail && { key: "googleEmail", label: "Correo de respaldo Google", icon: "bi-google" },
  ].filter(Boolean);
  const [bannerCerrado, setBannerCerrado] = useState(
    () => sessionStorage.getItem("perfil_personal_banner") === "1"
  );
  const mostrarBanner = camposFaltantes.length > 0 && !bannerCerrado;

  /* ── Handlers ── */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("La imagen debe ser menor a 2MB."); return; }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarUrl.trim()) return;
    setAvatarSaving(true);
    const result = await updateProfile({ avatar: avatarUrl.trim() });
    setAvatarSaving(false);
    if (result.ok) { setAvatarModal(false); flashMsg("ok", "Foto actualizada correctamente"); }
    else { flashMsg("error", "No se pudo guardar la foto"); }
  };

  const flashMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (form.telefono && !/^\d{9}$/.test(form.telefono)) e.telefono = "Debe tener exactamente 9 dígitos";
    if (form.googleEmail && !/^[\w.+\-]+@[\w\-]+\.[\w.]+$/.test(form.googleEmail))
      e.googleEmail = "Correo no válido";
    return e;
  };

  const handleSaveProfile = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    const result = await updateProfile({
      nombre:      form.nombre.trim(),
      telefono:    form.telefono ? parseInt(form.telefono) : null,
      googleEmail: form.googleEmail.trim() || "",
    });
    setSaving(false);
    if (result.ok) { setEditMode(false); flashMsg("ok", "Perfil guardado correctamente"); }
    else { flashMsg("error", "Error al guardar. Intenta de nuevo."); }
  };

  const openEdit = () => {
    setForm({
      nombre:      user?.nombre      || "",
      telefono:    user?.telefono    ? String(user.telefono) : "",
      googleEmail: user?.googleEmail || "",
    });
    setErrors({});
    setEditMode(true);
    setBannerCerrado(true);
    sessionStorage.setItem("perfil_personal_banner", "1");
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>

      {/* ── TÍTULO ── */}
      <div className="intra-page-header">
        <h2 className="intra-page-title">
          <i className="bi bi-person-gear" /> Mi Perfil
        </h2>
      </div>

      {/* ── TOAST ── */}
      {msg && (
        <div style={{
          background: msg.type === "ok" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${msg.type === "ok" ? "#86efac" : "#fca5a5"}`,
          color: msg.type === "ok" ? "#16a34a" : "#dc2626",
          borderRadius: 10, padding: "11px 16px", marginBottom: 16,
          fontSize: "0.85rem", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <i className={`bi ${msg.type === "ok" ? "bi-check-circle-fill" : "bi-x-circle-fill"}`} />
          {msg.text}
        </div>
      )}

      {/* ── BANNER DATOS FALTANTES ── */}
      {mostrarBanner && (
        <div style={{
          background: "linear-gradient(135deg, #fff8ec 0%, #fff3e0 100%)",
          border: "1.5px solid #f59e0b", borderRadius: 14,
          padding: "16px 20px", marginBottom: 20,
          display: "flex", alignItems: "flex-start", gap: 14,
          boxShadow: "0 2px 12px rgba(245,158,11,0.10)",
        }}>
          <div style={{ fontSize: "1.5rem", color: "#f59e0b", flexShrink: 0, marginTop: 2 }}>
            <i className="bi bi-exclamation-circle-fill" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, color: "#92400e", fontSize: "0.93rem", marginBottom: 4 }}>
              ¡Completa tu perfil!
            </div>
            <div style={{ fontSize: "0.83rem", color: "#78350f", marginBottom: 10 }}>
              {camposFaltantes.length === 1
                ? "Te falta este dato importante para proteger tu cuenta:"
                : "Te faltan estos datos para proteger tu cuenta:"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {camposFaltantes.map(c => (
                <span key={c.key} style={{
                  background: "white", border: "1.5px solid #fcd34d",
                  borderRadius: 20, padding: "4px 12px",
                  fontSize: "0.79rem", fontWeight: 700, color: "#92400e",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <i className={`bi ${c.icon}`} /> {c.label}
                </span>
              ))}
            </div>
            <button onClick={openEdit} style={{
              background: "#f59e0b", color: "white", border: "none",
              borderRadius: 9, padding: "7px 16px",
              fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <i className="bi bi-pencil-fill" /> Completar ahora
            </button>
          </div>
          <button onClick={() => { setBannerCerrado(true); sessionStorage.setItem("perfil_personal_banner", "1"); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#b45309", fontSize: "1rem", padding: 4, flexShrink: 0 }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}

      {/* ── TARJETA AVATAR + RESUMEN ── */}
      <div style={{
        ...card,
        display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap",
      }}>
        {/* Avatar */}
        <div
          onClick={() => { setAvatarUrl(user?.avatar || ""); setAvatarUrlInput(""); setUploadType("local"); setAvatarModal(true); }}
          title="Cambiar foto"
          style={{
            width: 80, height: 80, borderRadius: "50%",
            background: "linear-gradient(135deg, #fdf0e8, #fff3e0)",
            border: "3px solid #F4956A",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "2rem", color: "#F4956A",
            overflow: "hidden", cursor: "pointer", flexShrink: 0,
            position: "relative", transition: "box-shadow .2s",
            boxShadow: "0 2px 10px rgba(244,149,106,0.25)",
          }}>
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <i className="bi bi-person-fill" />
          }
          {/* overlay hint */}
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity .2s", borderRadius: "50%",
            fontSize: "1.1rem", color: "white",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = 1}
            onMouseLeave={e => e.currentTarget.style.opacity = 0}>
            <i className="bi bi-camera-fill" />
          </div>
        </div>

        {/* Info resumida */}
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1a1a2e", marginBottom: 2 }}>
            {user?.nombre}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#888", marginBottom: 8 }}>{user?.email}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <span style={{
              background: "#dbeafe", color: "#1d4ed8",
              borderRadius: 20, padding: "3px 10px", fontSize: "0.74rem", fontWeight: 700,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <i className="bi bi-person-badge" /> Personal
            </span>
            {user?.restaurante && (
              <span style={{
                background: "#fff3e0", color: "#F4956A",
                borderRadius: 20, padding: "3px 10px", fontSize: "0.74rem", fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: 4,
              }}>
                <i className="bi bi-shop" /> {user.restaurante}
              </span>
            )}
          </div>
        </div>

        {/* Botón editar */}
        {!editMode && (
          <button onClick={openEdit} className="btn-brand" style={{ alignSelf: "flex-start" }}>
            <i className="bi bi-pencil" /> Editar perfil
          </button>
        )}
      </div>

      {/* ── FORMULARIO / VISTA DE DATOS ── */}
      <div style={card}>
        <div style={sectionTitle}>Información Personal</div>

        {editMode ? (
          <div>
            {/* Nombre */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Nombre completo</label>
              <input
                style={inp(!!errors.nombre)}
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Tu nombre"
              />
              {errors.nombre && <span style={{ color: "#ef4444", fontSize: "0.77rem" }}>{errors.nombre}</span>}
            </div>

            {/* Email (readonly) */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Correo electrónico</label>
              <input style={{ ...inp(), background: "#f9f9f9", color: "#999" }} value={user?.email || ""} disabled />
              <span style={{ fontSize: "0.75rem", color: "#aaa" }}>El email no se puede cambiar.</span>
            </div>

            {/* Teléfono */}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>
                Teléfono de contacto
                {!user?.telefono && (
                  <span style={{ marginLeft: 6, color: "#f59e0b", fontSize: "0.7rem", fontWeight: 700, textTransform: "none" }}>
                    ⚠ Recomendado
                  </span>
                )}
              </label>
              <input
                style={inp(!!errors.telefono)}
                value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value.replace(/\D/g, "").slice(0, 9) })}
                placeholder="987654321"
                maxLength={9}
                inputMode="numeric"
              />
              {errors.telefono
                ? <span style={{ color: "#ef4444", fontSize: "0.77rem" }}>{errors.telefono}</span>
                : <span style={{ fontSize: "0.75rem", color: "#aaa" }}>9 dígitos exactos.</span>
              }
            </div>

            {/* Correo Google */}
            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>
                Correo de respaldo Google
                {!user?.googleEmail && (
                  <span style={{ marginLeft: 6, color: "#f59e0b", fontSize: "0.7rem", fontWeight: 700, textTransform: "none" }}>
                    ⚠ Recomendado
                  </span>
                )}
              </label>
              <input
                style={inp(!!errors.googleEmail)}
                value={form.googleEmail}
                onChange={e => setForm({ ...form, googleEmail: e.target.value })}
                placeholder="tu@gmail.com"
                type="email"
              />
              {errors.googleEmail
                ? <span style={{ color: "#ef4444", fontSize: "0.77rem" }}>{errors.googleEmail}</span>
                : <span style={{ fontSize: "0.75rem", color: "#aaa" }}>Se usa para recuperar tu contraseña si la olvidas.</span>
              }
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-brand"
                style={{ minWidth: 140 }}>
                {saving
                  ? <><span className="spinner-border spinner-border-sm me-1" /> Guardando…</>
                  : <><i className="bi bi-check-lg" /> Guardar cambios</>
                }
              </button>
              <button
                onClick={() => { setEditMode(false); setErrors({}); }}
                style={{
                  background: "#f5f5f5", color: "#555", border: "1.5px solid #e0e0e0",
                  borderRadius: 10, padding: "8px 18px", fontSize: "0.88rem",
                  fontWeight: 600, cursor: "pointer",
                }}>
                Cancelar
              </button>
            </div>
          </div>

        ) : (
          /* Vista de solo lectura */
          <div>
            {[
              {
                icon: "bi-person",
                label: "Nombre",
                value: user?.nombre,
              },
              {
                icon: "bi-envelope",
                label: "Email",
                value: user?.email,
              },
              {
                icon: "bi-telephone",
                label: "Teléfono",
                value: user?.telefono
                  ? `+51 ${user.telefono}`
                  : <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: "0.83rem" }}>
                      <i className="bi bi-exclamation-triangle-fill me-1" />No registrado — recomendado
                    </span>,
              },
              {
                icon: "bi-google",
                label: "Correo Google",
                value: user?.googleEmail
                  ? <span style={{ color: "#22c55e" }}>
                      <i className="bi bi-check-circle-fill me-1" />{user.googleEmail}
                    </span>
                  : <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: "0.83rem" }}>
                      <i className="bi bi-exclamation-triangle-fill me-1" />No vinculado — recomendado
                    </span>,
              },
              {
                icon: "bi-shop",
                label: "Restaurante asignado",
                value: user?.restaurante || <span style={{ color: "#aaa" }}>—</span>,
              },
            ].map(row => (
              <div key={row.label} style={{
                display: "flex", alignItems: "flex-start",
                padding: "12px 0",
                borderBottom: "1px solid #f5f5f5",
                gap: 12, flexWrap: "wrap",
              }}>
                <div style={{
                  width: 170, flexShrink: 0,
                  display: "flex", alignItems: "center", gap: 7,
                  fontSize: "0.82rem", fontWeight: 700, color: "#888",
                }}>
                  <i className={`bi ${row.icon}`} style={{ color: "#F4956A", fontSize: "1rem" }} />
                  {row.label}
                </div>
                <div style={{ flex: 1, fontSize: "0.88rem", color: "#1a1a2e", wordBreak: "break-word" }}>
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── SECCIÓN SEGURIDAD ── */}
      <div style={card}>
        <div style={sectionTitle}>Seguridad de la cuenta</div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
        }}>
          {/* Estado correo Google */}
          <div style={{
            background: user?.googleEmail ? "#f0fdf4" : "#fff8ec",
            border: `1.5px solid ${user?.googleEmail ? "#86efac" : "#fcd34d"}`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className="bi bi-google" style={{ color: user?.googleEmail ? "#16a34a" : "#f59e0b", fontSize: "1.1rem" }} />
              <span style={{ fontWeight: 700, fontSize: "0.83rem", color: "#1a1a2e" }}>Correo de respaldo</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: user?.googleEmail ? "#16a34a" : "#92400e", fontWeight: 600 }}>
              {user?.googleEmail ? `✓ Vinculado: ${user.googleEmail}` : "⚠ No vinculado"}
            </div>
            <div style={{ fontSize: "0.73rem", color: "#888", marginTop: 4 }}>
              {user?.googleEmail
                ? "Puedes recuperar tu contraseña por email."
                : "Sin esto no podrás recuperar tu cuenta si olvidas la contraseña."}
            </div>
          </div>

          {/* Estado teléfono */}
          <div style={{
            background: user?.telefono ? "#f0fdf4" : "#fff8ec",
            border: `1.5px solid ${user?.telefono ? "#86efac" : "#fcd34d"}`,
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <i className="bi bi-telephone-fill" style={{ color: user?.telefono ? "#16a34a" : "#f59e0b", fontSize: "1.1rem" }} />
              <span style={{ fontWeight: 700, fontSize: "0.83rem", color: "#1a1a2e" }}>Teléfono de contacto</span>
            </div>
            <div style={{ fontSize: "0.78rem", color: user?.telefono ? "#16a34a" : "#92400e", fontWeight: 600 }}>
              {user?.telefono ? `✓ Registrado: +51 ${user.telefono}` : "⚠ No registrado"}
            </div>
            <div style={{ fontSize: "0.73rem", color: "#888", marginTop: 4 }}>
              {user?.telefono
                ? "El restaurante puede contactarte si hay cambios."
                : "Útil para que el administrador pueda contactarte."}
            </div>
          </div>
        </div>

        {(camposFaltantes.length > 0) && (
          <div style={{ marginTop: 14 }}>
            <button onClick={openEdit} className="btn-brand" style={{ fontSize: "0.82rem" }}>
              <i className="bi bi-shield-check" /> Completar datos de seguridad
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL AVATAR ── */}
      {avatarModal && (
        <div
          onClick={() => setAvatarModal(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "white", borderRadius: 18, padding: 28,
            maxWidth: 420, width: "100%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <h4 style={{ fontWeight: 800, marginBottom: 6, fontSize: "1.05rem", color: "#1a1a2e" }}>
              Cambiar foto de perfil
            </h4>
            <p style={{ fontSize: "0.83rem", color: "#888", marginBottom: 16 }}>
              Elige cómo deseas actualizar tu foto
            </p>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { id: "local", label: "Subir imagen", icon: "bi-desktop" },
                { id: "url",   label: "Enlace URL",   icon: "bi-link-45deg" },
              ].map(t => (
                <button key={t.id}
                  onClick={() => {
                    setUploadType(t.id);
                    setAvatarUrl(t.id === "local" ? (user?.avatar || "") : (user?.avatar || ""));
                    setAvatarUrlInput("");
                  }}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 9, cursor: "pointer",
                    border: uploadType === t.id ? "2px solid #F4956A" : "1.5px solid #e8e0d8",
                    background: uploadType === t.id ? "#fff3e0" : "white",
                    color: uploadType === t.id ? "#F4956A" : "#666",
                    fontWeight: 700, fontSize: "0.82rem",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}>
                  <i className={`bi ${t.icon}`} /> {t.label}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "#fdf0e8", border: "3px solid #F4956A",
              margin: "0 auto 16px", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "2.2rem", color: "#F4956A",
              overflow: "hidden",
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={e => { e.target.style.display = "none"; }} />
                : <i className="bi bi-person-fill" />
              }
            </div>

            {uploadType === "local" ? (
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Archivo de imagen</label>
                <input
                  type="file" accept="image/*"
                  style={{ ...inp(), paddingTop: 8 }}
                  onChange={handleFileChange}
                />
                <span style={{ fontSize: "0.73rem", color: "#aaa" }}>JPG, PNG, WEBP. Máx 2MB.</span>
              </div>
            ) : (
              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>URL de la imagen</label>
                <input
                  type="url" style={inp()}
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                  value={avatarUrlInput}
                  onChange={e => { setAvatarUrlInput(e.target.value); setAvatarUrl(e.target.value); }}
                />
                <span style={{ fontSize: "0.73rem", color: "#aaa" }}>Cualquier URL pública de imagen.</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAvatarModal(false)} style={{
                flex: 1, padding: "9px 0", borderRadius: 9,
                border: "1.5px solid #e0e0e0", background: "#f5f5f5",
                color: "#555", fontWeight: 600, cursor: "pointer", fontSize: "0.87rem",
              }}>
                Cancelar
              </button>
              <button onClick={handleSaveAvatar} disabled={avatarSaving} className="btn-brand" style={{ flex: 1, justifyContent: "center" }}>
                {avatarSaving
                  ? <><span className="spinner-border spinner-border-sm me-1" /> Guardando…</>
                  : <><i className="bi bi-check-lg" /> Guardar foto</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}