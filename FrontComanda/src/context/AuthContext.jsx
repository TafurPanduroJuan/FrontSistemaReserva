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

  // ── Crear usuario desde el admin ──────────────────────────────────────────
function createUser({ nombre, email, password, rol, restaurante }) {
  const users = initUsers();
  if (users.find((u) => u.email === email))
    return { ok: false, error: "El email ya está registrado." };

  const newUser = {
    id: Date.now(),
    nombre,
    email,
    password,
    rol,
    restaurante: rol === "personal" ? restaurante : null,
    avatar: null,
    fechaRegistro: new Date().toISOString().split("T")[0],
    reservas: [],
    favoritos: [],
  };
  const updated = [...users, newUser];
  localStorage.setItem("comanda_users", JSON.stringify(updated));
  return { ok: true, user: newUser };
}

// ── Eliminar usuario ───────────────────────────────────────────────────────
function deleteUser(userId) {
  const users = initUsers();
  const updated = users.filter((u) => u.id !== userId);
  localStorage.setItem("comanda_users", JSON.stringify(updated));
  return { ok: true };
}

// ── Editar datos de usuario ────────────────────────────────────────────────
function adminUpdateUser(userId, data) {
  const users = initUsers();
  // Verificar email duplicado si se está cambiando
  if (data.email) {
    const duplicate = users.find((u) => u.email === data.email && u.id !== userId);
    if (duplicate) return { ok: false, error: "El email ya está en uso." };
  }
  const updated = users.map((u) => (u.id === userId ? { ...u, ...data } : u));
  localStorage.setItem("comanda_users", JSON.stringify(updated));

  // Si el usuario editado tiene sesión activa, sincronizarla
  if (user && user.id === userId) {
    const newSession = { ...user, ...data };
    setUser(newSession);
    localStorage.setItem("comanda_session", JSON.stringify(newSession));
  }
  return { ok: true };
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
        createUser,
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