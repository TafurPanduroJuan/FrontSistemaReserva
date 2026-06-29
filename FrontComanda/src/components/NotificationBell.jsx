import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";
import "../assets/styles/notification.css";

const TIPO_ICON = {
  RESERVATION_CONFIRMED: "bi-calendar-check-fill text-success",
  RESERVATION_CANCELLED: "bi-calendar-x-fill text-danger",
  COMMENT_REPLY: "bi-chat-dots-fill text-primary",
};

function timeAgo(fechaISO) {
  if (!fechaISO) return "";
  const diff = Date.now() - new Date(fechaISO).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} d`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markAllRead, markOneRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Cierra el panel al hacer clic fuera
  useEffect(() => {
    function handler(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleOpen() {
    setOpen((v) => !v);
  }

  function handleMarkAllRead() {
    markAllRead();
  }

  function handleNotificationClick(n) {
    if (!n.leida) markOneRead(n.id);
  }

  return (
    <div className="notif-wrapper" ref={panelRef}>
      {/* Campana */}
      <button
        className="notif-bell-btn"
        onClick={handleOpen}
        aria-label="Notificaciones"
        title="Notificaciones"
      >
        <i className={`bi ${open ? "bi-bell-fill" : "bi-bell"}`} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {/* Panel desplegable */}
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span className="notif-panel-title">
              <i className="bi bi-bell-fill me-2" />
              Notificaciones
            </span>
            {unreadCount > 0 && (
              <button className="notif-read-all-btn" onClick={handleMarkAllRead}>
                Marcar todo leído
              </button>
            )}
          </div>

          <div className="notif-list">
            {loading && notifications.length === 0 && (
              <div className="notif-empty">
                <i className="bi bi-hourglass-split" />
                <span>Cargando…</span>
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="notif-empty">
                <i className="bi bi-bell-slash" />
                <span>Sin notificaciones</span>
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`notif-item ${!n.leida ? "notif-item--unread" : ""}`}
                onClick={() => handleNotificationClick(n)}
              >
                <i className={`bi ${TIPO_ICON[n.tipo] ?? "bi-info-circle-fill text-secondary"} notif-item-icon`} />
                <div className="notif-item-body">
                  <p className="notif-item-msg">{n.mensaje}</p>
                  <span className="notif-item-time">{timeAgo(n.fecha)}</span>
                </div>
                {!n.leida && <span className="notif-dot" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}