import React, { createContext, useContext, useState, useEffect } from "react";

// ── Context ───────────────────────────────────────────────────────────────────
const TablesContext = createContext(null);

export function TablesProvider({ children }) {
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

    // Sincronizar estado en comanda_users si la reserva tiene userId
    if (reserva.userId) {
      try {
        const usersRaw = localStorage.getItem("comanda_users");
        const users = usersRaw ? JSON.parse(usersRaw) : [];
        const updatedUsers = users.map(u => {
          if (u.id !== reserva.userId) return u;
          const updatedReservas = (u.reservas || []).map(r =>
            r.id === reservaId ? { ...r, estado: nuevoEstado } : r
          );
          return { ...u, reservas: updatedReservas };
        });
        localStorage.setItem("comanda_users", JSON.stringify(updatedUsers));

        // Actualizar sesión activa si el afectado es el usuario logueado
        const sessionRaw = localStorage.getItem("comanda_session");
        if (sessionRaw) {
          const session = JSON.parse(sessionRaw);
          if (session.id === reserva.userId) {
            const updatedSession = {
              ...session,
              reservas: (session.reservas || []).map(r =>
                r.id === reservaId ? { ...r, estado: nuevoEstado } : r
              ),
            };
            localStorage.setItem("comanda_session", JSON.stringify(updatedSession));
          }
        }

        // Notificar a la pestaña del catálogo/cuenta para que se actualice
        window.dispatchEvent(
          new CustomEvent("comanda_reserva_actualizada", { detail: { reservaId, nuevoEstado } })
        );
      } catch {}
    }

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

  return (
    <TablesContext.Provider value={{
      datosGlobales,
      getMesas,
      cambiarEstadoMesa,
      reservas,
      agregarReserva,
      cambiarEstadoReserva,
    }}>
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const ctx = useContext(TablesContext);
  if (!ctx) throw new Error("useTables must be used inside MesasProvider");
  return ctx;
}