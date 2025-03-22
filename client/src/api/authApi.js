import { useContext, useEffect } from "react";
import request from "../utils/request.js"
import { UserContext } from "../contexts/userContext.js";

const baseUrl = 'http://localhost:3030/users';

export const useLogin = () => {
    const login = async (email, password) => {
        const result = await request.post(`${baseUrl}/login`, {email, password});
        
        return result;
    }

    return {
        login,
    }
}

export const useRegister = () => {
    const register =  async (email, password, username) => {
        const result = await request.post(`${baseUrl}/register`, {email, password, username, role: 'user'})

        return result;
    }

    return {
        register,
    }
}

export const useLogout = () => {
    const {accessToken, userLogoutHandler} = useContext(UserContext);

    useEffect(() => {
        if (!accessToken) {
            return;
        }
        const options = {
            headres: {
            'X-Authorization': accessToken
            }
        }

        request.get(`${baseUrl}/logout`, null, options)
            .then(userLogoutHandler)
    }, [accessToken, userLogoutHandler])

    return {
        isLoggedOut: !!accessToken,
    }
}

