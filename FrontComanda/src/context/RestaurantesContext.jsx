import React, { createContext, useContext, useState, useEffect } from "react";

// Imágenes locales para las solicitudes mock
import rest1 from "../assets/img/rest1.jpg";
import rest2 from "../assets/img/rest2.jpg";
import rest3 from "../assets/img/rest3.jpg";
import rest4 from "../assets/img/rest4.jpg";
import rest5 from "../assets/img/rest5.jpg";
import rest6 from "../assets/img/rest6.jpg";

// ── Restaurantes del catálogo público ────────────────────────────────────────
// Se importan para sincronizarlos como restaurantes activos en la intranet.
import { restaurantes as restaurantesCatalogo } from "../data/datos";

// Convierte un restaurante del catálogo al formato de la intranet
function catalogoToIntranet(r, index) {
  return {
    id: `catalogo_${r.nombre.replace(/\s+/g, "_").toLowerCase()}`,
    nombre: r.nombre,
    tipo: r.tipo,
    distrito: r.lugar,
    direccion: r.lugar,
    mensaje_personalizado: `${r.tipo} · ${r.precio}`,
    mesas: r.mesas,
    telefono: "",
    email: "",
    imagen: r.img,
    horario_apertura: r.hora,
    horario_cierre: "23:00",
    origen: "catalogo",
    rating: r.rating,
    precio: r.precio,
  };
}

// ── Datos iniciales de restaurantes registrados ──────────────────────────────
const INITIAL_RESTAURANTES = [
  {
    id: 1,
    nombre: "La Bella Italia",
    tipo: "Italiana",
    distrito: "Miraflores",
    direccion: "Av. Larco 123",
    mensaje_personalizado: "Auténtico sabor romano",
    mesas: 12,
    telefono: "987654321",
    email: "info@bellaitalia.pe",
    imagen: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400",
    horario_apertura: "12:00",
    horario_cierre: "23:00",
    origen: "registrado",
  },
  {
    id: 2,
    nombre: "Mar de Copas",
    tipo: "Mariscos",
    distrito: "Barranco",
    direccion: "Malecón Castilla 456",
    mensaje_personalizado: "Del mar a tu mesa",
    mesas: 20,
    telefono: "912345678",
    email: "reservas@mardecopas.pe",
    imagen: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=400",
    horario_apertura: "11:00",
    horario_cierre: "22:00",
    origen: "registrado",
  },
];

// ── Datos iniciales de solicitudes ───────────────────────────────────────────
const INITIAL_SOLICITUDES = [
  {
    id: 1,
    nombre: "El Rincón Criollo",
    propietario: "Carlos Mamani",
    email: "carlos@gmail.com",
    tipo: "Criolla",
    ciudad: "Miraflores",
    telefono: "987654321",
    descripcion: "Restaurante familiar con 20 años de tradición criolla.",
    fecha: "2026-04-25",
    estado: "pendiente",
    imagen: rest3,
  },
  {
    id: 2,
    nombre: "Sushi Fusion Lima",
    propietario: "Ana Takahashi",
    email: "ana@gmail.com",
    tipo: "Japonesa",
    ciudad: "San Isidro",
    telefono: "998877665",
    descripcion: "Fusión de cocina japonesa con toques peruanos únicos.",
    fecha: "2026-04-25",
    estado: "pendiente",
    imagen: rest1,
  },
  {
    id: 3,
    nombre: "La Trattoria",
    propietario: "Marco Rossi",
    email: "marco@labella.it",
    tipo: "Italiana",
    ciudad: "Barranco",
    telefono: "912345678",
    descripcion: "Pastas artesanales y pizzas al horno de leña.",
    fecha: "2026-04-25",
    estado: "pendiente",
    imagen: rest2,
  },
  {
    id: 4,
    nombre: "Mariscos Don Pedro",
    propietario: "Pedro Huanca",
    email: "pedro@mariscos.pe",
    tipo: "Mariscos",
    ciudad: "Chorrillos",
    telefono: "976543210",
    descripcion: "Los mejores ceviches y tiraditos de Lima.",
    fecha: "2026-04-25",
    estado: "aceptado",
    imagen: rest4,
  },
  {
    id: 5,
    nombre: "Veggie & Soul",
    propietario: "Sofía Vargas",
    email: "sofia@veggie.pe",
    tipo: "Vegana",
    ciudad: "Miraflores",
    telefono: "945612378",
    descripcion: "Cocina vegana de autor con ingredientes orgánicos.",
    fecha: "2026-04-25",
    estado: "rechazado",
    imagen: rest5,
  },
];

// ── Helpers para localStorage ─────────────────────────────────────────────────
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/**
 * Fusiona los restaurantes del catálogo con los que ya existen en la intranet.
 * - Los del catálogo se identifican por origen === "catalogo" o por id con prefijo "catalogo_"
 * - Si ya existe uno con el mismo nombre (de cualquier origen), no se duplica
 * - Los del catálogo se añaden al final para no alterar el orden de los registrados
 */
function fusionarConCatalogo(almacenados) {
  const catalogoConvertido = restaurantesCatalogo.map(catalogoToIntranet);
  const resultado = [...almacenados];

  for (const restCat of catalogoConvertido) {
    const yaExiste = resultado.some(
      (r) => r.nombre.toLowerCase() === restCat.nombre.toLowerCase()
    );
    if (!yaExiste) {
      resultado.push(restCat);
    }
  }

  return resultado;
}

// ── Context ───────────────────────────────────────────────────────────────────
const RestaurantesContext = createContext(null);

export function RestaurantesProvider({ children }) {
  const [restaurantes, setRestaurantes] = useState(() => {
    const almacenados = loadFromStorage("comanda_restaurantes", INITIAL_RESTAURANTES);
    return fusionarConCatalogo(almacenados);
  });

  const [solicitudes, setSolicitudes] = useState(() =>
    loadFromStorage("comanda_solicitudes", INITIAL_SOLICITUDES)
  );

  useEffect(() => {
    saveToStorage("comanda_restaurantes", restaurantes);
  }, [restaurantes]);

  useEffect(() => {
    saveToStorage("comanda_solicitudes", solicitudes);
  }, [solicitudes]);

  // ── Acciones sobre solicitudes ──────────────────────────────────────────────

  const aceptarSolicitud = (id) => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "aceptado" } : s))
    );

    const solicitud = solicitudes.find((s) => s.id === id);
    if (!solicitud) return;

    const nuevoRestaurante = {
      id: Date.now(),
      nombre: solicitud.nombre,
      tipo: solicitud.tipo,
      distrito: solicitud.ciudad,
      direccion: "",
      mensaje_personalizado: solicitud.descripcion,
      mesas: 0,
      telefono: solicitud.telefono,
      email: solicitud.email,
      imagen: solicitud.imagen || rest6,
      horario_apertura: "",
      horario_cierre: "",
      origen: "solicitud",
      propietario: solicitud.propietario,
    };

    setRestaurantes((prev) => {
      const yaExiste = prev.some((r) => r.nombre === nuevoRestaurante.nombre);
      return yaExiste ? prev : [...prev, nuevoRestaurante];
    });
  };

  const rechazarSolicitud = (id) => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "rechazado" } : s))
    );
  };

  // ── Acciones sobre restaurantes ─────────────────────────────────────────────

  const agregarRestaurante = (data) => {
    const nuevo = { ...data, id: Date.now(), origen: "manual" };
    setRestaurantes((prev) => [...prev, nuevo]);
  };

  // ── Agregar solicitud desde el formulario público ────────────────────────────
  const agregarSolicitud = (data) => {
    const nueva = {
      ...data,
      id: Date.now(),
      estado: "pendiente",
      fecha: new Date().toISOString().split("T")[0],
      imagen: data.imagen || null,
    };
    setSolicitudes((prev) => [...prev, nueva]);
  };

  const editarRestaurante = (updated) => {
    setRestaurantes((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  };

  const eliminarRestaurante = (id) => {
    setRestaurantes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RestaurantesContext.Provider
      value={{
        restaurantes,
        solicitudes,
        aceptarSolicitud,
        rechazarSolicitud,
        agregarRestaurante,
        agregarSolicitud,
        editarRestaurante,
        eliminarRestaurante,
      }}
    >
      {children}
    </RestaurantesContext.Provider>
  );
}

export function useRestaurantes() {
  const ctx = useContext(RestaurantesContext);
  if (!ctx) throw new Error("useRestaurantes must be used inside RestaurantesProvider");
  return ctx;
}