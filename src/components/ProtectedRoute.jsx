import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/** Guards a route by auth and (optionally) a set of allowed roles. */
export default function ProtectedRoute({ roles, children }) {
  const { isAuthed, role } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
