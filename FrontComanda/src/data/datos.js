
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

{/*Manejo de Categorias*/}
export const categorias = [
  { nombre: "Vegana", img: veganaImg },
  { nombre: "Criolla", img: criollaImg },
  { nombre: "Asiática", img: asiaticaImg },
  { nombre: "Mariscos", img: mariscosImg },
  { nombre: "Postres", img: postresImg },
  { nombre: "Parrilla", img: parrillaImg },

];

{/*Manejo de Datos de Restaurantes*/}

export const restaurantes = [
  {
    nombre: "La Bella Italia",
    lugar: "Centro de Lima",
    hora: "19:30",
    mesas: 5,
    precio: "$$",
    etiqueta: "Hoy",
    img: italianaImg,
  },
  {
    nombre: "Sushi Take",
    lugar: "Miraflores, 2035",
    hora: "20:00",
    mesas: 3,
    precio: "$$$",
    etiqueta: "Hoy",
    img: japonesaImg,
  },
  {
    nombre: "Le Petit Bistro",
    lugar: "La Marina",
    hora: "21:00",
    mesas: 7,
    precio: "$$$$",
    etiqueta: "Mañana",
    img: francesaImg,
  },
  {
    nombre: "Costa Azul",
    lugar: "Santa Beatriz",
    hora: "18:00",
    mesas: 4,
    precio: "$$$",
    etiqueta: "Hoy",
    img: fusionImg,
  },
  {
    nombre: "Taquería El Sabor",
    lugar: "Centro de Lima, 5010",
    hora: "19:00",
    mesas: 8,
    precio: "$",
    etiqueta: "Hoy",
    img: mexicanaImg,
  },
  {
    nombre: "Sabor al Paso",
    lugar: "Miraflores, 345",
    hora: "20:30",
    mesas: 6,
    precio: "$$$$",
    etiqueta: "Mañana",
    img: modernaImg,
  },
];

export const testimonios = [
  {
    estrellas: 5,
    texto: "La experiencia fue excelente, reservé rápido y sin problemas.",
    autor: "María López Murillo",
    rol: "Cliente frecuente"
  },
  {
    estrellas: 4,
    texto: "Tuve una buena experiencia a la hora de reservar.",
    autor: "Carlos Pérez Rolando",
    rol: "Nuevo usuario"
  },
  {
    estrellas: 5,
    texto: "Me encanta poder descubrir restaurantes nuevos.",
    autor: "Ana Torres Paz",
    rol: "Foodie"
  }
];