import { createContext, useContext, useState, useEffect } from "react";

// ── Helpers localStorage (mismo patrón que MesasContext y RestaurantesContext) ──
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ── Datos iniciales de ejemplo (los que ya estaban en Comentarios.jsx) ────────
// Cuando el usuario envíe formularios reales, estos quedan al fondo
// y los nuevos aparecen primero (más recientes primero).
const INITIAL_COMENTARIOS = [
  {
    id: 1,
    usuario: "María López",
    email: "maria@gmail.com",
    telefono: null,
    tipo: "comentario",
    asunto: "Experiencia de reserva",
    mensaje: "¡Excelente plataforma! Encontré mi restaurante favorito fácilmente. El proceso de reserva fue muy intuitivo.",
    fecha: "2026-04-23",
    restaurante: "Sushi Take",
    calificacion: 5,
    leido: false,
  },
  {
    id: 2,
    usuario: "Roberto Silva",
    email: "roberto@gmail.com",
    telefono: null,
    tipo: "reclamo",
    asunto: "Reserva no confirmada",
    mensaje: "La reserva no fue confirmada a tiempo. Tuve que esperar 30 minutos en el restaurante sin que nadie me atendiera.",
    fecha: "2026-04-22",
    restaurante: "La Bella Italia",
    calificacion: 2,
    leido: false,
  },
  {
    id: 3,
    usuario: "Lucía Fernández",
    email: "lucia@gmail.com",
    telefono: null,
    tipo: "experiencia",
    asunto: "Muy buena experiencia",
    mensaje: "Muy buena experiencia reservando. El proceso fue sencillo y rápido. La confirmación llegó en minutos.",
    fecha: "2026-04-21",
    restaurante: "El Huarike",
    calificacion: 4,
    leido: true,
  },
  {
    id: 4,
    usuario: "Diego Quispe",
    email: "diego@gmail.com",
    telefono: null,
    tipo: "reclamo",
    asunto: "Restaurante cerrado",
    mensaje: "El restaurante estaba cerrado cuando llegué, pero la reserva estaba confirmada. Mala coordinación.",
    fecha: "2026-04-20",
    restaurante: "Mar y Tierra",
    calificacion: 1,
    leido: true,
  },
  {
    id: 5,
    usuario: "Camila Torres",
    email: "camila@gmail.com",
    telefono: null,
    tipo: "comentario",
    asunto: "Sugerencia de mejora",
    mensaje: "Sería genial poder filtrar por precio promedio del restaurante. El diseño de la web me encanta.",
    fecha: "2026-04-19",
    restaurante: null,
    calificacion: null,
    leido: true,
  },
  {
    id: 6,
    usuario: "Andrés Paredes",
    email: "andres@gmail.com",
    telefono: null,
    tipo: "experiencia",
    asunto: "Cena romántica perfecta",
    mensaje: "Reservé para una cena especial y todo salió perfecto. Gracias a Comanda por facilitar todo.",
    fecha: "2026-04-18",
    restaurante: "La Trattoria",
    calificacion: 5,
    leido: false,
  },
];

// ── Context ───────────────────────────────────────────────────────────────────
const ComentariosContext = createContext(null);

export function ComentariosProvider({ children }) {
  // Carga desde localStorage o usa los datos iniciales de ejemplo
  const [comentarios, setComentarios] = useState(() =>
    load("comanda_comentarios", INITIAL_COMENTARIOS)
  );

  // Cada vez que cambia el estado, se persiste automáticamente
  useEffect(() => {
    save("comanda_comentarios", comentarios);
  }, [comentarios]);

  // ── Agregar un comentario nuevo (llamado desde Form.jsx) ──────────────────
  // Recibe el payload que arma el formulario y lo guarda al inicio de la lista
  // para que aparezca primero en la intranet (más reciente arriba).
  const agregarComentario = (payload) => {
    const nuevo = {
      id: Date.now(),                               // id único basado en timestamp
      usuario: `${payload.nombre} ${payload.apellido}`,
      email: payload.correo,
      telefono: payload.telefono || null,
      tipo: payload.tipo,
      asunto: payload.asunto,
      mensaje: payload.mensaje,
      restaurante: payload.restaurante || null,
      calificacion: payload.calificacion || null,
      fecha: new Date().toISOString().split("T")[0], // "YYYY-MM-DD"
      leido: false,                                  // siempre entra como no leído
    };
    // Los nuevos van al principio de la lista
    setComentarios((prev) => [nuevo, ...prev]);
  };

  // ── Marcar como leído (llamado desde Comentarios.jsx al expandir) ─────────
  const marcarLeido = (id) => {
    setComentarios((prev) =>
      prev.map((c) => (c.id === id ? { ...c, leido: true } : c))
    );
  };

  // ── Archivar / eliminar un comentario ─────────────────────────────────────
  const archivarComentario = (id) => {
    setComentarios((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Contador de no leídos (útil para mostrar badge en el sidebar) ─────────
  const noLeidos = comentarios.filter((c) => !c.leido).length;

  return (
    <ComentariosContext.Provider
      value={{
        comentarios,
        noLeidos,
        agregarComentario,
        marcarLeido,
        archivarComentario,
      }}
    >
      {children}
    </ComentariosContext.Provider>
  );
}

// Hook para consumir el context fácilmente
export function useComentarios() {
  const ctx = useContext(ComentariosContext);
  if (!ctx)
    throw new Error("useComentarios debe usarse dentro de ComentariosProvider");
  return ctx;
}
