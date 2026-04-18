import React from "react";
import "../assets/styles/home.css";
import { Link } from "react-router-dom";
import japonesaImg from "../assets/img/rest1.jpg";
import mexicanaImg from "../assets/img/rest2.jpg";
import peruanaImg from "../assets/img/rest5.jpg";
import italianaImg from "../assets/img/rest6.jpg";
import asiaticaImg from "../assets/img/tipo1.jpg";
import mariscosImg from "../assets/img/tipo2.jpg";
import criollaImg from "../assets/img/tipo3.jpg";
import veganaImg from "../assets/img/tipo4.jpg";
import postresImg from "../assets/img/tipo5.jpg";
import francesaImg from "../assets/img/tipo6.jpg"
import fusionImg from "../assets/img/tipo7.jpg";
import modernaImg from "../assets/img/tipo8.jpg";
import parrillaImg from "../assets/img/tipo9.jpg";
import { categorias } from "../data/datos";
import { restaurantes } from "../data/datos";


function Home() {

  return (
    <div className="container-fluid p-0">

      <div className="alert text-center" style={{ marginTop: "80px" }}>
        <h2>¡Bienvenido a Comanda!</h2>
        <h5> Reserva tu restaurante favorito aquí.</h5>
      </div>

      {/*Div General del Carrusel*/}
      <div id="restauranteCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">

          {/* Item 1 */}
          <div className="carousel-item active">
            <img src={italianaImg} className="d-block w-100" alt="Italiana" />
            <div className="card-img-overlay d-flex flex-column justify-content-center bg-dark bg-opacity-50">
              <h5 className="fw-bold">Italiana</h5>
              <h4>La Bella Italia</h4>
              <h5>Auténtica cocina italiana con las mejores pastas artesanales</h5>
              <p>⭐ 4.8 (250+ reseñas)</p>
              <button className="btn btn-danger">Reservar Ahora</button>
            </div>
          </div>

          {/* Item 2 */}
          <div className="carousel-item">
            <img src={japonesaImg} className="d-block w-100" alt="Japonesa" />
            <div className="card-img-overlay d-flex flex-column justify-content-center bg-dark bg-opacity-50">
              <h5 className="fw-bold">Japonesa</h5>
              <h4>Sushi Take</h4>
              <h5>Deliciosos rolls y sashimi preparados al instante</h5>
              <p>⭐ 4.7 (180+ reseñas)</p>
              <button className="btn btn-danger">Reservar Ahora</button>
            </div>
          </div>

          {/* Item 3 */}
          <div className="carousel-item">
            <img src={peruanaImg} className="d-block w-100" alt="Peruana" />
            <div className="card-img-overlay d-flex flex-column justify-content-center bg-dark bg-opacity-50">
              <h5 className="fw-bold">Peruana</h5>
              <h4>Sabor Criollo</h4>
              <h5>Comida típica con sazón casera y auténtica</h5>
              <p>⭐ 4.9 (300+ reseñas)</p>
              <button className="btn btn-danger">Reservar Ahora</button>
            </div>
          </div>
        </div>

        {/* Controles */}
        <button className="carousel-control-prev" type="button" data-bs-target="#restauranteCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#restauranteCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>

      {/* Sección Categorías*/}
      <div className="variedad container-fluid">
        <div id="letraEfecto" className="text-center mb-4">
          <h2>Explora por Tipo de Comida</h2>
          <h5>Descubre una variedad de sabores increíbles</h5>
        </div>
        <div className="row g-4 justify-content-center">
          {categorias.map((cat, index) => (
            <div key={index} className="col-lg-2 col-md-4 col-6 efecto text-center">
              <img
                src={cat.img}
                className="img-fluid rounded-circle mb-2 img-efecto"
                alt={cat.nombre}
                style={{ width: "100%", maxWidth: "150px", aspectRatio: "1/1", objectFit: "cover" }}
              />
              <h5>{cat.nombre}</h5>
            </div>
          ))}
        </div>
      </div>

      {/* Sección Restaurantes - miniCatalogo*/}
      <div className="container my-5">
        <div id="letraEfecto" className="text-center mb-4">
          <h2>Reservas Disponibles</h2>
          <h5>Mesas disponibles para hoy y mañana</h5>
        </div>
        <div className="row g-4">
          {restaurantes.slice(0, 6).map((rest, index) => (
            <div key={index} className="col-lg-4 col-md-6 col-12">
              <div className="card h-100 shadow-sm border-0 ">
                <div className="position-relative ">
                  <span className="badge bg-danger position-absolute m-2" style={{ zIndex: 1 }}>{rest.etiqueta}</span>
                  <img
                    src={rest.img}
                    className="card-img-top"
                    alt={rest.nombre}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                </div>
                <div className="card-body ">
                  <h5 className="card-title  bg-transparent text-dark w-100 text-start">{rest.nombre}</h5>
                  <p className="card-text text-muted">
                    📍 {rest.lugar} <br />
                    🕒 {rest.hora} <br />
                    🍽️ {rest.mesas} mesas <br />
                    <strong className="text-dark">💲 {rest.precio}</strong>
                  </p>
                  <div className="d-flex justify-content-center mt-3">
                    <button className="btn btn-primary w-50 btnReserva">Reserva Ahora</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="d-flex justify-content-center mt-3">
          <Link to="/catalog" className="btn btn-primary w-30 verCatalogo">Explorar más Restaurantes</Link>
        </div>
      </div>
      
      {/*Sección Registro Restaurantes - Envio al apartado Formulario */}
      <div className="container-fluid" id="contacto">
        <div
          className="row align-items-center p-5" id="contenedorInterno"
         
        >
          {/* Columna izquierda */}
          <div className="col-lg-6 col-12">
            <div className="d-flex align-items-center">
             
              <span className="fw-bold w-50 h-100 pb-2 mb-4" id="cuadro"><i className="bi bi-stars fs-4 me-2"></i>Para Restaurantes</span>
            </div>

            <h2 className="mb-3 w-100 text-white">¿Tienes un Restaurante?</h2>
            <p className="mb-4 text-white">
              Únete a Comoda y conecta con miles de comensales.
              <br />
              Aumenta tus reservas y lleva tu negocio al siguiente nivel.
            </p>
            <ul className="list-unstyled mb-4 pt-2 text-white">
              <li><i className="bi bi-check-circle-fill fs-4 me-2"></i>Sistema de reservas automatizado</li>
              <li><i className="bi bi-check-circle-fill fs-4 me-2"></i> Dashboard de gestión completo</li>
              <li><i className="bi bi-check-circle-fill fs-4 me-2"></i> Incrementa tus reservas hasta 40%</li>
              <li><i className="bi bi-check-circle-fill fs-4 me-2"></i> Sin costos de instalación</li>
            </ul>
           
            <Link 
              to="/form" 
              className="btn btn-light fw-bold btnRegistrar"
            >
              Registra tu Restaurante
            </Link>


          </div>

          {/* Columna derecha */}
          <div className="col-lg-6 col-12 mt-4 mt-lg-0">
            <div className="row text-center">
              <div className="col-6 mb-4">
              <div className="p-4 text-white shadow-lg">
                <div className="icono-cuadro mb-3">
                  <i class="bi bi-graph-up-arrow fs-2"></i>
                </div>
                <h2 className="text-center">+40%</h2>
                <p className="mb-0">Más Reservas</p>
              </div>
              </div>
              <div className="col-6 mb-4">
                <div className="p-4  text-white  shadow-lg">
                  <div className="icono-cuadro mb-3">
                  <i className="bi bi-people fs-2"></i>
                </div>
                  <h2 className="text-center">50K+</h2>
                  <p className="mb-0">Usuarios</p>
                </div>
              </div>
              <div className="col-6 mb-4">
                <div className="p-4  text-white  shadow-lg">
                  <div className="icono-cuadro mb-3">
                  <i class="bi bi-award-fill fs-2 "></i>
                </div>
                  <h2 className="text-center">4.8★</h2>
                  <p className="mb-0">Calificación</p>
                </div>
              </div>
              <div className="col-6 mb-4">
                <div className="p-4  text-white  shadow-lg">
                  <div className="icono-cuadro mb-3">
                  <i class="bi bi-heart fs-2"></i>
                </div>
                  <h2 className="text-center">500+</h2>
                  <p className="mb-0">Restaurantes</p>
                </div> 
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
