import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import "../../assets/styles/IntranetLayout.css";

function IntranetLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { path: "/intranet", label: "Dashboard", icon: "bi-speedometer2", exact: true },
    { path: "/intranet/restaurantes", label: "Restaurantes", icon: "bi-shop" },
    { path: "/intranet/restaurantesSolicitudes", label: "Solicitudes Restaurantes", icon: "bi-shop-window" },
    { path: "/intranet/comentarios", label: "Comentarios", icon: "bi-chat-square-text" },
    { path: "/intranet/usuarios", label: "Usuarios", icon: "bi-people" },
    { path: "/intranet/nuevoRestaurante", label: "Nuevo Restaurante", icon: "bi-plus-circle" },
    { path: "/intranet/mesas", label: "Gestión de Mesas", icon: "bi-grid-3x3-gap" },
    { path: "/intranet/reservas", label: "Reservas", icon: "bi-calendar-check" },
  ];

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && path !== "/intranet";
  };

  const isDashboard = location.pathname === "/intranet";

  return (
    <div className="intranet-wrapper">
      {/* Topbar */}
      <header className="intranet-topbar">
        <div className="topbar-left">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`bi ${sidebarOpen ? "bi-layout-sidebar" : "bi-layout-sidebar-reverse"}`}></i>
          </button>
          <span className="topbar-brand">
            <span className="brand-icon">🍽️</span>
            <span className="brand-text">Comanda <span className="brand-sub">Intranet</span></span>
          </span>
        </div>
        <div className="topbar-right">
          <span className="topbar-role-badge">Administrador</span>
          <div className="topbar-avatar">
            <i className="bi bi-person-circle"></i>
          </div>
          <Link to="/" className="topbar-exit-btn">
            <i className="bi bi-box-arrow-left"></i> Salir
          </Link>
        </div>
      </header>

      <div className="intranet-body">
        {/* Sidebar */}
        <aside className={`intranet-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <nav className="sidebar-nav">
            <div className="sidebar-section-label">MENÚ PRINCIPAL</div>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isDashboard && item.exact ? "active" : ""} ${!item.exact && isActive(item.path) ? "active" : ""}`}
              >
                <i className={`bi ${item.icon} sidebar-link-icon`}></i>
                {sidebarOpen && <span className="sidebar-link-label">{item.label}</span>}
              </Link>
            ))}

            <div className="sidebar-divider" />
            <div className="sidebar-section-label">PANEL PERSONAL</div>
            <Link
              to="/intranet/mesas"
              className={`sidebar-link ${isActive("/intranet/mesas") ? "active" : ""}`}
            >
              <i className="bi bi-table sidebar-link-icon"></i>
              {sidebarOpen && <span className="sidebar-link-label">Estado de Mesas</span>}
            </Link>
            <Link
              to="/intranet/reservas"
              className={`sidebar-link ${isActive("/intranet/reservas") ? "active" : ""}`}
            >
              <i className="bi bi-journal-check sidebar-link-icon"></i>
              {sidebarOpen && <span className="sidebar-link-label">Confirmar Reservas</span>}
            </Link>
          </nav>

          <div className="sidebar-footer">
            {sidebarOpen && <span className="sidebar-version">v1.0.0 · Comanda</span>}
          </div>
        </aside>

        {/* Main content */}
        <main className="intranet-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default IntranetLayout;