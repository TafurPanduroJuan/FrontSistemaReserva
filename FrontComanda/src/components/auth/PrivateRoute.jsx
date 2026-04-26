import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

export default function PrivateRoute({ roles, children }) {
  const { currentUser } = useAuthContext();
  const location = useLocation();

  if (!currentUser)
    return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(currentUser.rol))
    return <Navigate to="/" replace />;
  return children;
}