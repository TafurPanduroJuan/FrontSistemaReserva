import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "./AuthContext";

// ── Context ───────────────────────────────────────────────────────────────────
const CommentsContext = createContext(null);

export function CommentsProvider({ children }) {
  const { token, isPersonal } = useAuth();
  const [comentarios, setComentarios] = useState([]);

  // ── Cargar comentarios desde el backend ───────────────────────────────────
  // Estrategia: si hay token Y el usuario es PERSONAL, usar /my-restaurant.
  // En cualquier otro caso usar /api/comments (público).
  // El useCallback depende de token e isPersonal para re-ejecutarse cuando
  // el AuthContext termine de hidratarse desde localStorage.
  const cargar = useCallback(async () => {
    try {
      let data;
      if (token && isPersonal) {
        // PERSONAL: solo los comentarios de su restaurante (requiere JWT)
        data = await apiFetch("/api/comments/my-restaurant", {}, token);
      } else {
        // Admin o sin sesión: todos los comentarios (público)
        data = await apiFetch("/api/comments");
      }
      // Normalizar: el backend devuelve restaurant (objeto), no restaurante (string)
      const normalizados = data.map((c) => ({
        ...c,
        restaurante: c.restaurant?.nombre || null,
      }));
      setComentarios(normalizados);
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
    }
  }, [token, isPersonal]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // ── Contador de no leídos ─────────────────────────────────────────────────
  const noLeidos = comentarios.filter((c) => !c.leido).length;

  // ── Marcar como leído ─────────────────────────────────────────────────────
  const marcarLeido = async (id) => {
    try {
      await apiFetch(`/api/comments/${id}/read`, { method: "PUT" }, token);
      setComentarios((prev) =>
        prev.map((c) => (c.id === id ? { ...c, leido: true } : c))
      );
    } catch (err) {
      console.error("Error al marcar como leído:", err);
    }
  };

  // ── Archivar / eliminar un comentario ─────────────────────────────────────
  const archivarComentario = async (id) => {
    try {
      await apiFetch(`/api/comments/${id}`, { method: "DELETE" }, token);
      setComentarios((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error al archivar comentario:", err);
    }
  };

  // ── Responder a un comentario (admin/personal) ────────────────────────────
  const responderComentario = async (id, respuesta) => {
    const data = await apiFetch(
      `/api/comments/${id}/reply`,
      { method: "POST", body: JSON.stringify({ respuesta }) },
      token
    );
    // Actualizar localmente sin recargar
    setComentarios((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, respuestaRestaurante: respuesta, fechaRespuesta: data.fechaRespuesta, leido: true }
          : c
      )
    );
    return data;
  };

  // ── Refrescar lista manualmente ───────────────────────────────────────────
  const refrescar = () => cargar();

  return (
    <CommentsContext.Provider
      value={{
        comentarios,
        noLeidos,
        marcarLeido,
        archivarComentario,
        responderComentario,
        refrescar,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

// Hook para consumir el context fácilmente
export function useComments() {
  const ctx = useContext(CommentsContext);
  if (!ctx)
    throw new Error("useComments debe usarse dentro de CommentsProvider");
  return ctx;
}