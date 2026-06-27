import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "./AuthContext";

// ── Context ───────────────────────────────────────────────────────────────────
const CommentsContext = createContext(null);

export function CommentsProvider({ children }) {
  const { token, user, isPersonal, isAdmin } = useAuth();
  const [comentarios, setComentarios] = useState([]);

  // ── Cargar comentarios desde el backend ───────────────────────────────────
  // - ADMINISTRADOR: GET /api/comments  (todos)
  // - PERSONAL:      GET /api/comments/my-restaurant  (solo su restaurante, requiere token)
  // - Sin sesión/USUARIO: GET /api/comments  (público)
  const cargar = useCallback(async () => {
    try {
      let data;
      if (isPersonal && token) {
        // El personal solo ve los comentarios de su restaurante
        data = await apiFetch("/api/comments/my-restaurant", {}, token);
      } else {
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
    // Actualizar localmente
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
  // agregarComentario ya no se usa desde el context (Form.jsx llama directo al API).
  // Se expone refrescar() por si alguna vista necesita recargar.
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