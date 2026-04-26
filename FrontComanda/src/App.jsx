import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './pages/auth/Register';
import './App.css';

// App temporal para desarrollo aislado de feature/register.
// Al mergear a dev, este App.jsx será reemplazado por el de dev.
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="*" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;