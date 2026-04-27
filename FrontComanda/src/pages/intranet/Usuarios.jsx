import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRestaurantes } from "../../context/RestaurantesContext";

const ROLES = ["usuario", "personal", "administrador"];

function getRolBadge(rol) {
  const map = {
    administrador: { color: "#ff3300", bg: "#fff0ed", icon: "bi-shield-check" },
    personal:      { color: "#ff9f22", bg: "#fff8ee", icon: "bi-person-badge" },
    usuario:       { color: "#4a90d9", bg: "#eff6ff", icon: "bi-person"       },
  };
  return map[rol] || map.usuario;
}

// ── Estilos reutilizables ─────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1.5px solid #e8ddd3",
  borderRadius: 8,
  fontSize: "0.88rem",
  outline: "none",
  background: "#fdf8f3",
  boxSizing: "border-box",
};

const btnPrimary = {
  background: "linear-gradient(135deg,#ff9f22,#ff3300)",
  color: "white",
  border: "none",
  borderRadius: 8,
  padding: "8px 18px",
  fontSize: "0.85rem",
  fontWeight: 700,
  cursor: "pointer",
};

const btnSecondary = {
  background: "#f5f5f5",
  color: "#888",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontSize: "0.85rem",
  cursor: "pointer",
};

// ── Modal genérico ────────────────────────────────────────────────────────
function Modal({ title, icon, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "white", borderRadius: 16, width: "100%", maxWidth: 480,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg,#ff9f22,#ff3300)",
            padding: "18px 24px", display: "flex", alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3 style={{ margin: 0, color: "white", fontSize: "1rem", fontWeight: 700 }}>
            <i className={`bi ${icon} me-2`} />{title}
          </h3>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "white", fontSize: "1.2rem", cursor: "pointer" }}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: "24px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function Usuarios() {
  const { changeUserRole, createUser, deleteUser, adminUpdateUser, user: adminUser } = useAuth();
  const { restaurantes: restaurantesCtx } = useRestaurantes();
  const RESTAURANTES = restaurantesCtx.map((r) => r.nombre);

  const [users, setUsers]           = useState([]);
  const [search, setSearch]         = useState("");
  const [toast, setToast]           = useState("");

  // Modales
  const [modalCrear, setModalCrear]     = useState(false);
  const [modalEditar, setModalEditar]   = useState(null); // usuario a editar
  const [modalEliminar, setModalEliminar] = useState(null); // usuario a eliminar

  // Formulario crear
  const emptyCreate = { nombre: "", email: "", password: "", rol: "usuario", restaurante: "" };
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [createError, setCreateError] = useState("");
  const [showCreatePass, setShowCreatePass] = useState(false);

  // Formulario editar
  const [editForm, setEditForm]   = useState({});
  const [editError, setEditError] = useState("");
  const [showEditPass, setShowEditPass] = useState(false);

  function loadUsers() {
    const stored = localStorage.getItem("comanda_users");
    if (stored) setUsers(JSON.parse(stored));
  }

  useEffect(() => { loadUsers(); }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const filtered = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Crear ──────────────────────────────────────────────────────────────
  function handleCreate(e) {
    e.preventDefault();
    if (!createForm.nombre || !createForm.email || !createForm.password) {
      setCreateError("Completa todos los campos obligatorios."); return;
    }
    if (createForm.rol === "personal" && !createForm.restaurante) {
      setCreateError("Selecciona un restaurante para el personal."); return;
    }
    const result = createUser(createForm);
    if (!result.ok) { setCreateError(result.error); return; }
    loadUsers();
    setModalCrear(false);
    setCreateForm(emptyCreate);
    setCreateError("");
    showToast("✅ Cuenta creada correctamente");
  }

  // ── Editar ─────────────────────────────────────────────────────────────
  function openEdit(u) {
    setEditForm({
      nombre: u.nombre,
      email: u.email,
      password: "",          // vacío = no cambia
      rol: u.rol,
      restaurante: u.restaurante || "",
    });
    setEditError("");
    setModalEditar(u);
  }

  function handleEdit(e) {
    e.preventDefault();
    if (!editForm.nombre || !editForm.email) {
      setEditError("Nombre y email son obligatorios."); return;
    }
    if (editForm.rol === "personal" && !editForm.restaurante) {
      setEditError("Selecciona un restaurante para el personal."); return;
    }
    const data = {
      nombre: editForm.nombre,
      email: editForm.email,
      rol: editForm.rol,
      restaurante: editForm.rol === "personal" ? editForm.restaurante : null,
    };
    // Solo actualiza contraseña si se escribió algo
    if (editForm.password.trim()) data.password = editForm.password.trim();

    const result = adminUpdateUser(modalEditar.id, data);
    if (!result.ok) { setEditError(result.error); return; }

    // Si cambió el rol, usar también changeUserRole para sincronizar contexto
    if (editForm.rol !== modalEditar.rol) {
      changeUserRole(modalEditar.id, editForm.rol, data.restaurante);
    }
    loadUsers();
    setModalEditar(null);
    showToast("✅ Cuenta actualizada correctamente");
  }

  // ── Eliminar ───────────────────────────────────────────────────────────
  function handleDelete() {
    deleteUser(modalEliminar.id);
    loadUsers();
    setModalEliminar(null);
    showToast("🗑️ Cuenta eliminada");
  }

  return (
    <div style={{ padding: "28px 32px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
            <i className="bi bi-people me-2" style={{ color: "#ff6b00" }} />
            Gestión de Usuarios
          </h2>
          <p style={{ color: "#888", marginTop: 4, marginBottom: 0 }}>
            Crea, edita y administra las cuentas del sistema
          </p>
        </div>
        <button
          onClick={() => { setModalCrear(true); setCreateError(""); setCreateForm(emptyCreate); }}
          style={btnPrimary}
        >
          <i className="bi bi-person-plus-fill me-2" />
          Nueva cuenta
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          background: "#f0fff4", border: "1px solid #b7f7cb", borderRadius: 10,
          padding: "10px 16px", marginBottom: 16, color: "#1a7a3f", fontWeight: 600,
        }}>
          {toast}
        </div>
      )}

      {/* Buscador */}
      <div style={{ position: "relative", maxWidth: 360, marginBottom: 20 }}>
        <i className="bi bi-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb" }} />
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {/* Tabla */}
      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden", border: "1px solid #f0e8e0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fdf8f3", borderBottom: "2px solid #f0e8e0" }}>
              {["Usuario", "Email", "Rol", "Restaurante", "Registro", "Acciones"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const badge = getRolBadge(u.rol);
              const isMe = u.id === adminUser?.id;
              return (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid #f5ede4", background: isMe ? "#fffdf5" : "white", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { if (!isMe) e.currentTarget.style.background = "#fdfaf7"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isMe ? "#fffdf5" : "white"; }}
                >
                  {/* Nombre */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#ff9f22,#ff3300)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.9rem", flexShrink: 0 }}>
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: "0.9rem" }}>
                          {u.nombre}
                          {isMe && <span style={{ marginLeft: 6, fontSize: "0.7rem", color: "#ff6b00" }}>(tú)</span>}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "14px 16px", color: "#666", fontSize: "0.88rem" }}>{u.email}</td>

                  {/* Rol */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: badge.bg, color: badge.color, padding: "4px 12px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <i className={`bi ${badge.icon}`} />
                      {u.rol.charAt(0).toUpperCase() + u.rol.slice(1)}
                    </span>
                  </td>

                  {/* Restaurante */}
                  <td style={{ padding: "14px 16px", color: "#666", fontSize: "0.88rem" }}>
                    {u.restaurante || <span style={{ color: "#ccc", fontSize: "0.8rem" }}>—</span>}
                  </td>

                  {/* Fecha */}
                  <td style={{ padding: "14px 16px", color: "#aaa", fontSize: "0.82rem" }}>
                    {u.fechaRegistro}
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => openEdit(u)}
                        title="Editar cuenta"
                        style={{ background: "#fff5ee", color: "#ff6b00", border: "1.5px solid #ffd4b3", borderRadius: 8, padding: "6px 12px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                      >
                        <i className="bi bi-pencil-fill" />
                      </button>
                      <button
                        onClick={() => setModalEliminar(u)}
                        disabled={isMe}
                        title={isMe ? "No puedes eliminar tu propia cuenta" : "Eliminar cuenta"}
                        style={{ background: isMe ? "#f5f5f5" : "#fff0ef", color: isMe ? "#ccc" : "#e53e3e", border: `1.5px solid ${isMe ? "#eee" : "#fecaca"}`, borderRadius: 8, padding: "6px 12px", fontSize: "0.8rem", fontWeight: 600, cursor: isMe ? "not-allowed" : "pointer" }}
                      >
                        <i className="bi bi-trash-fill" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#bbb" }}>
            <i className="bi bi-people" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div style={{ marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { rol: "administrador", desc: "Acceso total a la intranet" },
          { rol: "personal",      desc: "Solo Mesas y Reservas" },
          { rol: "usuario",       desc: "Acceso a la web pública y Mi cuenta" },
        ].map(({ rol, desc }) => {
          const b = getRolBadge(rol);
          return (
            <div key={rol} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#888" }}>
              <span style={{ background: b.bg, color: b.color, padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: "0.75rem" }}>
                <i className={`bi ${b.icon} me-1`} />
                {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </span>
              — {desc}
            </div>
          );
        })}
      </div>

      {/* ── MODAL CREAR ───────────────────────────────────────────────── */}
      {modalCrear && (
        <Modal title="Nueva cuenta" icon="bi-person-plus-fill" onClose={() => setModalCrear(false)}>
          <form onSubmit={handleCreate} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={createForm.nombre}
                  onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                  Contraseña *
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showCreatePass ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePass(!showCreatePass)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa" }}
                  >
                    <i className={`bi ${showCreatePass ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                  Rol *
                </label>
                <select
                  value={createForm.rol}
                  onChange={(e) => setCreateForm({ ...createForm, rol: e.target.value, restaurante: "" })}
                  style={inputStyle}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>

              {createForm.rol === "personal" && (
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                    Restaurante *
                  </label>
                  <select
                    value={createForm.restaurante}
                    onChange={(e) => setCreateForm({ ...createForm, restaurante: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Seleccionar restaurante...</option>
                    {RESTAURANTES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}

              {createError && (
                <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8, padding: "8px 12px", color: "#e53e3e", fontSize: "0.83rem" }}>
                  <i className="bi bi-exclamation-circle-fill me-2" />{createError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={() => setModalCrear(false)} style={btnSecondary}>Cancelar</button>
                <button type="submit" style={btnPrimary}>
                  <i className="bi bi-person-check-fill me-2" />Crear cuenta
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL EDITAR ──────────────────────────────────────────────── */}
      {modalEditar && (
        <Modal title="Editar cuenta" icon="bi-pencil-fill" onClose={() => setModalEditar(null)}>
          <form onSubmit={handleEdit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                  Nueva contraseña
                  <span style={{ fontWeight: 400, color: "#aaa", marginLeft: 6 }}>(dejar vacío para no cambiar)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showEditPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    style={{ ...inputStyle, paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPass(!showEditPass)}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#aaa" }}
                  >
                    <i className={`bi ${showEditPass ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                  Rol *
                </label>
                <select
                  value={editForm.rol}
                  onChange={(e) => setEditForm({ ...editForm, rol: e.target.value, restaurante: "" })}
                  style={inputStyle}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>

              {editForm.rol === "personal" && (
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>
                    Restaurante *
                  </label>
                  <select
                    value={editForm.restaurante}
                    onChange={(e) => setEditForm({ ...editForm, restaurante: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Seleccionar restaurante...</option>
                    {RESTAURANTES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              )}

              {editError && (
                <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8, padding: "8px 12px", color: "#e53e3e", fontSize: "0.83rem" }}>
                  <i className="bi bi-exclamation-circle-fill me-2" />{editError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                <button type="button" onClick={() => setModalEditar(null)} style={btnSecondary}>Cancelar</button>
                <button type="submit" style={btnPrimary}>
                  <i className="bi bi-check-lg me-2" />Guardar cambios
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL ELIMINAR ────────────────────────────────────────────── */}
      {modalEliminar && (
        <Modal title="Eliminar cuenta" icon="bi-trash-fill" onClose={() => setModalEliminar(null)}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>⚠️</div>
            <p style={{ color: "#444", marginBottom: 6 }}>
              ¿Estás seguro de que deseas eliminar la cuenta de
            </p>
            <p style={{ fontWeight: 800, fontSize: "1.05rem", color: "#1a1a2e", marginBottom: 16 }}>
              {modalEliminar.nombre}
            </p>
            <p style={{ color: "#999", fontSize: "0.85rem", marginBottom: 24 }}>
              Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setModalEliminar(null)} style={btnSecondary}>Cancelar</button>
              <button
                onClick={handleDelete}
                style={{ ...btnPrimary, background: "linear-gradient(135deg,#e53e3e,#c53030)" }}
              >
                <i className="bi bi-trash-fill me-2" />Sí, eliminar
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}