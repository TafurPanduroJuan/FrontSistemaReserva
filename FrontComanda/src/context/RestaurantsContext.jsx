import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "./AuthContext";

const RestaurantsContext = createContext(null);

export function RestaurantsProvider({ children }) {
  const { token } = useAuth();

  const [restaurantes, setRestaurantes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarRestaurantes();
  }, []);

  useEffect(() => {
    if (token) cargarSolicitudes();
  }, [token]);

  const cargarRestaurantes = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await apiFetch("/api/restaurants");
      setRestaurantes(data);
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
    setRestaurantes((prev) => [...prev, nuevo]);
    return nuevo;
  };

  const editarRestaurante = async (data) => {
    const actualizado = await apiFetch(`/api/restaurants/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
    setRestaurantes((prev) =>
      prev.map((r) => (r.id === actualizado.id ? actualizado : r))
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

  const rechazarSolicitud = async (id) => {
    await apiFetch(
      `/api/restaurants/requests/${id}/reject`,
      { method: "PUT" },
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