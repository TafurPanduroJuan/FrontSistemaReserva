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

/*Manejo de Categorias*/
export const categorias = [
  { nombre: "Vegana", img: veganaImg },
  { nombre: "Criolla", img: criollaImg },
  { nombre: "Asiática", img: asiaticaImg },
  { nombre: "Mariscos", img: mariscosImg },
  { nombre: "Postres", img: postresImg },
  { nombre: "Parrilla", img: parrillaImg },
];

/*Manejo de Datos de Restaurantes - Expandido para el Catálogo*/
export const restaurantes = [
  {
    nombre: "La Bella Italia",
    lugar: "Centro de Lima",
    hora: "19:30",
    mesas: 5,
    precio: "$$",
    etiqueta: "Hoy",
    tipo: "Italiana",
    img: italianaImg,
    rating: 4.8,
    reseñas: 250,
  },
  {
    nombre: "Sushi Take",
    lugar: "Miraflores, 2035",
    hora: "20:00",
    mesas: 3,
    precio: "$$$",
    etiqueta: "Hoy",
    tipo: "Japonesa",
    img: japonesaImg,
    rating: 4.7,
    reseñas: 180,
  },
  {
    nombre: "Le Petit Bistro",
    lugar: "La Marina",
    hora: "21:00",
    mesas: 7,
    precio: "$$$$",
    etiqueta: "Mañana",
    tipo: "Francesa",
    img: francesaImg,
    rating: 4.9,
    reseñas: 320,
  },
  {
    nombre: "Costa Azul",
    lugar: "Santa Beatriz",
    hora: "18:00",
    mesas: 4,
    precio: "$$$",
    etiqueta: "Hoy",
    tipo: "Mariscos",
    img: fusionImg,
    rating: 4.6,
    reseñas: 140,
  },
  {
    nombre: "Taquería El Sabor",
    lugar: "Centro de Lima, 5010",
    hora: "19:00",
    mesas: 8,
    precio: "$",
    etiqueta: "Hoy",
    tipo: "Mexicana",
    img: mexicanaImg,
    rating: 4.5,
    reseñas: 210,
  },
  {
    nombre: "Sabor al Paso",
    lugar: "Miraflores, 345",
    hora: "20:30",
    mesas: 6,
    precio: "$$$$",
    etiqueta: "Mañana",
    tipo: "Moderna",
    img: modernaImg,
    rating: 4.7,
    reseñas: 95,
  },
  {
    nombre: "El Rincón Criollo",
    lugar: "Barranco, 120",
    hora: "12:30",
    mesas: 10,
    precio: "$$",
    etiqueta: "Hoy",
    tipo: "Criolla",
    img: criollaImg,
    rating: 4.9,
    reseñas: 410,
  },
  {
    nombre: "Sabor Criollo",
    lugar: "Surquillo, 890",
    hora: "13:00",
    mesas: 5,
    precio: "$",
    etiqueta: "Hoy",
    tipo: "Peruana",
    img: peruanaImg,
    rating: 4.9,
    reseñas: 300,
  },
  {
    nombre: "Green Life Bistro",
    lugar: "San Borja, 44",
    hora: "12:00",
    mesas: 6,
    precio: "$$",
    etiqueta: "Hoy",
    tipo: "Vegana",
    img: veganaImg,
    rating: 4.6,
    reseñas: 170,
  },
  {
    nombre: "La Parrilla del Sur",
    lugar: "Chorrillos, 780",
    hora: "13:00",
    mesas: 9,
    precio: "$$$",
    etiqueta: "Mañana",
    tipo: "Parrilla",
    img: parrillaImg,
    rating: 4.8,
    reseñas: 280,
  },
  {
    nombre: "Pho & Más",
    lugar: "Jesús María, 230",
    hora: "19:00",
    mesas: 4,
    precio: "$$",
    etiqueta: "Hoy",
    tipo: "Asiática",
    img: asiaticaImg,
    rating: 4.7,
    reseñas: 130,
  },
  {
    nombre: "La Marisquería",
    lugar: "La Punta, Callao",
    hora: "12:30",
    mesas: 12,
    precio: "$$$",
    etiqueta: "Hoy",
    tipo: "Mariscos",
    img: mariscosImg,
    rating: 4.8,
    reseñas: 360,
  },
  {
    nombre: "Sweet Corner",
    lugar: "San Isidro, 15",
    hora: "10:00",
    mesas: 3,
    precio: "$",
    etiqueta: "Hoy",
    tipo: "Postres",
    img: postresImg,
    rating: 4.5,
    reseñas: 90,
  },
  {
    nombre: "Fusion 9",
    lugar: "Miraflores, 900",
    hora: "20:00",
    mesas: 5,
    precio: "$$$$",
    etiqueta: "Mañana",
    tipo: "Moderna",
    img: fusionImg,
    rating: 4.9,
    reseñas: 220,
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