import { useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../assets/styles/IntranetLayout.css";

// ─── Menú completo del administrador ─────────────────────────────────────────
const ADMIN_NAV = [
  {
    section: "MENÚ PRINCIPAL",
    items: [
      { path: "/intranet", label: "Dashboard", icon: "bi-speedometer2", exact: true },
      { path: "/intranet/restaurantes", label: "Restaurantes", icon: "bi-shop" },
      { path: "/intranet/restaurantesSolicitudes", label: "Solicitudes", icon: "bi-shop-window" },
      { path: "/intranet/comentarios", label: "Comentarios", icon: "bi-chat-square-text" },
      { path: "/intranet/usuarios", label: "Usuarios", icon: "bi-people" },
      { path: "/intranet/nuevoRestaurante", label: "Nuevo Restaurante", icon: "bi-plus-circle" },
    ],
  },
  {
    section: "OPERACIONES",
    items: [
      { path: "/intranet/mesas", label: "Gestión de Mesas", icon: "bi-grid-3x3-gap" },
      { path: "/intranet/reservas", label: "Reservas", icon: "bi-calendar-check" },
    ],
  },
];

// ─── Menú restringido para personal de restaurante ───────────────────────────
const PERSONAL_NAV = [
  {
    section: "MI RESTAURANTE",
    items: [
      { path: "/intranet/mesas", label: "Gestión de Mesas", icon: "bi-grid-3x3-gap" },
      { path: "/intranet/reservas", label: "Reservas", icon: "bi-calendar-check" },
    ],
  },
];

export default function IntranetLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin, isPersonal } = useAuth();

  const navGroups = isAdmin ? ADMIN_NAV : PERSONAL_NAV;

  const isActive = (path, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path) && path !== "/intranet";
  };

  const isDashboard = location.pathname === "/intranet";

  const rolLabel = isAdmin ? "Administrador" : `Personal · ${user?.restaurante || ""}`;
  const rolIcon = isAdmin ? "bi-shield-check" : "bi-person-badge";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="intranet-wrapper">
      {/* ── Topbar ─────────────────────────────────────────────────────────── */}
      <header className="intranet-topbar">
        <div className="topbar-left">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className={`bi ${sidebarOpen ? "bi-layout-sidebar" : "bi-layout-sidebar-reverse"}`} />
          </button>
          <span className="topbar-brand">
            <span className="brand-icon">🍽️</span>
            <span className="brand-text">
              Comanda <span className="brand-sub">Intranet</span>
            </span>
          </span>
        </div>

        <div className="topbar-right">
          <span className="topbar-role-badge">
            <i className={`bi ${rolIcon} me-1`} />
            {rolLabel}
          </span>
          <div className="topbar-avatar" title={user?.nombre}>
            <i className="bi bi-person-circle" />
          </div>
          <button className="topbar-exit-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left" /> Salir
          </button>
        </div>
      </header>

      <div className="intranet-body">
        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className={`intranet-sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <nav className="sidebar-nav">
            {navGroups.map((group) => (
              <div key={group.section}>
                {sidebarOpen && (
                  <div className="sidebar-section-label">{group.section}</div>
                )}
                {group.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`sidebar-link ${
                      (item.exact ? isDashboard : isActive(item.path))
                        ? "active"
                        : ""
                    }`}
                  >
                    <i className={`bi ${item.icon} sidebar-link-icon`} />
                    {sidebarOpen && (
                      <span className="sidebar-link-label">{item.label}</span>
                    )}
                  </Link>
                ))}
                <div className="sidebar-divider" />
              </div>
            ))}
          </nav>

          {/* Info usuario en sidebar */}
          {sidebarOpen && (
            <div className="sidebar-user-info">
              <div className="sidebar-user-avatar">
                <i className="bi bi-person-circle" />
              </div>
              <div className="sidebar-user-details">
                <span className="sidebar-user-name">{user?.nombre}</span>
                <span className="sidebar-user-email">{user?.email}</span>
              </div>
            </div>
          )}

          <div className="sidebar-footer">
            {sidebarOpen && <span className="sidebar-version">v1.0.0 · Comanda</span>}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="intranet-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}