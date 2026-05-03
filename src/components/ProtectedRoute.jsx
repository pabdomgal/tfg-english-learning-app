import { Navigate } from "react-router-dom";
import { getActiveUser } from "../services/storage";

export default function ProtectedRoute({
  children,
  requireUser = false,
  requireLevel = false,
}) {
  const { user } = getActiveUser();

  if (requireUser && !user) {
    return <Navigate to="/start" replace />;
  }

  if (requireLevel && (!user || !user.level)) {
    return <Navigate to="/level" replace />;
  }

  return children;
}