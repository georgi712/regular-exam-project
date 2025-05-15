import { useContext, useEffect, useState, useCallback } from "react";
import request from "../utils/request.js"
import { UserContext } from "../contexts/userContext.js";
import { useCreateUserProfile, useGetAddresses, useGetCart } from "./userProfileApi.js";
import useAuth from "../hooks/useAuth.js";
import { useNavigate } from "react-router-dom";
import { useToastContext } from "../contexts/ToastContext.jsx";

const baseUrl = `${import.meta.env.VITE_APP_SERVER_URL}/users`;

export const useLogin = () => {
    const { userLoginHandler } = useAuth();
    const { getAddresses } = useGetAddresses();
    const { getCart } = useGetCart();
    
    
    const login = async (email, password) => {
        try {
            const result = await request.post(`${baseUrl}/login`, {email, password});
            const addressResult = await getAddresses(result);
            const cartResult = await getCart(result)
            
            if (result.code >= 400) {
                throw new Error(result.message)
            }

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
    const navigate = useNavigate();
    const toast = useToastContext();

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
            const response = await fetch(`${baseUrl}/logout`, options);
            if (response.code === 403) {
                toast.error('Unable to logout');
                return navigate('/');
            }
            userLogoutHandler();
            setIsLoggedOut(true);
        } catch (err) {
            toast.error(err.message || 'Logout failed');
        }
    }, [accessToken, userLogoutHandler]);

    return {
        logout,
        isLoggedOut,
        error
    };
}

