import { createContext, useContext, useState, useEffect } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("comanda_session");
    return saved ? JSON.parse(saved) : null;
  });

  // Sincroniza la sesión activa si el admin cambió el rol de este usuario
  useEffect(() => {
    if (!user) return;
    const users = initUsers();
    const updated = users.find((u) => u.id === user.id);
    if (updated && updated.rol !== user.rol) {
      const newSession = { ...updated };
      setUser(newSession);
      localStorage.setItem("comanda_session", JSON.stringify(newSession));
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  function login(email, password) {
    const users = initUsers();
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) return { ok: false, error: "Credenciales incorrectas." };
    setUser(found);
    localStorage.setItem("comanda_session", JSON.stringify(found));
    return { ok: true, user: found };
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  function logout() {
    setUser(null);
    localStorage.removeItem("comanda_session");
  }

  // ── Registro ───────────────────────────────────────────────────────────────
  function register({ nombre, email, password }) {
    const users = initUsers();
    if (users.find((u) => u.email === email))
      return { ok: false, error: "El email ya está registrado." };
    const newUser = {
      id: Date.now(),
      nombre,
      email,
      password,
      rol: "usuario",
      restaurante: null,
      avatar: null,
      fechaRegistro: new Date().toISOString().split("T")[0],
      reservas: [],
      favoritos: [],
    };
    const updated = [...users, newUser];
    localStorage.setItem("comanda_users", JSON.stringify(updated));
    setUser(newUser);
    localStorage.setItem("comanda_session", JSON.stringify(newUser));
    return { ok: true, user: newUser };
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

  // ── Escuchar actualizaciones de estado desde la intranet ──────────────────
  useEffect(() => {
    function handleReservaActualizada(e) {
      if (!user) return;
      const { reservaId, nuevoEstado } = e.detail || {};
      if (!reservaId || !nuevoEstado) return;
      setUser(prev => {
        if (!prev) return prev;
        const updatedReservas = (prev.reservas || []).map(r =>
          r.id === reservaId ? { ...r, estado: nuevoEstado } : r
        );
        const updated = { ...prev, reservas: updatedReservas };
        localStorage.setItem("comanda_session", JSON.stringify(updated));
        return updated;
      });
    }
    window.addEventListener("comanda_reserva_actualizada", handleReservaActualizada);
    return () => window.removeEventListener("comanda_reserva_actualizada", handleReservaActualizada);
  }, [user]);

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