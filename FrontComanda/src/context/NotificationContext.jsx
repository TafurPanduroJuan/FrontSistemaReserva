import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../services/api";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user || !token) return;
    try {
      const data = await apiFetch("/api/notifications/me", {}, token);
      setNotifications(data || []);
      setUnreadCount((data || []).filter((n) => !n.leida).length);
    } catch {
      // Silencioso: el usuario puede no tener notificaciones
    }
  }, [user, token]);

  // ✅ FIX: Polling reducido a 5 segundos para actualización casi en tiempo real.
  // Cuando se acepta/cancela una reserva el usuario lo verá en max 5s sin recargar.
  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      setUnreadCount(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    setLoading(true);
    fetchNotifications().finally(() => setLoading(false));
    intervalRef.current = setInterval(fetchNotifications, 5_000); // ← era 30_000
    return () => clearInterval(intervalRef.current);
  }, [user, token, fetchNotifications]);

  /** Marca todas como leídas (actualiza estado local inmediatamente) */
  const markAllRead = useCallback(async () => {
    if (!token) return;
    try {
      await apiFetch("/api/notifications/me/read-all", { method: "POST" }, token);
      setNotifications((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
    } catch {
      /* silencioso */
    }
  }, [token]);

  /** Marca una notificación individual como leída */
  const markOneRead = useCallback(
    async (id) => {
      if (!token) return;
      try {
        await apiFetch(`/api/notifications/${id}/read`, { method: "POST" }, token);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* silencioso */
      }
    },
    [token]
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markAllRead, markOneRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}