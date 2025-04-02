import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

export default function AdminGuard({ children }) {
  const { role } = useAuth();

  if ( role !== 'Admin') {
    return <Navigate to="/login" />;
  }

  return <Outlet />
    
}