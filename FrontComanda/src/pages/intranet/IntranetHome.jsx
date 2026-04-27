import React from "react";
import "../../assets/styles/IntranetHome.css";
import { useRestaurantes } from "../../context/RestaurantesContext";
import { useComentarios } from "../../context/Comentarioscontext";

const tipoIcono = {
  comentario: "bi-chat-left-text",
  reclamo: "bi-exclamation-triangle",
  experiencia: "bi-star",
};
const tipoColor = {
  comentario: "#3b82f6",
  reclamo: "#ef4444",
  experiencia: "#f59e0b",
};

function IntranetHome() {
  const { solicitudes, aceptarSolicitud, rechazarSolicitud } = useRestaurantes();
  const { comentarios } = useComentarios();

  // Leer usuarios reales desde localStorage (igual que AuthContext)
  const usuarios = (() => {
    try {
      const raw = localStorage.getItem("comanda_users");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  })();

  const reclamos = comentarios.filter((c) => c.tipo === "reclamo");

  const totales = {
    pendientes: solicitudes.filter((s) => s.estado === "pendiente").length,
    comentarios: comentarios.length,
    reclamos: reclamos.length,
    usuarios: usuarios.length,
  };

  // Últimas 5 solicitudes (las más recientes primero)
  const solicitudesRecientes = [...solicitudes]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  // Últimos 4 usuarios registrados (los más recientes primero)
  const usuariosRecientes = [...usuarios]
    .sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
    .slice(0, 4);

  // Últimos 6 comentarios (más recientes primero)
  const comentariosRecientes = [...comentarios]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 6);

  return (
    <div>
      {/* Page Header */}
      <div className="intra-page-header">
        <div className="intra-page-title">
          <i className="bi bi-speedometer2"></i>
          Dashboard
        </div>
        <span className="text-muted" style={{ fontSize: "0.85rem" }}>
          <i className="bi bi-calendar3 me-1"></i>
          {new Date().toLocaleDateString("es-PE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="kpi-card kpi-orange">
            <div className="kpi-icon"><i className="bi bi-shop-window"></i></div>
            <div className="kpi-value">{totales.pendientes}</div>
            <div className="kpi-label">Solicitudes pendientes</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="kpi-card kpi-blue">
            <div className="kpi-icon"><i className="bi bi-chat-square-text"></i></div>
            <div className="kpi-value">{totales.comentarios}</div>
            <div className="kpi-label">Mensajes recibidos</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="kpi-card kpi-red">
            <div className="kpi-icon"><i className="bi bi-exclamation-triangle"></i></div>
            <div className="kpi-value">{totales.reclamos}</div>
            <div className="kpi-label">Reclamos abiertos</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="kpi-card kpi-green">
            <div className="kpi-icon"><i className="bi bi-people"></i></div>
            <div className="kpi-value">{totales.usuarios}</div>
            <div className="kpi-label">Usuarios registrados</div>
          </div>
        </div>
      </div>

      <div className="row g-4">

        {/* === SOLICITUDES RESTAURANTES === */}
        <div className="col-12 col-xl-7">
          <div className="intra-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="section-title">
                <i className="bi bi-shop-window me-2" style={{ color: "var(--brand-mid)" }}></i>
                Solicitudes de nuevos restaurantes
              </h6>
              <span className="status-badge badge-pendiente">
                {totales.pendientes} pendientes
              </span>
            </div>

            {solicitudesRecientes.length === 0 ? (
              <p className="text-muted text-center py-3">No hay solicitudes registradas.</p>
            ) : (
              solicitudesRecientes.map((s) => (
                <div key={s.id} className={`solicitud-item ${s.estado !== "pendiente" ? "procesada" : ""}`}>
                  <div className="solicitud-info">
                    <div className="solicitud-nombre">{s.nombre}</div>
                    <div className="solicitud-meta">
                      <span><i className="bi bi-person me-1"></i>{s.propietario}</span>
                      <span><i className="bi bi-tag me-1"></i>{s.tipo}</span>
                      <span><i className="bi bi-geo-alt me-1"></i>{s.ciudad}</span>
                      <span><i className="bi bi-calendar3 me-1"></i>{s.fecha}</span>
                    </div>
                  </div>
                  <div className="solicitud-actions">
                    {s.estado === "pendiente" ? (
                      <>
                        <button className="btn-accion btn-aceptar" onClick={() => aceptarSolicitud(s.id)}>
                          <i className="bi bi-check-lg"></i> Aceptar
                        </button>
                        <button className="btn-accion btn-rechazar" onClick={() => rechazarSolicitud(s.id)}>
                          <i className="bi bi-x-lg"></i> Rechazar
                        </button>
                      </>
                    ) : (
                      <span className={`status-badge ${s.estado === "aceptado" ? "badge-aceptado" : "badge-rechazado"}`}>
                        <i className={`bi ${s.estado === "aceptado" ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
                        {s.estado.charAt(0).toUpperCase() + s.estado.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {solicitudes.length > 5 && (
              <div className="text-center mt-3">
                <a href="/intranet/solicitudes" className="btn-brand btn btn-sm">
                  <i className="bi bi-arrow-right-circle me-1"></i>Ver todas ({solicitudes.length})
                </a>
              </div>
            )}
          </div>
        </div>

        {/* === COMENTARIOS === */}
        <div className="col-12 col-xl-5">
          <div className="intra-card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="section-title">
                <i className="bi bi-chat-square-text me-2" style={{ color: "#3b82f6" }}></i>
                Mensajes de Contáctanos
              </h6>
              <span className="status-badge badge-rechazado">
                {totales.reclamos} reclamo(s)
              </span>
            </div>
            <div className="comentarios-list">
              {comentariosRecientes.length === 0 ? (
                <p className="text-muted text-center py-3">No hay mensajes aún.</p>
              ) : (
                comentariosRecientes.map((c) => (
                  <div key={c.id} className="comentario-item">
                    <div className="comentario-header">
                      <span className="comentario-tipo" style={{ color: tipoColor[c.tipo] || "#6b7280" }}>
                        <i className={`bi ${tipoIcono[c.tipo] || "bi-envelope"} me-1`}></i>
                        {c.tipo.charAt(0).toUpperCase() + c.tipo.slice(1)}
                      </span>
                      <span className="comentario-fecha">{c.fecha}</span>
                    </div>
                    <div className="comentario-usuario">
                      <i className="bi bi-person-circle me-1"></i>{c.usuario}
                      {c.restaurante && (
                        <span className="comentario-rest ms-2">
                          <i className="bi bi-shop me-1"></i>{c.restaurante}
                        </span>
                      )}
                    </div>
                    <p className="comentario-mensaje">"{c.mensaje}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* === USUARIOS (resumen) === */}
        <div className="col-12">
          <div className="intra-card p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="section-title">
                <i className="bi bi-people me-2" style={{ color: "var(--brand-mid)" }}></i>
                Usuarios registrados (últimos)
              </h6>
              <a href="/intranet/usuarios" className="btn-brand btn btn-sm">
                <i className="bi bi-arrow-right-circle me-1"></i>Ver todos
              </a>
            </div>
            <div className="table-responsive">
              <table className="intra-table">
                <thead>
                  <tr><th>#</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Registrado</th></tr>
                </thead>
                <tbody>
                  {usuariosRecientes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-3">No hay usuarios.</td>
                    </tr>
                  ) : (
                    usuariosRecientes.map((u, i) => (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td><i className="bi bi-person-circle me-2 text-muted"></i>{u.nombre}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`status-badge ${
                            u.rol === "administrador" ? "badge-admin" :
                            u.rol === "personal" ? "badge-personal" : "badge-usuario"
                          }`}>
                            {u.rol}
                          </span>
                        </td>
                        <td>{u.fechaRegistro}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default IntranetHome;
