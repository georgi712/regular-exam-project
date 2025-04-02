import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

export default function AuthGard({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Outlet />
    
}
