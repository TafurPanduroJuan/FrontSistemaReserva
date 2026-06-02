import { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "../services/api";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("comanda_session");
    return saved ? JSON.parse(saved) : null;
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  async function login(email, password) {
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const session = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.role,
        token: data.token,
      };
      setUser(session);
      localStorage.setItem("comanda_session", JSON.stringify(session));
      return { ok: true, user: session };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  function logout() {
    setUser(null);
    localStorage.removeItem("comanda_session");
  }

  // ── Registro ───────────────────────────────────────────────────────────────
  async function register({ nombre, email, password }) {
    try {
      const data = await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ nombre, email, password }),
      });
      const session = {
        id: data.id,
        nombre: data.nombre,
        email: data.email,
        rol: data.role,
        token: data.token,
      };
      setUser(session);
      localStorage.setItem("comanda_session", JSON.stringify(session));
      return { ok: true, user: session };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // ── Reset password (simulado) ─────────────────────────────────────────────
  function resetPassword(email) {
    const users = initUsers();
    const found = users.find((u) => u.email === email);
    if (!found) return { ok: false, error: "No existe una cuenta con ese email." };
    return { ok: true };
  }

  // ── Cambiar rol (desde la intranet del admin) ─────────────────────────────
  function changeUserRole(userId, newRol, restaurante = null) {
    const users = initUsers();
    const updated = users.map((u) => {
      if (u.id === userId) return { ...u, rol: newRol, restaurante };
      return u;
    });
    localStorage.setItem("comanda_users", JSON.stringify(updated));

    // Si el usuario activo es el afectado, actualizar sesión
    if (user && user.id === userId) {
      const newSession = { ...user, rol: newRol, restaurante };
      setUser(newSession);
      localStorage.setItem("comanda_session", JSON.stringify(newSession));
    }
  }

  // ── Eliminar usuario ───────────────────────────────────────────────────────
  function deleteUser(userId) {
    const users = initUsers();
    const updated = users.filter((u) => u.id !== userId);
    localStorage.setItem("comanda_users", JSON.stringify(updated));
    return { ok: true };
  }

  // ── Editar datos de usuario desde el admin ────────────────────────────────
  function adminUpdateUser(userId, data) {
    const users = initUsers();
    if (data.email) {
      const duplicate = users.find((u) => u.email === data.email && u.id !== userId);
      if (duplicate) return { ok: false, error: "El email ya está en uso." };
    }
    const updated = users.map((u) => (u.id === userId ? { ...u, ...data } : u));
    localStorage.setItem("comanda_users", JSON.stringify(updated));
    if (user && user.id === userId) {
      const newSession = { ...user, ...data };
      setUser(newSession);
      localStorage.setItem("comanda_session", JSON.stringify(newSession));
    }
    return { ok: true };
  }

  // ── Actualizar perfil de usuario ──────────────────────────────────────────
  function updateProfile(data) {
    const users = initUsers();
    const updated = users.map((u) =>
      u.id === user.id ? { ...u, ...data } : u
    );
    localStorage.setItem("comanda_users", JSON.stringify(updated));
    const newSession = { ...user, ...data };
    setUser(newSession);
    localStorage.setItem("comanda_session", JSON.stringify(newSession));
  }

  // ── Agregar reserva al usuario ────────────────────────────────────────────
  function addReserva(reserva) {
    if (!user) return;
    const users = initUsers();
    const updated = users.map((u) => {
      if (u.id !== user.id) return u;
      const existentes = u.reservas || [];
      // Evitar duplicados por id
      const yaExiste = existentes.some(r => r.id === reserva.id);
      const reservas = yaExiste ? existentes : [...existentes, reserva];
      return { ...u, reservas };
    });
    localStorage.setItem("comanda_users", JSON.stringify(updated));
    const current = updated.find((u) => u.id === user.id);
    setUser(current);
    localStorage.setItem("comanda_session", JSON.stringify(current));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        resetPassword,
        changeUserRole,
        deleteUser,
        adminUpdateUser,
        updateProfile,
        addReserva,
        isAdmin: user?.rol === "administrador",
        isPersonal: user?.rol === "personal",
        isUsuario: user?.rol === "usuario",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}