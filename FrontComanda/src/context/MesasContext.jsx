import React, { createContext, useContext, useState, useEffect } from "react";

// ── Helpers localStorage ──────────────────────────────────────────────────────
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ── Generador de mesas por restaurante ───────────────────────────────────────
export const generarMesasIniciales = () =>
  Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    numero: i + 1,
    capacidad: [2, 4, 4, 6, 2, 4, 2, 8, 4, 4, 2, 4][i] || 4,
    estado: "disponible",
    zona: i < 4 ? "Terraza" : i < 8 ? "Salón Interior" : "VIP",
  }));

// ── Reservas iniciales de ejemplo ─────────────────────────────────────────────
const INITIAL_RESERVAS = [
  { id: 1, cliente: "María López",   email: "maria@gmail.com",   tel: "987654321", restaurante: "La Bella Italia", fecha: "2026-04-25", hora: "19:30", personas: 2, mesa: 3, zona: "Terraza",        notas: "Aniversario", estado: "pendiente" },
  { id: 2, cliente: "Roberto Silva", email: "roberto@gmail.com", tel: "976543210", restaurante: "La Bella Italia", fecha: "2026-04-25", hora: "20:00", personas: 4, mesa: 7, zona: "Salón Interior", notas: "",            estado: "confirmada" },
];

// ── Context ───────────────────────────────────────────────────────────────────
const MesasContext = createContext(null);

export function MesasProvider({ children }) {
  // datosGlobales: { [nombreRestaurante]: Mesa[] }
  const [datosGlobales, setDatosGlobales] = useState(() =>
    load("comanda_mesas_v2", {})
  );

  // reservas: Reserva[]
  const [reservas, setReservas] = useState(() =>
    load("comanda_reservas_maestro", INITIAL_RESERVAS)
  );

  useEffect(() => { save("comanda_mesas_v2", datosGlobales); }, [datosGlobales]);
  useEffect(() => { save("comanda_reservas_maestro", reservas); }, [reservas]);

  // ── Mesas ─────────────────────────────────────────────────────────────────
  const getMesas = (restaurante) =>
    datosGlobales[restaurante] || generarMesasIniciales();

  const cambiarEstadoMesa = (restaurante, mesaId, nuevoEstado) => {
    const mesas = getMesas(restaurante).map(m =>
      m.id === mesaId ? { ...m, estado: nuevoEstado } : m
    );
    setDatosGlobales(prev => ({ ...prev, [restaurante]: mesas }));
  };

  // ── Reservas ──────────────────────────────────────────────────────────────

  /**
   * Agrega una nueva reserva (llamado desde el catálogo público).
   * El localStorage ya fue escrito directamente por el catálogo,
   * pero actualizamos el estado en memoria para que la intranet
   * lo refleje sin recargar.
   */
  const agregarReserva = (nuevaReserva) => {
    const conId = nuevaReserva.id
      ? nuevaReserva
      : { ...nuevaReserva, id: Date.now() };
    setReservas(prev => {
      // Evitar duplicados si ya vino del storage
      const yaExiste = prev.some(r => r.id === conId.id);
      return yaExiste ? prev : [...prev, conId];
    });
  };

  const cambiarEstadoReserva = (reservaId, nuevoEstado) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;

    setReservas(prev =>
      prev.map(r => r.id === reservaId ? { ...r, estado: nuevoEstado } : r)
    );

    // Sincronizar estado de la mesa
    if (nuevoEstado === "confirmada") {
      cambiarEstadoMesa(reserva.restaurante, reserva.mesa, "reservada");
    } else if (nuevoEstado === "cancelada") {
      const otraConfirmada = reservas.some(
        r => r.id !== reservaId &&
             r.restaurante === reserva.restaurante &&
             r.mesa === reserva.mesa &&
             r.estado === "confirmada"
      );
      if (!otraConfirmada) {
        cambiarEstadoMesa(reserva.restaurante, reserva.mesa, "disponible");
      }
    }
  };

  // ── Sincronización: leer reservas nuevas del localStorage ─────────────────
  // Cada vez que el componente monta (o el usuario navega a la intranet),
  // reconciliamos el estado en memoria con lo escrito por el catálogo.
  useEffect(() => {
    const stored = load("comanda_reservas_maestro", []);
    setReservas(stored);
  }, []);

  return (
    <MesasContext.Provider value={{
      datosGlobales,
      getMesas,
      cambiarEstadoMesa,
      reservas,
      agregarReserva,
      cambiarEstadoReserva,
    }}>
      {children}
    </MesasContext.Provider>
  );
}

export function useMesas() {
  const ctx = useContext(MesasContext);
  if (!ctx) throw new Error("useMesas must be used inside MesasProvider");
  return ctx;
}
