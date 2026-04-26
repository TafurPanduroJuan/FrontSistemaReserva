import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css"
export default function Navbar() {
  const { user, logout, isAdmin, isPersonal } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar navbar-expand-lg fixed-top custom-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-tools" /> Comanda
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                <i className="bi bi-house" /> Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/catalog">
                <i className="bi bi-grid" /> Catálogo
              </Link>
            </li>
             <li className="nav-item">
              <Link className="nav-link" to="/form">
                <i className="bi bi-info-circle" /> Formulario
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                <i className="bi bi-info-circle" /> Nosotros
              </Link>
            </li>

            {/* Usuario no autenticado */}
            {!user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right" /> Iniciar sesión
                  </Link>
                </li>
                <li className="nav-item ms-1">
                  <Link
                    className="nav-link btn btn-sm px-3 py-1" id="registro"
                    to="/register"
                    style={{
                      background: "linear-gradient(135deg,#ff9f22,#ff3300)",
                      borderRadius: "20px",
                      
                    }}
                  >
                    Registrarse
                  </Link>
                </li>
              </>
            )}

            {/* Admin o Personal → botón Intranet */}
            {(isAdmin || isPersonal) && (
              <li className="nav-item">
                <Link className="nav-link" to="/intranet">
                  <i className="bi bi-speedometer2" /> Intranet
                </Link>
              </li>
            )}

            {/* Usuario regular → Mi cuenta */}
            {user && !isAdmin && !isPersonal && (
              <li className="nav-item">
                <Link className="nav-link" to="/mi-cuenta">
                  <i className="bi bi-person-circle" /> Mi cuenta
                </Link>
              </li>
            )}

            {/* Menú de usuario autenticado */}
            {user && (
              <li className="nav-item dropdown ms-2">
                <button
                  className="btn btn-sm d-flex align-items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#ff9f22,#ff3300)",
                    color: "white",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    border: "none",
                  }}
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-person-circle" />
                  <span style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.nombre.split(" ")[0]}
                  </span>
                  <i className="bi bi-chevron-down" style={{ fontSize: "0.7rem" }} />
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <span className="dropdown-item-text text-muted small">
                      {user.email}
                    </span>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  {!isAdmin && !isPersonal && (
                    <li>
                      <Link className="dropdown-item" to="/mi-cuenta">
                        <i className="bi bi-person me-2" /> Mi cuenta
                      </Link>
                    </li>
                  )}
                  {(isAdmin || isPersonal) && (
                    <li>
                      <Link className="dropdown-item" to="/intranet">
                        <i className="bi bi-speedometer2 me-2" /> Intranet
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2" /> Cerrar sesión
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}