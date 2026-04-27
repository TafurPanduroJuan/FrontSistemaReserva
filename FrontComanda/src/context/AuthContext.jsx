import { createContext, useContext, useState, useEffect } from "react";

// ─── Usuarios de prueba precargados en localStorage ───────────────────────────
const DEFAULT_USERS = [
  {
    id: 1,
    nombre: "Admin Principal",
    email: "admin@comanda.com",
    password: "admin123",
    rol: "administrador",
    restaurante: null,
    avatar: null,
    fechaRegistro: "2024-01-01",
  },
  {
    id: 2,
    nombre: "Carlos Mesero",
    email: "personal@labellaitalia.com",
    password: "personal123",
    rol: "personal",
    restaurante: "La Bella Italia",
    avatar: null,
    fechaRegistro: "2024-03-15",
  },
  {
    id: 3,
    nombre: "María González",
    email: "usuario@gmail.com",
    password: "usuario123",
    rol: "usuario",
    restaurante: null,
    avatar: null,
    fechaRegistro: "2025-01-10",
    reservas: [
      {
        id: 101,
        restaurante: "La Bella Italia",
        fecha: "2025-05-10",
        hora: "20:00",
        personas: 2,
        estado: "confirmada",
      },
      {
        id: 102,
        restaurante: "Sushi Take",
        fecha: "2025-04-28",
        hora: "19:30",
        personas: 4,
        estado: "pendiente",
      },
    ],
    favoritos: ["La Bella Italia", "Le Petit Bistro"],
  },
];

// ─── Helper para inicializar usuarios en localStorage ────────────────────────
function initUsers() {
  const stored = localStorage.getItem("comanda_users");
  if (!stored) {
    localStorage.setItem("comanda_users", JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(stored);
}

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

  // ── Reset password: genera token simulado ────────────────────────────────
function resetPassword(email) {
  const users = initUsers();
  const found = users.find((u) => u.email === email);
  if (!found) return { ok: false, error: "No existe una cuenta con ese email." };

  // Genera un token aleatorio y lo guarda con expiración de 15 min
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiry = Date.now() + 15 * 60 * 1000; // 15 minutos

  const resetData = { email, token, expiry };
  localStorage.setItem("comanda_reset_token", JSON.stringify(resetData));

  // En producción aquí se enviaría el email. Simulamos mostrando el link en consola.
  console.info(`[DEV] Enlace de recuperación: /reset-password?token=${token}`);

  return { ok: true, token }; // devolvemos el token para mostrarlo en dev
}

// ── Confirmar nueva contraseña con token ──────────────────────────────────
function confirmResetPassword(token, newPassword) {
  const raw = localStorage.getItem("comanda_reset_token");
  if (!raw) return { ok: false, error: "El enlace no es válido o ya fue usado." };

  const { email, token: savedToken, expiry } = JSON.parse(raw);

  if (savedToken !== token)
    return { ok: false, error: "El enlace no es válido." };

  if (Date.now() > expiry)
    return { ok: false, error: "El enlace ha expirado. Solicita uno nuevo." };

  // Actualiza la contraseña del usuario
  const users = initUsers();
  const updated = users.map((u) =>
    u.email === email ? { ...u, password: newPassword } : u
  );
  localStorage.setItem("comanda_users", JSON.stringify(updated));

  // Invalida el token
  localStorage.removeItem("comanda_reset_token");

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
      const reservas = [...(u.reservas || []), { id: Date.now(), ...reserva }];
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