import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';

export default function App() {
  const { login } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Login onLogin={login} />} />
      </Routes>
    </Router>
  );
}