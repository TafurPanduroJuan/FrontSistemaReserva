import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';

const ROL_LABELS = {
  usuario:       'Cliente',
  personal:      'Personal',
  administrador: 'Administrador',
};

const ROL_ICONS = {
  usuario:       '👤',
  personal:      '🧑‍🍳',
  administrador: '🛡️',
};

export default function App() {
  const { currentUser, login, logout } = useAuth();

  if (currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#faf8f5',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        <div style={{
          textAlign: 'center',
          padding: '48px 44px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(26,35,50,0.08)',
          maxWidth: '380px',
          width: '100%',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            {ROL_ICONS[currentUser.rol] || '👤'}
          </div>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: 'rgba(232,71,10,0.1)',
            color: '#E8470A',
            borderRadius: '99px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            {ROL_LABELS[currentUser.rol] || currentUser.rol}
          </div>
          <h2 style={{ color: '#1a2332', fontSize: '22px', fontWeight: '600', marginBottom: '4px' }}>
            Bienvenido, {currentUser.name}
          </h2>
          <p style={{ color: 'rgba(26,35,50,0.5)', fontSize: '13px', marginBottom: '24px' }}>
            {currentUser.email}
          </p>
          <button onClick={logout} style={{
            padding: '10px 28px',
            background: '#E8470A',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontFamily: 'inherit',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}>
            Cerrar sesión
          </button>
        </div>
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