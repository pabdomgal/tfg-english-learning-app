import { Navigate } from "react-router-dom";
import { useMemo } from "react";
import { getActiveUser } from "../services/storage";

export default function ProtectedRoute({
  children,
  requireUser = false,
  requireLevel = false,
}) {
  // Memo para estabilidad
  const { user } = useMemo(() => getActiveUser(), []);

  // No hay usuario
  if (requireUser && !user) {
    return <Navigate to="/start" replace />;
  }

  // No hay nivel
  if (requireLevel && (!user || !user.level)) {
    return <Navigate to="/level" replace />;
  }

  // OK
  return children;
}