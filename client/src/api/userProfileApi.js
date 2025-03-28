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

export const useGetAddresses = () => {
    const { request, userLoginHandler } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    
    const getAddresses = async (authData) => {
        // Get required data from parameters instead of useAuth
        const { _id, accessToken } = authData;
        
        if (!_id || !accessToken) {
            return { 
                success: false, 
                error: 'User not authenticated or missing user ID' 
            };
        }
        
        setIsLoading(true);
        setError(null);
        
        try {
            const searchQuery = encodeURIComponent(`_ownerId="${_id}"`);
            
            const options = {
                headers: {
                    'X-Authorization': accessToken
                }
            };
            
            const userProfiles = await request.get(`${baseUrl}?where=${searchQuery}`, null, options);
            
            if (!userProfiles || userProfiles.length === 0) {
                return { 
                    success: true, 
                    data: { addresses: [] } 
                };
            }
            
            const userProfile = userProfiles[0];
            const addresses = userProfile.addresses || [];
            
            const updatedAuthData = {
                ...authData,
                addresses: addresses
            };
            
            localStorage.setItem('auth', JSON.stringify(updatedAuthData));
            
            userLoginHandler(updatedAuthData);
            
            return { 
                success: true, 
                data: { addresses } 
            };
        } catch (error) {
            setError(error.message || 'Failed to fetch addresses');
            return { 
                success: false, 
                error: error.message || 'Failed to fetch addresses' 
            };
        } finally {
            setIsLoading(false);
        }
    };
    
    return {
        getAddresses,
        isLoading,
        error
    };
}

export const useUpdateAddress = () => {
    const { request, _id, accessToken, addresses } = useAuth();
    const { createUserProfile, isCreating } = useCreateUserProfile();
    const [isUpdating, setIsUpdating] = useState(false);
    
    const updateAddress = async (addressData) => {
        if (!_id || !accessToken) {
            return { 
                success: false, 
                error: 'User not authenticated or missing user ID' 
            };
        }
        
        setIsUpdating(true);
        
        try {
            const searchQuery = encodeURIComponent(`_ownerId="${_id}"`);
            
            // Create options object with headers properly formatted
            const options = {
                headers: {
                    'X-Authorization': accessToken
                }
            };
            
            // Pass null as second parameter, options as third
            const userProfiles = await request.get(`${baseUrl}?where=${searchQuery}`, null, options);
            
            if (!userProfiles || userProfiles.length === 0) {
                
                if (addresses) {
                    const updatedAddresses = [
                        ...(addresses || []).map(addr => ({...addr, isDefault: false})),
                        {
                            address: addressData.address,
                            isDefault: true
                        }
                    ];
                    localStorage.setItem('auth', JSON.stringify({
                        ...JSON.parse(localStorage.getItem('auth') || '{}'),
                        addresses: updatedAddresses
                    }));
                }
                
                const profileResult = await createUserProfile(accessToken);
                
                if (!profileResult.success) {
                    return {
                        success: false,
                        error: profileResult.error || 'Failed to create profile'
                    };
                }
                
                return { 
                    success: true, 
                    data: { message: 'Profile created successfully with address' } 
                };
            }
            
            const userProfile = userProfiles[0];
            const profileId = userProfile._id;
            
            const existingAddresses = userProfile.addresses 
                ? userProfile.addresses.map(addr => ({...addr, isDefault: false}))
                : [];
            
            const updatedAddresses = [
                ...existingAddresses,
                {
                    address: addressData.address,
                    isDefault: true
                }
            ];
            
            // Pass data as second parameter, options as third
            const result = await request.patch(`${baseUrl}/${profileId}`, 
                { addresses: updatedAddresses }, 
                options
            );
            
            return { success: true, data: result };
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Failed to update address' 
            };
        } finally {
            setIsUpdating(false);
        }
    };

    return {
        updateAddress,
        isLoading: isUpdating || isCreating
    };
}