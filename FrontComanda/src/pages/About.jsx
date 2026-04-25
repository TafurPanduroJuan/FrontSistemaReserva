import { Link } from "react-router-dom";
import "../assets/styles/about.css";

function About() {
  const valores = [
    { icon: "🤝", titulo: "Confianza", desc: "Construimos relaciones sólidas con restaurantes y comensales basadas en transparencia y honestidad." },
    { icon: "⚡", titulo: "Rapidez", desc: "Reserva en segundos. Nuestro sistema optimizado garantiza una experiencia ágil sin complicaciones." },
    { icon: "🌟", titulo: "Calidad", desc: "Solo trabajamos con los mejores restaurantes, verificados y evaluados por nuestra comunidad." },
    { icon: "🔒", titulo: "Seguridad", desc: "Tus datos y reservas están protegidos con los más altos estándares de seguridad digital." },
    { icon: "🌍", titulo: "Comunidad", desc: "Somos una familia de comensales y restaurantes que comparten la pasión por la gastronomía." },
    { icon: "💡", titulo: "Innovación", desc: "Reinventamos constantemente la experiencia de reservar para hacerla más simple y placentera." },
  ];

  const equipo = [
    { iniciales: "AM", nombre: "Ana Martínez", rol: "CEO & Fundadora", desc: "Apasionada por la gastronomía y la tecnología. 10 años liderando startups en el sector foodtech." },
    { iniciales: "CR", nombre: "Carlos Ramos", rol: "CTO", desc: "Arquitecto de software con experiencia en plataformas de alto tráfico y sistemas de reservas." },
    { iniciales: "LP", nombre: "Lucía Pérez", rol: "Head of Design", desc: "Diseñadora UX especializada en crear experiencias digitales memorables y accesibles." },
    { iniciales: "MG", nombre: "Miguel García", rol: "Head of Growth", desc: "Experto en marketing digital y partnerships con los mejores restaurantes de la región." },
  ];

  return (
    <div className="container-fluid p-0">

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-hero-badge">Sobre Nosotros</span>
          <h1>Conectamos sabores <br />con <span>experiencias</span></h1>
          <p>Somos Comanda, la plataforma peruana que transforma la manera en que las personas descubren y reservan los mejores restaurantes.</p>
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="about-mv-section">
        <div className="container">
          <div className="row g-4 justify-content-center">
            <div className="col-lg-5 col-md-6">
              <div className="about-mv-card mision shadow-sm">
                <div className="about-mv-icon orange">🎯</div>
                <h3>Nuestra Misión</h3>
                <p>Hacer que cada reserva sea una experiencia sin fricciones. Conectamos a comensales con restaurantes excepcionales, simplificando el proceso y garantizando que cada visita comience con el pie derecho desde el primer clic.</p>
              </div>
            </div>
            <div className="col-lg-5 col-md-6">
              <div className="about-mv-card vision shadow-sm">
                <div className="about-mv-icon yellow">🚀</div>
                <h3>Nuestra Visión</h3>
                <p>Convertirnos en la plataforma de referencia gastronómica en Latinoamérica para 2028, impulsando el crecimiento de miles de restaurantes y siendo la primera opción de millones de comensales que buscan vivir momentos inolvidables.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="about-stats-section">
        <div className="container">
          <div className="row g-4">
            <div className="col-6 col-md-3">
              <div className="about-stat-item">
                <span className="about-stat-number">500+</span>
                <span className="about-stat-label">Restaurantes activos</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="about-stat-item">
                <span className="about-stat-number">50K+</span>
                <span className="about-stat-label">Usuarios registrados</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="about-stat-item">
                <span className="about-stat-number">4.8★</span>
                <span className="about-stat-label">Calificación promedio</span>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="about-stat-item">
                <span className="about-stat-number">98%</span>
                <span className="about-stat-label">Satisfacción del cliente</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALORES */}
      <section className="about-values-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="about-section-title">Lo que nos <span>define</span></h2>
            <p className="about-section-subtitle">Nuestros valores son el motor que guía cada decisión que tomamos para servir mejor a nuestra comunidad.</p>
          </div>
          <div className="row g-4">
            {valores.map((val, i) => (
              <div key={i} className="col-lg-4 col-md-6">
                <div className="about-value-item">
                  <div className="about-value-icon">{val.icon}</div>
                  <h5>{val.titulo}</h5>
                  <p>{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EQUIPO */}
      <section className="about-team-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="about-section-title">Conoce al <span>equipo</span></h2>
            <p className="about-section-subtitle">Personas apasionadas por la tecnología y la gastronomía, trabajando juntas para crear algo extraordinario.</p>
          </div>
          <div className="row g-4 justify-content-center">
            {equipo.map((miembro, i) => (
              <div key={i} className="col-lg-3 col-md-6">
                <div className="about-team-card">
                  <div className="about-team-avatar">{miembro.iniciales}</div>
                  <h5>{miembro.nombre}</h5>
                  <span className="about-team-role">{miembro.rol}</span>
                  <p>{miembro.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta-section">
        <h2>¿Listo para reservar tu próxima experiencia?</h2>
        <p>Únete a miles de comensales que ya disfrutan de la mejor gastronomía con solo un clic.</p>
        <Link to="/catalog" className="about-btn-white">Ver Restaurantes</Link>
        <Link to="/form" className="about-btn-outline">Registra tu Local</Link>
      </section>
    </div>
  );
}

export default About;