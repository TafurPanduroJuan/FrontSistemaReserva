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

  // Función de Registro
  const register = ({ name, email, password }) => {
    const users = getUsers();
    if (users.find((u) => u.email === email))
      return { success: false, message: 'Este correo ya está registrado.' };
    
    const newUser = {
      id: Date.now().toString(),
      name, 
      email,
      password, // TODO: hashear al conectar API real
      rol: 'usuario',
    };

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    
    // Iniciar sesión automáticamente tras registro
    const session = { id: newUser.id, email: newUser.email, name: newUser.name, rol: newUser.rol };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    setCurrentUser(session);
    
    return { success: true };
  };

  // Función de Login
  const login = (email, password, rol = 'usuario') => {
    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);
    
    if (!user) return { success: false, message: 'Correo o contraseña incorrectos.' };
    
    if (user.rol && user.rol !== rol)
      return { success: false, message: `Esta cuenta no tiene acceso como ${rol}.` };
    
    const session = { id: user.id, email: user.email, name: user.name, rol: user.rol || rol };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    setCurrentUser(session);
    
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setCurrentUser(null);
  };

  // Exportamos todas las funciones necesarias
  return { currentUser, login, register, logout };
}