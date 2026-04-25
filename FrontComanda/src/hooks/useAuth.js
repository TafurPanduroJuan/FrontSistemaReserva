import { useState } from 'react';

const AUTH_KEY  = 'comanda_auth_user';
const USERS_KEY = 'comanda_users';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const getUsers = () => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  };

  const login = (email, password, rol = 'usuario') => {
    const users = getUsers();
    const user  = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return { success: false, message: 'Correo o contraseña incorrectos.' };
    }
    if (user.rol && user.rol !== rol) {
      return { success: false, message: `Esta cuenta no tiene acceso como ${rol}.` };
    }
    const session = {
      id:    user.id,
      email: user.email,
      name:  user.name,
      rol:   user.rol || rol,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
  };

  return { currentUser, login, logout };
}