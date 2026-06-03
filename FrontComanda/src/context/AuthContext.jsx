import { createContext, useContext, useState } from "react";
import { apiFetch } from "../services/api";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("comanda_session");
    return saved ? JSON.parse(saved) : null;
  });

  // ── Normaliza la respuesta del backend al formato interno ─────────────────
  function normalizeSession(data) {
    return {
      id:     data.id,
      nombre: data.nombre || data.name || data.nombre, // backend devuelve 'nombre'
      email:  data.email,
      rol:    (data.role || data.rol || "usuario").toLowerCase(),
      token:  data.token,
      restaurante: data.restaurant || data.restaurante || null,
      avatar:      data.avatar     || null,
      telefono:    data.telefono   || null,
    };
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async function login(email, password) {
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const session = normalizeSession(data);
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
      const session = normalizeSession(data);
      setUser(session);
      localStorage.setItem("comanda_session", JSON.stringify(session));
      return { ok: true, user: session };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // ── Reset password (simulado — el backend no implementa email aún) ────────
  function resetPassword(email) {
    if (!email) return { ok: false, error: "Ingresa un email válido." };
    // Por ahora simplemente simulamos que el email existe
    // cuando el backend implemente la funcionalidad de email se conectará aquí
    return { ok: true };
  }

  // ── Cambiar rol de usuario (admin — llama al backend) ─────────────────────
  async function changeUserRole(userId, newRol, restaurante = null) {
    try {
      await apiFetch(`/api/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ rol: newRol, restaurante: restaurante || "" }),
      }, user?.token);

      // Si el usuario activo es el afectado, actualizar sesión
      if (user && user.id === userId) {
        const newSession = { ...user, rol: newRol, restaurante };
        setUser(newSession);
        localStorage.setItem("comanda_session", JSON.stringify(newSession));
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // ── Eliminar usuario (admin — llama al backend) ────────────────────────────
  async function deleteUser(userId) {
    try {
      await apiFetch(`/api/users/${userId}`, { method: "DELETE" }, user?.token);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // ── Actualizar perfil de usuario (PUT /api/users/me) ──────────────────────
  async function updateProfile(data) {
    try {
      const updated = await apiFetch(
        "/api/users/me",
        { method: "PUT", body: JSON.stringify(data) },
        user?.token
      );
      const newSession = {
        ...user,
        nombre: updated.name || updated.nombre || user.nombre,
        avatar: updated.avatar || user.avatar,
        telefono: updated.telefono || user.telefono,
      };
      setUser(newSession);
      localStorage.setItem("comanda_session", JSON.stringify(newSession));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user?.token || null,
        login,
        logout,
        register,
        resetPassword,
        changeUserRole,
        deleteUser,
        updateProfile,
        isAdmin:    user?.rol === "administrador",
        isPersonal: user?.rol === "personal",
        isUsuario:  user?.rol === "usuario",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
