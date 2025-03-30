import { useEffect, useState } from 'react';
import useAuth from '../hooks/useAuth.js';

const baseUrl = 'http://localhost:3030/data/user_profiles'

const findUserProfile = async (userId, request) => {
  if (!userId) {
    throw new Error('User not authenticated');
  }

  const searchQuery = encodeURIComponent(`_ownerId="${userId}"`);
  const profiles = await request.get(`${baseUrl}?where=${searchQuery}`);
  return profiles.length > 0 ? profiles[0] : null;
};

export const updateUserStorage = (updatedAddresses, authData, userLoginHandler) => {
  const updatedAuthData = {
    ...authData,
    addresses: updatedAddresses
  };
  userLoginHandler(updatedAuthData);
};

export const useCreateUserProfile = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const { _id: userId, addresses, cart, request } = useAuth();

  const createUserProfile = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const profileData = {
        _ownerId: userId,
        addresses: addresses || [],
        cart: cart || []
      };
      
      const result = await request.post(`${baseUrl}`, profileData);
      
      console.log('Profile created:', result);
      
      return { success: true, data: result };
    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err.message || 'An error occurred while creating profile');
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  };
  
  return { createUserProfile, isCreating, error };
};

export const useUpdateAddress = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { _id: userId, addresses, userLoginHandler, request } = useAuth();
  const { createUserProfile } = useCreateUserProfile();
  
  const updateAddress = async (newAddress) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    setIsUpdating(true);
    
    try {
      const profile = await findUserProfile(userId, request);
      
      if (!profile) {
        const updatedAddresses = addresses
          ? addresses.map(addr => ({ ...addr, isDefault: false }))
          : [];
        
        updatedAddresses.push({ ...newAddress, isDefault: true });
        
        const authData = JSON.parse(localStorage.getItem('auth') || '{}');
        updateUserStorage(updatedAddresses, authData, userLoginHandler);
        
        const createResult = await createUserProfile();
        
        setIsUpdating(false);
        return createResult;
      }
      
      const updatedAddresses = profile.addresses
        ? profile.addresses.map(addr => ({ ...addr, isDefault: false }))
        : [];
      
      updatedAddresses.push({ ...newAddress, isDefault: true });
      
      const updateResult = await request.patch(`${baseUrl}/${profile._id}`, {
        addresses: updatedAddresses
      });
      
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      updateUserStorage(updatedAddresses, authData, userLoginHandler);
      
      return { success: true, data: updateResult };
    } catch (err) {
      console.error('Error updating address:', err);
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { updateAddress, isUpdating };
};

export const useSetDefaultAddress = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { _id: userId, userLoginHandler, request } = useAuth();
  
  const setDefaultAddress = async (addressToSetDefault) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    setIsUpdating(true);
    
    try {
      const profile = await findUserProfile(userId, request);
      
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      const updatedAddresses = profile.addresses.map(addr => ({
        ...addr,
        isDefault: addr.address === addressToSetDefault.address
      }));
      
      const updateResult = await request.patch(`${baseUrl}/${profile._id}`, {
        addresses: updatedAddresses
      });
      
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      
      const updatedAuthData = {
        ...authData,
        addresses: updatedAddresses
      };
      localStorage.setItem('auth', JSON.stringify(updatedAuthData));
      
      setTimeout(() => {
        userLoginHandler(updatedAuthData);
      }, 0);
      
      return { success: true, data: updateResult };
    } catch (err) {
      console.error('Error setting default address:', err);
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };
  
  return { setDefaultAddress, isUpdating };
};

export const useDeleteAddress = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { _id: userId, userLoginHandler, request } = useAuth();
  
  const deleteAddress = async (addressToDelete) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    setIsDeleting(true);
    
    try {
      const profile = await findUserProfile(userId, request);
      
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      const remainingAddresses = profile.addresses.filter(
        addr => addr.address !== addressToDelete.address
      );
      
      const updatedAddresses = remainingAddresses.length > 0 
        ? [{ ...remainingAddresses[0], isDefault: true }, ...remainingAddresses.slice(1).map(addr => ({ ...addr, isDefault: false }))]
        : [];
      
      const updateResult = await request.patch(`${baseUrl}/${profile._id}`, {
        addresses: updatedAddresses
      });
      
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      updateUserStorage(updatedAddresses, authData, userLoginHandler);
      
      return { success: true, data: updateResult };
    } catch (err) {
      console.error('Error deleting address:', err);
      return { success: false, error: err.message };
    } finally {
      setIsDeleting(false);
    }
  };
  
  return { deleteAddress, isDeleting };
};

export const useGetAddresses = () => {
  const { request } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getAddresses = async (authData) => {
    const { _id, accessToken } = authData;
    
    if (!_id) {
      return { 
        success: false, 
        error: 'User not authenticated or missing user ID' 
      };
    }
    
    const options = {
        headers: {
            'X-Authorization': accessToken,
        }
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const searchQuery = encodeURIComponent(`_ownerId="${_id}"`);
      const userProfiles = await request.get(`${baseUrl}?where=${searchQuery}`, null, options);
      
      if (!userProfiles || userProfiles.length === 0) {
        return { 
          success: true, 
          data: { addresses: [] } 
        };
      }
      
      const userProfile = userProfiles[0];
      const addresses = userProfile.addresses || [];
      
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
};
 
export const useGetCart = () => {
  const { request } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const getCart = async (authData) => {
    const { _id, accessToken } = authData;
    
    if (!_id) {
      return { 
        success: false, 
        error: 'User not authenticated or missing user ID' 
      };
    }
    
    const options = {
        headers: {
            'X-Authorization': accessToken,
        }
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const searchQuery = encodeURIComponent(`_ownerId="${_id}"`);
      const userProfiles = await request.get(`${baseUrl}?where=${searchQuery}`, null, options);
      
      if (!userProfiles || userProfiles.length === 0) {
        return { 
          success: true, 
          data: { addresses: [] } 
        };
      }
      
      const userProfile = userProfiles[0];
      const cart = userProfile.cart || [];
      
      return { 
        success: true, 
        data: { cart } 
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
    getCart,
    isLoading,
    error
  };
};

export const useCartInfo = () => {
  const { cart } = useAuth()
  const [cartItems, setCartItems] = useState('');
  const [cartPrice, setCartPrice] = useState('');
  
  useEffect(() => {
    setCartItems(cart.length);
    setCartPrice(cart.reduce((acc, cartItem) => acc + Number(cartItem.price), 0))
  }, [cart])

  return {
    cartItems,
    cartPrice
  }
}