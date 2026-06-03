import { apiFetch } from "../../services/api";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRestaurants } from "../../context/RestaurantsContext";

const ROLES = ["usuario", "personal", "administrador"];
const PASTEL_ORANGE = "#F4956A";

function getRolBadge(rol) {
  const map = {
    administrador: { color: "#e0784d", bg: "#fff0ed", icon: "bi-shield-check", label: "Administrador" },
    personal:      { color: "#d4843a", bg: "#fff8ee", icon: "bi-person-badge", label: "Personal" },
    usuario:       { color: "#4a90d9", bg: "#eff6ff", icon: "bi-person", label: "Usuario" },
  };
  return map[rol] || map.usuario;
}

const EMPTY_FORM = { nombre: "", email: "", password: "", rol: "usuario", restaurante: "" };

export default function Users() {
  const { token, user: adminUser } = useAuth();
  const { restaurantes: restaurantesCtx } = useRestaurants();
  const RESTAURANTES = restaurantesCtx.map(r => r.nombre);

  const [users, setUsers]       = useState([]);
  const [search, setSearch]     = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", email: "", rol: "", restaurante: "" });
  const [savedMsg, setSavedMsg] = useState("");

  const [modalEliminar, setModalEliminar] = useState(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [createForm, setCreateForm]       = useState(EMPTY_FORM);
  const [createErrors, setCreateErrors]   = useState({});
  const [cargando, setCargando]           = useState(false);

  const loadUsers = async () => {
    if (!token) return;
    setCargando(true);
    try {
      const raw = await apiFetch("/api/users", {}, token);
      const data = raw.map(u => ({
        ...u,
        nombre: u.name || u.nombre || "",
        rol: (u.role || u.rol || "usuario").toLowerCase(),
        restaurante: u.restaurant || u.restaurante || null,
        fechaRegistro: u.createdAt || u.fechaRegistro || "",
        activo: u.activo !== false,
      }));
      setUsers(data);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
      notify("❌ No se pudo cargar la lista de usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { loadUsers(); }, [token]);

  function notify(msg) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 3000);
  }

  const filtered = users.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(u) {
    setEditingId(u.id);
    setEditForm({ nombre: u.nombre, email: u.email, rol: u.rol, restaurante: u.restaurante || "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ nombre: "", email: "", rol: "", restaurante: "" });
  }

  async function saveEdit(userId) {
    try {
      await apiFetch(`/api/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ rol: editForm.rol }),
      }, token);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, rol: editForm.rol, nombre: editForm.nombre,
                email: editForm.email, restaurante: editForm.restaurante || null }
            : u
        )
      );
      cancelEdit();
      notify("Usuario actualizado correctamente");
    } catch (err) {
      notify("❌ " + err.message);
    }
  }

  async function handleDelete() {
    try {
      await apiFetch(`/api/users/${modalEliminar.id}`, { method: "DELETE" }, token);
      setUsers((prev) => prev.filter((u) => u.id !== modalEliminar.id));
      setModalEliminar(null);
      notify("🗑️ Cuenta eliminada");
    } catch (err) {
      setModalEliminar(null);
      notify("❌ " + err.message);
    }
  }

  function validateCreate() {
    const errs = {};
    if (!createForm.nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (!createForm.email.trim()) errs.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(createForm.email)) errs.email = "Email no válido";
    if (!createForm.password || createForm.password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (createForm.rol === "personal" && !createForm.restaurante) errs.restaurante = "Seleccione un restaurante";
    return errs;
  }

  async function handleCreate() {
    const errs = validateCreate();
    if (Object.keys(errs).length > 0) { setCreateErrors(errs); return; }
    try {
      const newUser = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nombre: createForm.nombre,
          email: createForm.email,
          password: createForm.password,
        }),
      });
      if (createForm.rol !== "usuario") {
        await apiFetch(`/api/users/${newUser.id}/role`, {
          method: "PUT",
          body: JSON.stringify({ rol: createForm.rol }),
        }, token);
      }
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      setCreateErrors({});
      notify("✅ Usuario creado exitosamente");
      await loadUsers();
    } catch (err) {
      setCreateErrors({ email: err.message });
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    border: "1.5px solid #e8ddd3",
    borderRadius: 8,
    fontSize: "0.9rem",
    outline: "none",
    background: "#fdf8f3",
    marginBottom: 4,
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Cabecera */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
            <i className="bi bi-people me-2" style={{ color: PASTEL_ORANGE }} />
            Gestión de Usuarios
          </h2>
          <p style={{ color: "#888", marginTop: 4, marginBottom: 0, fontSize: "0.85rem" }}>
            Administra roles, permisos y cuentas de usuario
          </p>
        </div>

        <button
          onClick={() => { setShowCreate(true); setCreateForm(EMPTY_FORM); setCreateErrors({}); }}
          style={{
            background: PASTEL_ORANGE,
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontWeight: 700,
            fontSize: "0.88rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <i className="bi bi-person-plus" /> Nuevo Usuario
        </button>
      </div>

      {savedMsg && (
        <div style={{ background: "#f0fff4", border: "1px solid #b7f7cb", borderRadius: 10, padding: "10px 16px", marginBottom: 14, color: "#1a7a3f", fontWeight: 600 }}>
          {savedMsg}
        </div>
      )}

      {/* Buscador */}
      <div style={{ position: "relative", maxWidth: 360, marginBottom: 16 }}>
        <i className="bi bi-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#bbb" }} />
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1.5px solid #e8ddd3", borderRadius: 10, fontSize: "0.9rem", outline: "none", background: "#fdf8f3" }}
        />
      </div>

      {/* Tabla */}
      <div style={{ background: "white", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0e8e0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ background: "#fdf8f3", borderBottom: "2px solid #f0e8e0" }}>
              {["Usuario", "Email", "Rol Actual", "Restaurante", "Estado", "Acciones"].map(h => (
                <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const badge   = getRolBadge(u.rol);
              const isEditing = editingId === u.id;
              const isMe    = u.id === adminUser?.id;
              const isActive = u.activo !== false;

              return (
                <tr
                  key={u.id}
                  style={{ borderBottom: "1px solid #f5ede4", background: isMe ? "#fffdf5" : isActive ? "white" : "#fafafa", opacity: isActive ? 1 : 0.65, transition: "background 0.15s" }}
                >
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: PASTEL_ORANGE, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.88rem", flexShrink: 0 }}>
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        {isEditing ? (
                          <input
                            value={editForm.nombre}
                            onChange={e => setEditForm({ ...editForm, nombre: e.target.value })}
                            style={{ ...inputStyle, marginBottom: 0, padding: "5px 8px", fontSize: "0.85rem" }}
                          />
                        ) : (
                          <>
                            <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: "0.88rem" }}>
                              {u.nombre}
                              {isMe && <span style={{ marginLeft: 6, fontSize: "0.7rem", color: PASTEL_ORANGE }}>(tú)</span>}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#aaa" }}>Desde {u.fechaRegistro}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        style={{ ...inputStyle, marginBottom: 0, padding: "5px 8px", fontSize: "0.85rem" }}
                      />
                    ) : (
                      <span style={{ color: "#666", fontSize: "0.85rem" }}>{u.email}</span>
                    )}
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    {isEditing ? (
                      <select
                        value={editForm.rol}
                        onChange={e => setEditForm({ ...editForm, rol: e.target.value, restaurante: "" })}
                        style={{ border: `1.5px solid ${PASTEL_ORANGE}`, borderRadius: 8, padding: "5px 10px", fontSize: "0.85rem", outline: "none" }}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                      </select>
                    ) : (
                      <span style={{ background: badge.bg, color: badge.color, padding: "4px 10px", borderRadius: 20, fontSize: "0.76rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <i className={`bi ${badge.icon}`} />
                        {badge.label}
                      </span>
                    )}
                  </td>

                  <td style={{ padding: "12px 14px", color: "#666", fontSize: "0.85rem" }}>
                    {isEditing && editForm.rol === "personal" ? (
                      <select
                        value={editForm.restaurante}
                        onChange={e => setEditForm({ ...editForm, restaurante: e.target.value })}
                        style={{ border: `1.5px solid ${PASTEL_ORANGE}`, borderRadius: 8, padding: "5px 10px", fontSize: "0.85rem", outline: "none", minWidth: 140 }}
                      >
                        <option value="">Seleccionar...</option>
                        {RESTAURANTES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    ) : u.restaurante || <span style={{ color: "#ccc", fontSize: "0.8rem" }}>—</span>}
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    <span style={{
                      background: isActive ? "#d1e7dd" : "#f8d7da",
                      color: isActive ? "#0f5132" : "#842029",
                      padding: "3px 10px", borderRadius: 20, fontSize: "0.74rem", fontWeight: 700,
                    }}>
                      {isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          onClick={() => saveEdit(u.id)}
                          disabled={editForm.rol === "personal" && !editForm.restaurante}
                          style={{ background: PASTEL_ORANGE, color: "white", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                        >
                          <i className="bi bi-check-lg me-1" /> Guardar
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ background: "#f5f5f5", color: "#888", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: "0.78rem", cursor: "pointer" }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button
                          onClick={() => startEdit(u)}
                          style={{ background: "#fff5ee", color: PASTEL_ORANGE, border: `1.5px solid #ffd4b3`, borderRadius: 8, padding: "5px 12px", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
                        >
                          <i className="bi bi-pencil" /> Editar
                        </button>

                          <button
                            onClick={() => setModalEliminar(u)}
                            disabled={isMe}
                            title={isMe ? "No puedes eliminar tu propia cuenta" : "Eliminar cuenta"}
                            style={{
                              background: isMe ? "#f5f5f5" : "#fff0ef",
                              color: isMe ? "#ccc" : "#842029",
                              border: `1.5px solid ${isMe ? "#eee" : "#fecaca"}`,
                              borderRadius: 8,
                              padding: "5px 12px",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              cursor: isMe ? "not-allowed" : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <i className="bi bi-trash" /> Eliminar
                          </button>                        
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={{ padding: "32px", textAlign: "center", color: "#bbb" }}>
            <i className="bi bi-people" style={{ fontSize: "2rem", display: "block", marginBottom: 8 }} />
            No se encontraron usuarios
          </div>
        )}
      </div>

      {/* Leyenda de roles */}
      <div style={{ marginTop: 16, display: "flex", gap: 14, flexWrap: "wrap" }}>
        {[
          { rol: "administrador", desc: "Acceso total a la intranet" },
          { rol: "personal",      desc: "Solo Mesas y Reservas" },
          { rol: "usuario",       desc: "Web pública y Mi Cuenta" },
        ].map(({ rol, desc }) => {
          const b = getRolBadge(rol);
          return (
            <div key={rol} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem", color: "#888" }}>
              <span style={{ background: b.bg, color: b.color, padding: "3px 10px", borderRadius: 20, fontWeight: 700, fontSize: "0.74rem" }}>
                <i className={`bi ${b.icon} me-1`} />
                {b.label}
              </span>
              — {desc}
            </div>
          );
        })}
      </div>

      {/* Ventana Modal: Crear Usuario */}
      {showCreate && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}
        >
          <div style={{ background: "white", borderRadius: 18, padding: "28px 24px", width: "100%", maxWidth: 440, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#1a1a2e" }}>
                <i className="bi bi-person-plus me-2" style={{ color: PASTEL_ORANGE }} />
                Crear Nuevo Usuario
              </h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#aaa" }}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 4 }}>Nombre Completo *</label>
            <input
              type="text"
              placeholder="Ej: María García"
              value={createForm.nombre}
              onChange={e => setCreateForm({ ...createForm, nombre: e.target.value })}
              style={{ ...inputStyle, borderColor: createErrors.nombre ? "#e74c3c" : "#e8ddd3" }}
            />
            {createErrors.nombre && <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "0 0 8px" }}>{createErrors.nombre}</p>}

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 4, marginTop: 8 }}>Correo Electrónico *</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={createForm.email}
              onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
              style={{ ...inputStyle, borderColor: createErrors.email ? "#e74c3c" : "#e8ddd3" }}
            />
            {createErrors.email && <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "0 0 8px" }}>{createErrors.email}</p>}

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 4, marginTop: 8 }}>Contraseña *</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={createForm.password}
              onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
              style={{ ...inputStyle, borderColor: createErrors.password ? "#e74c3c" : "#e8ddd3" }}
            />
            {createErrors.password && <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "0 0 8px" }}>{createErrors.password}</p>}

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 4, marginTop: 8 }}>Rol *</label>
            <select
              value={createForm.rol}
              onChange={e => setCreateForm({ ...createForm, rol: e.target.value, restaurante: "" })}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="usuario">Usuario</option>
              <option value="personal">Personal</option>
              <option value="administrador">Administrador</option>
            </select>

            {createForm.rol === "personal" && (
              <>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#555", display: "block", marginBottom: 4, marginTop: 8 }}>Restaurante Asignado *</label>
                <select
                  value={createForm.restaurante}
                  onChange={e => setCreateForm({ ...createForm, restaurante: e.target.value })}
                  style={{ ...inputStyle, borderColor: createErrors.restaurante ? "#e74c3c" : "#e8ddd3" }}
                >
                  <option value="">Seleccione un restaurante...</option>
                  {RESTAURANTES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {createErrors.restaurante && <p style={{ color: "#e74c3c", fontSize: "0.75rem", margin: "0 0 8px" }}>{createErrors.restaurante}</p>}
              </>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={handleCreate}
                style={{ flex: 1, background: PASTEL_ORANGE, color: "white", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}
              >
                <i className="bi bi-person-plus me-2" /> Crear Usuario
              </button>
              <button
                onClick={() => setShowCreate(false)}
                style={{ flex: 1, background: "#f5f5f5", color: "#888", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEliminar && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  zIndex: 1000,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 16,
                }}
                onClick={(e) => { if (e.target === e.currentTarget) setModalEliminar(null); }}
              >
                <div
                  style={{
                    background: "white",
                    borderRadius: 18,
                    padding: "28px 24px",
                    width: "100%",
                    maxWidth: 400,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>⚠️</div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 800, color: "#1a1a2e" }}>
                    ¿Eliminar esta cuenta?
                  </h3>
                  <p style={{ color: "#666", fontSize: "0.88rem", marginBottom: 4 }}>
                    Vas a eliminar la cuenta de
                  </p>
                  <p style={{ fontWeight: 800, fontSize: "1rem", color: "#1a1a2e", marginBottom: 8 }}>
                    {modalEliminar.nombre}
                  </p>
                  <p style={{ color: "#999", fontSize: "0.82rem", marginBottom: 24 }}>
                    Esta acción no se puede deshacer.
                  </p>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <button
                      onClick={() => setModalEliminar(null)}
                      style={{
                        background: "#f5f5f5",
                        color: "#888",
                        border: "none",
                        borderRadius: 10,
                        padding: "9px 20px",
                        fontWeight: 600,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      style={{
                        background: "#842029",
                        color: "white",
                        border: "none",
                        borderRadius: 10,
                        padding: "9px 20px",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        cursor: "pointer",
                      }}
                    >
                      <i className="bi bi-trash me-2" /> Sí, eliminar
                    </button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
}