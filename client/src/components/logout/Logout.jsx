import { Navigate } from "react-router-dom";
import { useLogout } from "../../api/authApi.js";

export default function Logout() {
    const {isLoggedOut} = useLogout();
  
    return isLoggedOut
        ? <Navigate to="/"/>
        : null; //TODO: Set spinner
}