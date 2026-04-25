import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg fixed-top custom-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-tools"></i> Comanda
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link active" to="/">
                <i className="bi bi-house"></i> Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/catalog">
                <i className="bi bi-grid"></i> Catálogo
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/form">
                <i className="bi bi-clipboard"></i> Formulario
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/intranet">
                <i className="bi bi-info-circle"></i> Acerca de
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/perfil">
                <i className="bi bi-person"></i> Perfil
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
