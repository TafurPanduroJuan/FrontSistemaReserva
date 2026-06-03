import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "./AuthContext";

// ── Context ───────────────────────────────────────────────────────────────────
const CommentsContext = createContext(null);

export function CommentsProvider({ children }) {
  const { token } = useAuth();
  const [comentarios, setComentarios] = useState([]);

  // ── Cargar comentarios desde el backend ───────────────────────────────────
  // GET /api/comments es público (SecurityConfig)
  const cargar = useCallback(async () => {
    try {
      const data = await apiFetch("/api/comments");
      // Normalizar: el backend devuelve restaurant (objeto), no restaurante (string)
      const normalizados = data.map((c) => ({
        ...c,
        restaurante: c.restaurant?.nombre || null, // compatibilidad con vistas existentes
      }));
      setComentarios(normalizados);
    } catch (err) {
      console.error("Error al cargar comentarios:", err);
    }
  }, []);

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