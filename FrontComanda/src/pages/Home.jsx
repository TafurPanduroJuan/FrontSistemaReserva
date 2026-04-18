import React from "react";
import  "../assets/styles/Carrusel.css"
import italianaImg from "../assets/img/rest6.jpg";
import japonesaImg from "../assets/img/rest1.jpg";
import peruanaImg from "../assets/img/rest5.jpg";

function Home() {
  return (
  <div className="container-fluid">
    {/*Div mensaje*/}
    <div className="alert text-center">
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
    </div>
  );
}

export default Home;
