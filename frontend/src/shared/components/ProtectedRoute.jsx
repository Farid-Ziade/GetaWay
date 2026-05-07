import { Navigate } from "react-router-dom";

import { useAuth } from "../../features/auth/services/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <p>Checking session...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
