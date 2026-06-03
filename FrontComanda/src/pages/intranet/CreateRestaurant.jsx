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
  
  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validaciones = validar();
    if (Object.keys(validaciones).length > 0) {
      setErrors(validaciones);
      return;
    }
 
    setLoading(true);
    try {
      await agregarRestaurante({
        ...form,
        telefono:       parseInt(form.telefono) || null,
        mesas:          parseInt(form.mesas),
        horarioApertura: form.horarioApertura,
        horarioCierre:   form.horarioCierre,
      });
      navigate("/intranet/restaurantes");
    } catch (err) {
      setError("Error al crear el restaurante: " + err.message);
    } finally {
      setLoading(false);
    }
  };
 
  // ── Helpers de estilo para feedback visual ────────────────────────────────
  const fieldClass = (name) =>
    `form-control${errors[name] ? " is-invalid" : ""}`;
 
  return (
    <div className="container py-4" style={{ maxWidth: 860 }}>
      {/* Cabecera */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/intranet/restaurantes")}
        >
          <i className="bi bi-arrow-left me-1" />
          Volver
        </button>
        <h4 className="mb-0">
          <i className="bi bi-shop-window me-2 text-warning" />
          Crear restaurante
        </h4>
      </div>
 
      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-triangle-fill" />
          {error}
        </div>
      )}
 
      <form onSubmit={handleSubmit} noValidate></form>