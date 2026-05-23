import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Still checking auth state — render nothing to avoid flash
  if (user === undefined) return null;

  if (!user || !user.emailVerified) return <Navigate to="/login" replace />;

  return children;
}
