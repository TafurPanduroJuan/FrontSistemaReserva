import React, { createContext, useContext, useState, useCallback } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "./AuthContext";

const TablesContext = createContext(null);

export function TablesProvider({ children }) {
  const { token } = useAuth();

  // ── Estado reactivo de reservas para la intranet ──────────────────────────
  const [reservas, setReservas] = useState([]);
  const [cargandoReservas, setCargandoReservas] = useState(false);

  // Flag que avisa a TableManagement que debe recargar las mesas
  // porque una cancelación liberó una mesa en el backend
  const [mesasDesactualizadas, setMesasDesactualizadas] = useState(false);

  // ── Todas las mesas de un restaurante ─────────────────────────────────────
  const getMesas = async (restaurantId) => {
    return await apiFetch(`/api/tables?restaurantId=${restaurantId}`);
  };

  // ── Solo mesas disponibles, con filtro opcional de zona ───────────────────
  const getMesasDisponibles = async (restaurantId, zona = null) => {
    const url = zona
      ? `/api/tables/available?restaurantId=${restaurantId}&zona=${encodeURIComponent(zona)}`
      : `/api/tables/available?restaurantId=${restaurantId}`;
    return await apiFetch(url);
  };

  // ── Crear mesa (intranet — requiere token) ────────────────────────────────
  const crearMesa = async (restaurantId, datos) => {
    return await apiFetch(`/api/tables?restaurantId=${restaurantId}`, {
      method: "POST",
      body: JSON.stringify(datos),
    }, token);
  };

  // ── Eliminar mesa (intranet — requiere token) ─────────────────────────────
  const eliminarMesa = async (mesaId) => {
    return await apiFetch(`/api/tables/${mesaId}`, { method: "DELETE" }, token);
  };

  // ── Crear reserva desde el catálogo público (sin token) ───────────────────
  const agregarReserva = async (datos) => {
    return await apiFetch("/api/tables/reserve", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  };

  // ── Cargar reservas de un restaurante (intranet) ──────────────────────────
  const cargarReservas = useCallback(async (restaurantId, fecha = null, estado = null) => {
    if (!restaurantId) return;
    setCargandoReservas(true);
    try {
      let url = `/api/reservations?restaurantId=${restaurantId}`;
      if (fecha)  url += `&fecha=${fecha}`;
      if (estado) url += `&estado=${estado}`;
      const data = await apiFetch(url, {}, token);
      // Normalizar el objeto reservation que devuelve el backend
      const normalizadas = data.map((r) => ({
        ...r,
        restauranteId:  r.restaurant?.id   || null,
        restaurante:    r.restaurant?.nombre || "",
        mesa:           r.mesaNumero,
        tel:            r.tel ? String(r.tel) : "",
      }));
      setReservas(normalizadas);
      return normalizadas;
    } catch (err) {
      console.error("Error cargando reservas:", err);
      return [];
    } finally {
      setCargandoReservas(false);
    }
  }, [token]);

  // ── Obtener reservas (método compatible con llamadas sin estado) ──────────
  const getReservas = async (restaurantId, fecha = null, estado = null) => {
    return await cargarReservas(restaurantId, fecha, estado);
  };

  // ── Cambiar estado de una reserva (intranet — requiere token) ─────────────
  const cambiarEstadoReserva = async (reservaId, nuevoEstado, motivoCancelacion = null) => {
    try {
      const body = { estado: nuevoEstado };
      if (motivoCancelacion) body.motivoCancelacion = motivoCancelacion;
      await apiFetch(
        `/api/reservations/${reservaId}/status`,
        { method: "PATCH", body: JSON.stringify(body) },
        token
      );
      // Actualizar localmente sin recargar
      setReservas((prev) =>
        prev.map((r) => (r.id === reservaId ? { ...r, estado: nuevoEstado } : r))
      );
      // Si se cancela la reserva, refrescar las mesas para que la mesa
      // vuelva a aparecer como "disponible" en TableManagement
      const esCancelacion = nuevoEstado.startsWith("cancelada");
      if (esCancelacion) {
        setMesasDesactualizadas(true);
      }
      return true;
    } catch (err) {
      console.error("Error cambiando estado reserva:", err);
      throw err;
    }
  };

  return (
    <TablesContext.Provider value={{
      reservas,
      cargandoReservas,
      mesasDesactualizadas,
      setMesasDesactualizadas,
      getMesas,
      getMesasDisponibles,
      crearMesa,
      eliminarMesa,
      agregarReserva,
      cargarReservas,
      getReservas,
      cambiarEstadoReserva,
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