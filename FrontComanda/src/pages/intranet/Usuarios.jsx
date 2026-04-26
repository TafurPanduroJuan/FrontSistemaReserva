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

export default function Usuarios() {
  const { changeUserRole, user: adminUser } = useAuth();
  const { restaurantes: restaurantesCtx } = useRestaurantes();
  const RESTAURANTES = restaurantesCtx.map(r => r.nombre);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rol: "", restaurante: "" });
  const [savedMsg, setSavedMsg] = useState("");

  // Cargar usuarios del localStorage
  function loadUsers() {
    const stored = localStorage.getItem("comanda_users");
    if (stored) setUsers(JSON.parse(stored));
  }

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(
    (u) =>
      u.nombre.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  function startEdit(u) {
    setEditingId(u.id);
    setEditForm({ rol: u.rol, restaurante: u.restaurante || "" });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({ rol: "", restaurante: "" });
  }

  function saveEdit(userId) {
    const restaurante =
      editForm.rol === "personal" ? editForm.restaurante : null;
    changeUserRole(userId, editForm.rol, restaurante);
    loadUsers(); // re-leer localStorage para actualizar la tabla
    cancelEdit();
    setSavedMsg("✅ Rol actualizado correctamente");
    setTimeout(() => setSavedMsg(""), 3000);
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1a1a2e", margin: 0 }}>
          <i className="bi bi-people me-2" style={{ color: "#ff6b00" }} />
          Gestión de Usuarios
        </h2>
        <p style={{ color: "#888", marginTop: 4, marginBottom: 0 }}>
          Administra roles y permisos de acceso
        </p>
      </div>

      {savedMsg && (
        <div
          style={{
            background: "#f0fff4",
            border: "1px solid #b7f7cb",
            borderRadius: 10,
            padding: "10px 16px",
            marginBottom: 16,
            color: "#1a7a3f",
            fontWeight: 600,
          }}
        >
          {savedMsg}
        </div>
      )}

      {/* Buscador */}
      <div style={{ position: "relative", maxWidth: 360, marginBottom: 20 }}>
        <i
          className="bi bi-search"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#bbb",
          }}
        />
        <input
          type="text"
          placeholder="Buscar usuario..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px 10px 36px",
            border: "1.5px solid #e8ddd3",
            borderRadius: 10,
            fontSize: "0.9rem",
            outline: "none",
            background: "#fdf8f3",
          }}
        />
      </div>

      {/* Tabla */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
          border: "1px solid #f0e8e0",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#fdf8f3", borderBottom: "2px solid #f0e8e0" }}>
              {["Usuario", "Email", "Rol actual", "Restaurante", "Acciones"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#888",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const badge = getRolBadge(u.rol);
              const isEditing = editingId === u.id;
              const isMe = u.id === adminUser?.id;

              return (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: "1px solid #f5ede4",
                    background: isMe ? "#fffdf5" : "white",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isMe) e.currentTarget.style.background = "#fdfaf7";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isMe ? "#fffdf5" : "white";
                  }}
                >
                  {/* Nombre */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, #ff9f22, #ff3300)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "0.9rem",
                          flexShrink: 0,
                        }}
                      >
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: "#1a1a2e", fontSize: "0.9rem" }}>
                          {u.nombre}
                          {isMe && (
                            <span style={{ marginLeft: 6, fontSize: "0.7rem", color: "#ff6b00" }}>
                              (tú)
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
                          Desde {u.fechaRegistro}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "14px 16px", color: "#666", fontSize: "0.88rem" }}>
                    {u.email}
                  </td>

                  {/* Rol */}
                  <td style={{ padding: "14px 16px" }}>
                    {isEditing ? (
                      <select
                        value={editForm.rol}
                        onChange={(e) =>
                          setEditForm({ ...editForm, rol: e.target.value, restaurante: "" })
                        }
                        style={{
                          border: "1.5px solid #ff9f22",
                          borderRadius: 8,
                          padding: "5px 10px",
                          fontSize: "0.85rem",
                          outline: "none",
                        }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <i className={`bi ${badge.icon}`} />
                        {u.rol.charAt(0).toUpperCase() + u.rol.slice(1)}
                      </span>
                    )}
                  </td>

                  {/* Restaurante */}
                  <td style={{ padding: "14px 16px", color: "#666", fontSize: "0.88rem" }}>
                    {isEditing && editForm.rol === "personal" ? (
                      <select
                        value={editForm.restaurante}
                        onChange={(e) =>
                          setEditForm({ ...editForm, restaurante: e.target.value })
                        }
                        style={{
                          border: "1.5px solid #ff9f22",
                          borderRadius: 8,
                          padding: "5px 10px",
                          fontSize: "0.85rem",
                          outline: "none",
                          minWidth: 160,
                        }}
                      >
                        <option value="">Seleccionar...</option>
                        {RESTAURANTES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      u.restaurante || (
                        <span style={{ color: "#ccc", fontSize: "0.8rem" }}>—</span>
                      )
                    )}
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: "14px 16px" }}>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => saveEdit(u.id)}
                          disabled={
                            editForm.rol === "personal" && !editForm.restaurante
                          }
                          style={{
                            background: "linear-gradient(135deg,#ff9f22,#ff3300)",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 14px",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          <i className="bi bi-check-lg me-1" />
                          Guardar
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            background: "#f5f5f5",
                            color: "#888",
                            border: "none",
                            borderRadius: 8,
                            padding: "6px 12px",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(u)}
                        style={{
                          background: "#fff5ee",
                          color: "#ff6b00",
                          border: "1.5px solid #ffd4b3",
                          borderRadius: 8,
                          padding: "6px 14px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <i className="bi bi-pencil" />
                        Cambiar rol
                      </button>
                    )}
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

      {/* Leyenda de roles */}
      <div style={{ marginTop: 20, display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[
          { rol: "administrador", desc: "Acceso total a la intranet" },
          { rol: "personal", desc: "Solo Mesas y Reservas" },
          { rol: "usuario", desc: "Acceso a la web pública y Mi cuenta" },
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
    </div>
  );
}