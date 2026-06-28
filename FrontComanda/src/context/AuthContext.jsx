import { createContext, useContext, useState } from "react";
import { apiFetch } from "../services/api";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("comanda_session");
    return saved ? JSON.parse(saved) : null;
  });

  function normalizeSession(data) {
    return {
      id:             data.id,
      nombre:         data.nombre || data.name,
      email:          data.email,
      rol:            (data.role || data.rol || "usuario").toLowerCase(),
      token:          data.token,
      restaurante:    data.restaurant || data.restaurante || null,
      avatar:         data.avatar     || null,
      telefono:       data.telefono   || null,
      googleEmail:    data.googleEmail || null,
      fechaRegistro:  data.fechaRegistro || data.createdAt || null,
    };
  }

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

  async function loginWithGoogle(idToken) {
    try {
      const data = await apiFetch("/api/auth/google", {
        method: "POST",
        body: JSON.stringify({ idToken }),
      });
      const session = normalizeSession(data);
      setUser(session);
      localStorage.setItem("comanda_session", JSON.stringify(session));
      return { ok: true, user: session };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("comanda_session");
  }

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

  async function forgotPassword(email) {
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function resetPassword(token, newPassword) {
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function changeUserRole(userId, newRol, restaurante = null) {
    try {
      await apiFetch(`/api/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ rol: newRol, restaurante: restaurante || "" }),
      }, user?.token);
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

  async function deleteUser(userId) {
    try {
      await apiFetch(`/api/users/${userId}`, { method: "DELETE" }, user?.token);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  async function updateProfile(data) {
    try {
      const updated = await apiFetch(
        "/api/users/me",
        { method: "PUT", body: JSON.stringify(data) },
        user?.token
      );
      const newSession = {
        ...user,
        nombre:        updated.name || updated.nombre || user.nombre,
        avatar:        updated.avatar !== undefined ? updated.avatar : user.avatar,
        telefono:      updated.telefono  || user.telefono,
        googleEmail:   updated.googleEmail ?? user.googleEmail,
        fechaRegistro: user.fechaRegistro,
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
        loginWithGoogle,
        logout,
        register,
        forgotPassword,
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