import React, { createContext, useContext } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "./AuthContext";

const TablesContext = createContext(null);

export function TablesProvider({ children }) {
  const { token } = useAuth();

  // Todas las mesas de un restaurante
  const getMesas = async (restaurantId) => {
    return await apiFetch(`/api/tables?restaurantId=${restaurantId}`);
  };

  // Solo mesas disponibles, con filtro opcional de zona
  const getMesasDisponibles = async (restaurantId, zona = null) => {
    const url = zona
      ? `/api/tables/available?restaurantId=${restaurantId}&zona=${encodeURIComponent(zona)}`
      : `/api/tables/available?restaurantId=${restaurantId}`;
    return await apiFetch(url);
  };

  // Crear reserva desde el catálogo público (sin token)
  const agregarReserva = async (datos) => {
    return await apiFetch("/api/tables/reserve", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  };

  // Cambiar estado de una reserva (intranet — requiere token)
  const cambiarEstadoReserva = async (reservaId, nuevoEstado) => {
    return await apiFetch(
      `/api/reservations/${reservaId}/status`,
      { method: "PATCH", body: JSON.stringify({ estado: nuevoEstado }) },
      token
    );
  };

  // Obtener reservas de un restaurante con filtros opcionales (intranet)
  const getReservas = async (restaurantId, fecha = null, estado = null) => {
    let url = `/api/reservations?restaurantId=${restaurantId}`;
    if (fecha)  url += `&fecha=${fecha}`;
    if (estado) url += `&estado=${estado}`;
    return await apiFetch(url, {}, token);
  };

  return (
    <TablesContext.Provider value={{
      getMesas,
      getMesasDisponibles,
      agregarReserva,
      cambiarEstadoReserva,
      getReservas,
    }}>
      {children}
    </TablesContext.Provider>
  );
}

export function useTables() {
  const ctx = useContext(TablesContext);
  if (!ctx) throw new Error("useTables must be used inside TablesProvider");
  return ctx;
}