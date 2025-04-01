import { Navigate } from "react-router-dom";
import { useLogout } from "../../api/authApi.js";
import { useToastContext } from "../../contexts/ToastContext.jsx";
import { useEffect } from "react";

export default function Logout() {
    const { isLoggedOut, isLoggingOut, error } = useLogout();
    const toast = useToastContext();
    
    useEffect(() => {
        if (isLoggingOut) {
            toast.info("Logging out...");
        }
        
        if (isLoggedOut) {
            toast.success("Successfully logged out");
        }
        
        if (error) {
            toast.error(`Logout failed: ${error}`);
        }
    }, [isLoggingOut, isLoggedOut, error, toast]);
  
   
    return (isLoggedOut || error)
        ? <Navigate to="/"/>
        : <div className="flex justify-center items-center min-h-[300px]">
            <span className="loading loading-spinner loading-lg"></span>
          </div>;
}