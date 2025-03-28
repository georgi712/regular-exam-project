import useAuth from "../hooks/useAuth.js"
import { useState } from "react";

const baseUrl = 'http://localhost:3030/data/user_profiles'

export const useCreateUserProfile = () => {
    const {request, addresses, cart} = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    
    const createUserProfile = async (accessToken) => {
        setIsCreating(true);
        setError(null);
        
        try {
            const userProfileData = {};

            const options = {
                headers: {
                    'X-Authorization': accessToken
                }
            }

            if (addresses) {
                userProfileData.addresses = addresses
            }
            if (cart) {
                userProfileData.cart = cart
            }
            
            const result = await request.post(baseUrl, userProfileData, options);
            return { success: true, data: result };
        } catch (err) {
            setError(err.message || 'Failed to create user profile');
            return { success: false, error: err.message || 'Failed to create user profile' };
        } finally {
            setIsCreating(false);
        }
    }

    return {
        createUserProfile,
        isCreating,
        error
    }
}