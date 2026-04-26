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

  const register = ({ name, email, password }) => {
    const users = getUsers();
    if (users.find((u) => u.email === email))
      return { success: false, message: 'Este correo ya está registrado.' };
    const newUser = {
      id: Date.now().toString(),
      name, email,
      password, // TODO: hashear al conectar API real
      rol: 'usuario',
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    const session = { id: newUser.id, email: newUser.email, name: newUser.name, rol: newUser.rol };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    setCurrentUser(session);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
  };

  return { currentUser, register, logout };
}