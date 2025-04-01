import { Navigate } from "react-router-dom";
import { useLogout } from "../../api/authApi.js";
import { useEffect, useRef } from "react";

export default function Logout() {
    const { logout, isLoggedOut } = useLogout();
    const logoutAttemptedRef = useRef(false);
    
    useEffect(() => {
        if (!logoutAttemptedRef.current) {
            logoutAttemptedRef.current = true;
            logout();
        }
    }, [logout]);
   
    return isLoggedOut 
        ? <Navigate to="/"/>
        : <div className="flex justify-center items-center min-h-[300px]">
            <span className="loading loading-spinner loading-lg"></span>
          </div>;
}