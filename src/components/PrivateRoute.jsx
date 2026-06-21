import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Este componente es el equivalente al clásico guard de PHP:
//   if (!isset($_SESSION['user'])) { header('Location: login.php'); exit; }
// Si el usuario no está logueado, lo redirige a /login automáticamente.
export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
