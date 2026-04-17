import { Link } from "react-router-dom";
function Footer() {
    return (
        <footer className="bg-dark text-white pt-5 pb-3">
            <div className="container-fluid">
                <div className="row">
                    {/* Logo y descripción */}
                    <div className="col-md-4 mb-4">
                        <div className="d-flex align-items-center mb-2">
                            <div className="bg-warning rounded-circle p-2 me-2">
                                 <i className="bi bi-tools"></i>
                            </div>
                            <h5 className="text-warning mb-0">Comanda</h5>
                        </div>
                        <p>
                            La plataforma líder en reservas de restaurantes. Encuentra y
                            reserva los mejores lugares para disfrutar.
                        </p>
                    </div>

                    {/* Enlaces */}
                    <div className="col-md-2 mb-4">
                        <h6 className="text-warning">Enlaces Rápidos</h6>
                        <ul className="list-unstyled">
                            <li>
                                <a href="/" className="text-white text-decoration-none">
                                    Inicio
                                </a>
                            </li>
                            <li>
                                <a href="/catalog" className="text-white text-decoration-none">
                                    Catálogo
                                </a>
                            </li>
                            <li>
                                <a href="/form" className="text-white text-decoration-none">
                                    Contáctanos
                                </a>
                            </li>
                            <li>
                                <a href="/about" className="text-white text-decoration-none">
                                    Nosotros
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div className="col-md-3 mb-4">
                        <h6 className="text-warning">Contacto</h6>
                        <p>📞 +51 992 471 553</p>
                        <p>✉️ ComandaCorp@gmail.com</p>
                        <p>📍 Av. Aviación 455, Grupo Comanda</p>
                    </div>

                    {/* Síguenos */}
                    <div className="col-md-3 mb-4">
                        <h6 className="text-warning">Síguenos</h6>
                        <div className="d-flex gap-3 mb-3">
                            <a href="#" className="text-white">
                                <i className="bi bi-facebook"></i>
                            </a>
                            <a href="#" className="text-white">
                                <i className="bi bi-instagram"></i>
                            </a>
                            <a href="#" className="text-white">
                                <i className="bi bi-twitter"></i>
                            </a>
                        </div>
                        <form className="d-flex">
                            <input
                                type="email"
                                className="form-control me-2"
                                placeholder="Tu email"
                            />
                            <button className="btn btn-danger">Enviar</button>
                        </form>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center border-top border-secondary pt-3">
                    <small>
                        © 2026 Comanda. Todos los derechos reservados. |{" "}
                        <a href="/terminos" className="text-white text-decoration-none mx-4">
                            Términos de Servicio
                        </a>{" "}
                        |{" "}
                        <a href="/privacidad" className="text-white text-decoration-none mx-4">
                            Política de Privacidad
                        </a>{" "}
                        |{" "}
                        <a href="/cookies" className="text-white text-decoration-none mx-4">
                            Cookies
                        </a>
                    </small>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
