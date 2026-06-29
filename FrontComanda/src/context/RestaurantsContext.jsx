import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "./AuthContext";

const RestaurantsContext = createContext(null);

export function RestaurantsProvider({ children }) {
  const { token, isAdmin } = useAuth();

  const [restaurantes, setRestaurantes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  // FIX: solo cargar solicitudes si el usuario es ADMINISTRADOR.
  // Antes se llamaba con cualquier token, lo que generaba 403 para
  // usuarios con rol "personal" o "usuario".
  useEffect(() => {
    if (token && isAdmin) cargarSolicitudes();
  }, [token, isAdmin]);

  const normalizeRestaurant = (r) => ({
    ...r,
    img:      r.img      || r.imagen   || null,
    lugar:    r.lugar    || r.distrito  || r.direccion || "",
    // Stats reales del backend (prefijo _ para diferenciar de campos del backend)
    rating:   r._rating   != null ? r._rating   : (r.rating   ?? null),
    reseñas:  r._totalResenas != null ? r._totalResenas : (r.reseñas ?? 0),
    mesas:    r._totalMesas   != null ? r._totalMesas   : (r.mesas   ?? 0),
    precio:   r.precio   || null,
  });

  const cargarRestaurantes = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await apiFetch("/api/restaurants");
      // Enriquecer cada restaurante con sus stats (mesas reales + rating calculado)
      const enriched = await Promise.all(
        data.map(async (r) => {
          try {
            const stats = await apiFetch(`/api/restaurants/${r.id}/stats`);
            return { ...r, _totalMesas: stats.totalMesas, _rating: stats.rating, _totalResenas: stats.totalResenas };
          } catch {
            return { ...r, _totalMesas: r.mesas ?? 0, _rating: null, _totalResenas: 0 };
          }
        })
      );
      setRestaurantes(enriched.map(normalizeRestaurant));
    } catch (err) {
      setError(err.message);
      console.error("Error cargando restaurantes:", err);
    } finally {
      setCargando(false);
    }
  };

  const agregarRestaurante = async (data) => {
    const nuevo = await apiFetch("/api/restaurants", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
    setRestaurantes((prev) => [...prev, normalizeRestaurant(nuevo)]);
    return nuevo;
  };

  const editarRestaurante = async (data) => {
    const actualizado = await apiFetch(`/api/restaurants/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
    setRestaurantes((prev) =>
      prev.map((r) => (r.id === actualizado.id ? normalizeRestaurant(actualizado) : r))
    );
    return actualizado;
  };

  const toggleCierre = async (id, cerradoHoy, motivoCierre, fecha) => {
    const actualizado = await apiFetch(`/api/restaurants/${id}/cierre`, {
      method: "PUT",
      body: JSON.stringify({ cerradoHoy, motivoCierre, fecha }),
    }, token);
    setRestaurantes((prev) =>
      prev.map((r) => (r.id === actualizado.id ? normalizeRestaurant(actualizado) : r))
    );
    return actualizado;
  };

  const eliminarRestaurante = async (id) => {
    await apiFetch(`/api/restaurants/${id}`, { method: "DELETE" }, token);
    setRestaurantes((prev) => prev.filter((r) => r.id !== id));
  };

  const cargarSolicitudes = async () => {
    try {
      const data = await apiFetch("/api/restaurants/requests", {}, token);
      setSolicitudes(data);
    } catch (err) {
      console.error("Error cargando solicitudes:", err);
    }
  };

  const agregarSolicitud = async (data) => {
    const nueva = await apiFetch("/api/restaurants/requests", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setSolicitudes((prev) => [...prev, nueva]);
    return nueva;
  };

  const aceptarSolicitud = async (id) => {
    const actualizada = await apiFetch(
      `/api/restaurants/requests/${id}/accept`,
      { method: "PUT" },
      token
    );
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "aceptado" } : s))
    );
    await cargarRestaurantes();
    return actualizada;
  };

  const rechazarSolicitud = async (id, motivo = null) => {
    await apiFetch(
      `/api/restaurants/requests/${id}/reject`,
      {
        method: "PUT",
        body: motivo ? JSON.stringify({ motivo }) : undefined,
      },
      token
    );
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === id ? { ...s, estado: "rechazado" } : s))
    );
  };

  return (
    <RestaurantsContext.Provider
      value={{
        restaurantes,
        solicitudes,
        cargando,
        error,
        cargarRestaurantes,
        agregarRestaurante,
        editarRestaurante,
        toggleCierre,
        eliminarRestaurante,
        agregarSolicitud,
        aceptarSolicitud,
        rechazarSolicitud,
      }}
    >
      {children}
    </RestaurantsContext.Provider>
  );
}

export function useRestaurants() {
  const ctx = useContext(RestaurantsContext);
  if (!ctx) throw new Error("useRestaurants must be used inside RestaurantsProvider");
  return ctx;
}