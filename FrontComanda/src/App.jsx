import { useAuth } from './hooks/useAuth';
import Login from "./pages/Login";

export default function App() {
  const { currentUser, login, logout } = useAuth();

  if (currentUser) {
    return (
      <div style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0d0b08', color: '#f5f0e8',
        fontFamily: 'sans-serif', flexDirection: 'column', gap: '16px'
      }}>
        <h2>Bienvenido, {currentUser.name} ✦</h2>
        <p style={{ color: 'rgba(245,240,232,0.5)' }}>{currentUser.email}</p>
        <button onClick={logout} style={{
          padding: '8px 24px', background: 'none',
          border: '1px solid rgba(201,168,76,0.4)', borderRadius: '8px',
          color: '#c9a84c', cursor: 'pointer', marginTop: '8px'
        }}>
          Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <Login
      onLogin={login}
      onGoRegister={() => alert('Registro disponible en feature/register')}
    />
  );
}