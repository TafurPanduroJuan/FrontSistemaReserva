import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import './App.css';

// App temporal para desarrollo aislado de feature/login.
// Al mergear a dev, este App.jsx será reemplazado por el de dev
// que incluye todas las rutas, AuthProvider, PrivateRoute e intranet.
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;