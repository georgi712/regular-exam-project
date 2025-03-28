import { useContext, useEffect } from "react";
import request from "../utils/request.js"
import { UserContext } from "../contexts/userContext.js";
import { useCreateUserProfile, useGetAddresses } from "./userProfileApi.js";

const baseUrl = 'http://localhost:3030/users';

export const useLogin = () => {
    const { userLoginHandler } = useContext(UserContext);
    const { getAddresses } = useGetAddresses();
    
    const login = async (email, password) => {
        try {
            const result = await request.post(`${baseUrl}/login`, {email, password});
            
            // First update auth state with just the login data
            userLoginHandler(result);
            
            // Then fetch addresses and update auth state with complete data
            // Pass the auth data directly to getAddresses
            const addressResult = await getAddresses(result);
            
            if (!addressResult.success) {
                return {
                    success: true,
                    data: result,
                    warning: 'Logged in successfully, but failed to load your addresses.'
                };
            }
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    }

    return {
        login,
    }
}

export const useRegister = () => {
    const { userLoginHandler } = useContext(UserContext);
    const { createUserProfile } = useCreateUserProfile();
    
    const register = async (email, password, username) => {
        try {
            const result = await request.post(`${baseUrl}/register`, {email, password, username, role: 'User'});
            
            // Update auth state with the registration data
            userLoginHandler(result);
            
            // Create user profile with empty addresses
            const profileResult = await createUserProfile(result.accessToken);
            
            if (!profileResult.success) {
                return {
                    success: true,
                    data: result,
                    warning: 'Registered successfully, but failed to create your profile.'
                };
            }
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'Registration failed'
            };
        }
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
            headers: {
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

