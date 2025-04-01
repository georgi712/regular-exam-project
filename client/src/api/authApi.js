import { useContext, useEffect, useState, useCallback } from "react";
import request from "../utils/request.js"
import { UserContext } from "../contexts/userContext.js";
import { useCreateUserProfile, useGetAddresses, useGetCart } from "./userProfileApi.js";
import useAuth from "../hooks/useAuth.js";

const baseUrl = 'http://localhost:3030/users';

export const useLogin = () => {
    const { userLoginHandler } = useAuth();
    const { getAddresses } = useGetAddresses();
    const { getCart } = useGetCart();
    
    const login = async (email, password) => {
        try {
            const result = await request.post(`${baseUrl}/login`, {email, password});
            const addressResult = await getAddresses(result);
            const cartResult = await getCart(result)
            
            if (!addressResult.success) {
                return {
                    success: true,
                    data: result,
                    warning: 'Logged in successfully, but failed to load your addresses.'
                };
            } 

            if (!cartResult.success) {
                return {
                    success: true,
                    data: result,
                    warning: 'Logged in successfully, but failed to load your cart.'
                };
            }

            userLoginHandler({
                ...result,
                ...addressResult.data,
                ...cartResult.data,
            })

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
            
            userLoginHandler(result);
            
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
    const [isLoggedOut, setIsLoggedOut] = useState(false);
    const [error, setError] = useState(null);

    const logout = useCallback(async () => {
        if (!accessToken) {
            setIsLoggedOut(true);
            return;
        }

        const options = {
            headers: {
                'X-Authorization': accessToken
            }
        };

        try {
            await request.get(`${baseUrl}/logout`, null, options);
            userLogoutHandler();
            setIsLoggedOut(true);
        } catch (err) {
            setError(err.message || 'Logout failed');
            console.error('Logout error:', err);
        }
    }, [accessToken, userLogoutHandler]);

    return {
        logout,
        isLoggedOut,
        error
    };
}

