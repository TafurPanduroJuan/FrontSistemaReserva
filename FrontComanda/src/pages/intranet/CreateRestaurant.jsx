import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurants } from "../../context/RestaurantsContext";
 
// ── Opciones reutilizadas del formulario público ──────────────────────────────
const tiposComida = [
  "Criolla", "Italiana", "Japonesa", "Mariscos", "Vegana",
  "Parrilla", "Mexicana", "Peruana", "Francesa", "Fusión",
  "Moderna", "Asiática", "Postres",
];
 
const sugerenciasDistritos = [
  "Miraflores", "San Isidro", "Barranco", "Surco", "La Molina",
  "Chorrillos", "Lince", "Jesús María", "Pueblo Libre", "Magdalena",
];
 
// ── Estado inicial (todos los campos de RestaurantEntity) ─────────────────────
const initialForm = {
  nombre: "",
  tipo: "",
  distrito: "",
  direccion: "",
  mensajePersonalizado: "",
  mesas: "",
  telefono: "",
  email: "",
  imagen: "",
  horarioApertura: "",
  horarioCierre: "",
};
 
export default function CreateRestaurant() {
  const { agregarRestaurante } = useRestaurants();
  const navigate = useNavigate();
 
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 
  // ── Manejador genérico de campos ──────────────────────────────────────────
  const handle = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Limpiar el error del campo al escribir
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };
 
  // ── Validaciones ──────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};
    if (!form.nombre.trim())      e.nombre      = "El nombre es requerido.";
    if (!form.tipo)               e.tipo         = "Selecciona un tipo de cocina.";
    if (!form.distrito.trim())    e.distrito     = "El distrito es requerido.";
    if (!form.direccion.trim())   e.direccion    = "La dirección es requerida.";
    if (!form.horarioApertura)    e.horarioApertura = "El horario de apertura es requerido.";
    if (!form.horarioCierre)      e.horarioCierre   = "El horario de cierre es requerido.";
    if (!form.mesas || parseInt(form.mesas) < 1)
                                  e.mesas        = "Ingresa al menos 1 mesa.";
    if (form.telefono && !/^\d{9}$/.test(form.telefono))
                                  e.telefono     = "El teléfono debe tener 9 dígitos.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                  e.email        = "Ingresa un email válido.";
    return e;
  };