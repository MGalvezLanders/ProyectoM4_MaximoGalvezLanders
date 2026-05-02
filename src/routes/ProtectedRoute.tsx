import type { JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/Authenticator";

function ProtectedRoute({ children }: { children: JSX.Element }): JSX.Element {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
