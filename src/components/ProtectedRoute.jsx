import { Navigate } from "react-router-dom";
import { getActiveUser } from "../services/storage";

export default function ProtectedRoute({ children }) {
  const { user } = getActiveUser();

  // Si no hay usuario o no tiene nivel seleccionado
  if (!user || !user.level) {
    return <Navigate to="/start" replace />;
  }

  return children;
}
