import React, { useState } from "react";

const initialUsuarios = [
  { id: 1, nombre: "Admin Principal", email: "admin@comanda.pe", rol: "administrador", telefono: "999000001", fecha: "2026-01-10", activo: true },
  { id: 2, nombre: "Carlos Mamani", email: "carlos@gmail.com", rol: "usuario", telefono: "987654321", fecha: "2026-03-15", activo: true },
  { id: 3, nombre: "Ana Takahashi", email: "ana@gmail.com", rol: "usuario", telefono: "998877665", fecha: "2026-03-20", activo: true },
  { id: 4, nombre: "Staff La Bella Italia", email: "staff@labellaitalia.pe", rol: "personal", telefono: "912345678", fecha: "2026-02-01", activo: true },
  { id: 5, nombre: "María López", email: "maria@gmail.com", rol: "usuario", telefono: "945612378", fecha: "2026-04-10", activo: true },
  { id: 6, nombre: "Roberto Silva", email: "roberto@gmail.com", rol: "usuario", telefono: "976543210", fecha: "2026-04-12", activo: false },
  { id: 7, nombre: "Staff El Huarike", email: "staff@huarike.pe", rol: "personal", telefono: "934567891", fecha: "2026-02-15", activo: true },
  { id: 8, nombre: "Lucía Fernández", email: "lucia@gmail.com", rol: "usuario", telefono: "956781234", fecha: "2026-04-18", activo: true },
  { id: 9, nombre: "Diego Quispe", email: "diego@gmail.com", rol: "usuario", telefono: "923456781", fecha: "2026-04-19", activo: true },
  { id: 10, nombre: "Sub Admin", email: "subadmin@comanda.pe", rol: "administrador", telefono: "999000002", fecha: "2026-01-15", activo: true },
];

const rolConfig = {
  administrador: { label: "Administrador", icon: "bi-shield-fill", cls: "badge-admin" },
  usuario:       { label: "Usuario",       icon: "bi-person-fill", cls: "badge-usuario" },
  personal:      { label: "Personal",      icon: "bi-person-badge-fill", cls: "badge-personal" },
};

function Usuarios() {
  const [listaUsuarios, setListaUsuarios] = useState(initialUsuarios);
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState("todos");
  
  // Estados para la modal
  const [showModal, setShowModal] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Funciones
  const eliminarUsuario = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario permanentemente?")) {
      setListaUsuarios(listaUsuarios.filter(u => u.id !== id));
    }
  };

  const abrirEditar = (usuario) => {
    setUsuarioEditando({ ...usuario });
    setShowModal(true);
  };

  const guardarCambios = (e) => {
    e.preventDefault();
    setListaUsuarios(listaUsuarios.map(u => 
      u.id === usuarioEditando.id ? usuarioEditando : u
    ));
    setShowModal(false);
  };

  const filtrados = listaUsuarios.filter(u => {
    const matchBusq = u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                      u.email.toLowerCase().includes(busqueda.toLowerCase());
    const matchRol = filtroRol === "todos" || u.rol === filtroRol;
    return matchBusq && matchRol;
  });

  const conteos = { 
    todos: listaUsuarios.length, 
    ...Object.fromEntries(["administrador", "usuario", "personal"].map(r => [r, listaUsuarios.filter(u => u.rol === r).length])) 
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", padding: "20px" }}>
      <div className="intra-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div className="intra-page-title" style={{ fontSize: "1.5rem", fontWeight: "700", color: "#1a1a2e" }}>
          <i className="bi bi-people" style={{ marginRight: "10px", color: "#ff6b00" }}></i>
          Usuarios Registrados
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4" style={{ display: "flex", gap: "15px" }}>
        {[
          { rol: "administrador", icon: "bi-shield-fill", bg: "linear-gradient(135deg,#ff9f22,#ff3300)", label: "Administradores" },
          { rol: "personal", icon: "bi-person-badge-fill", bg: "linear-gradient(135deg,#60a5fa,#1d4ed8)", label: "Personal" },
          { rol: "usuario", icon: "bi-person-fill", bg: "linear-gradient(135deg,#94a3b8,#475569)", label: "Usuarios" },
        ].map(r => (
          <div style={{ flex: 1, background: r.bg, borderRadius: 12, padding: "14px 18px", color: "white", display: "flex", alignItems: "center", gap: 12 }} key={r.rol}>
            <i className={`bi ${r.icon}`} style={{ fontSize: "1.6rem" }}></i>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1 }}>{conteos[r.rol]}</div>
              <div style={{ fontSize: "0.78rem", opacity: 0.85 }}>{r.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="d-flex gap-3 mb-4 flex-wrap align-items-center" style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
        <input 
          type="text" 
          placeholder="Buscar por nombre o email..." 
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)} 
          style={{ padding: "10px 15px", borderRadius: "10px", border: "1px solid #e8e0d8", flex: "1" }} 
        />
        <div style={{ display: "flex", gap: "8px" }}>
          {["todos", "administrador", "personal", "usuario"].map(r => (
            <button 
              key={r} 
              onClick={() => setFiltroRol(r)} 
              style={{ 
                padding: "8px 15px", borderRadius: "20px", 
                border: `1px solid ${filtroRol === r ? "#ff6b00" : "#e8e0d8"}`, 
                background: filtroRol === r ? "#ff6b00" : "white", 
                color: filtroRol === r ? "white" : "#555", 
                cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" 
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)} ({conteos[r] ?? listaUsuarios.length})
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="intra-card" style={{ background: "white", borderRadius: "15px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead style={{ background: "#f8f9fa", borderBottom: "2px solid #eee" }}>
              <tr>
                <th style={{ padding: "15px" }}>#</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "15px", color: "#888" }}>{i + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem" }}>{u.nombre.charAt(0)}</div>
                      <span style={{ fontWeight: "600" }}>{u.nombre}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>{u.telefono}</td>
                  <td>
                    <span style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "0.75rem", background: "#f0f0f0", fontWeight: "600" }}>{rolConfig[u.rol].label}</span>
                  </td>
                  <td>
                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "700", background: u.activo ? "#d1fae5" : "#fee2e2", color: u.activo ? "#065f46" : "#991b1b" }}>
                      {u.activo ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => abrirEditar(u)} style={{ border: "none", background: "#eff6ff", color: "#1d4ed8", padding: "6px 10px", borderRadius: "8px", marginRight: "5px", cursor: "pointer" }}><i className="bi bi-pencil"></i></button>
                    <button onClick={() => eliminarUsuario(u.id)} style={{ border: "none", background: "#fef2f2", color: "#dc2626", padding: "6px 10px", borderRadius: "8px", cursor: "pointer" }}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE EDICIÓN */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", width: "450px", borderRadius: "20px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "20px", background: "#f8f9fa", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h5 style={{ margin: 0, fontWeight: "700" }}>Editar Información</h5>
              <button onClick={() => setShowModal(false)} style={{ border: "none", background: "none", fontSize: "1.2rem", cursor: "pointer" }}>&times;</button>
            </div>
            <form onSubmit={guardarCambios} style={{ padding: "25px" }}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "5px", color: "#666" }}>NOMBRE COMPLETO</label>
                <input 
                  type="text" 
                  style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #ddd", boxSizing: "border-box" }}
                  value={usuarioEditando.nombre} 
                  onChange={e => setUsuarioEditando({...usuarioEditando, nombre: e.target.value})} 
                  required 
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "5px", color: "#666" }}>CORREO ELECTRÓNICO</label>
                <input 
                  type="email" 
                  style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #ddd", boxSizing: "border-box" }}
                  value={usuarioEditando.email} 
                  onChange={e => setUsuarioEditando({...usuarioEditando, email: e.target.value})} 
                  required 
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "5px", color: "#666" }}>TELÉFONO</label>
                <input 
                  type="text" 
                  style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #ddd", boxSizing: "border-box" }}
                  value={usuarioEditando.telefono} 
                  onChange={e => setUsuarioEditando({...usuarioEditando, telefono: e.target.value})} 
                />
              </div>

              <div style={{ display: "flex", gap: "15px", marginBottom: "20px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "5px", color: "#666" }}>ROL</label>
                  <select 
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #ddd" }}
                    value={usuarioEditando.rol}
                    onChange={e => setUsuarioEditando({...usuarioEditando, rol: e.target.value})}
                  >
                    <option value="administrador">Administrador</option>
                    <option value="personal">Personal</option>
                    <option value="usuario">Usuario</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", marginBottom: "5px", color: "#666" }}>ESTADO</label>
                  <select 
                    style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #ddd" }}
                    value={usuarioEditando.activo}
                    onChange={e => setUsuarioEditando({...usuarioEditando, activo: e.target.value === "true"})}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              <div style={{ background: "#fff3e0", padding: "10px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.75rem", color: "#e65100" }}>
                <i className="bi bi-info-circle me-2"></i>
                ID: {usuarioEditando.id} | Registrado el: {usuarioEditando.fecha}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #ddd", background: "white", cursor: "pointer", fontWeight: "600" }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#ff6b00", color: "white", cursor: "pointer", fontWeight: "600" }}
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;