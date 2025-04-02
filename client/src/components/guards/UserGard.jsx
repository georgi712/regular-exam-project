import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

export default function UserGard({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return <Outlet />
    
}
