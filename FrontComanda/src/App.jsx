import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Register from './pages/Register';

export default function App() {
  const { register } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/*" element={<Register onRegister={register} />} />
      </Routes>
    </Router>
  );
}