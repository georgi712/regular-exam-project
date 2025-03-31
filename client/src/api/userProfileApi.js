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

  const createUserProfile = async (accessToken) => {
    setIsCreating(true);
    setError(null);

        const options = {
            headers: {
                'X-Authorization': accessToken
            }
        }

    try {
      const profileData = {
        _ownerId: userId,
        addresses: addresses || [],
        cart: cart || []
      };
      
      const result = await request.post(`${baseUrl}`, profileData, options);
      
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
    setCartItems(cart?.length);
    setCartPrice(cart?.reduce((acc, cartItem) => acc + Number(cartItem.price), 0))
  }, [cart])

  return {
    cartItems,
    cartPrice
  }
}

export const useAddToCart = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { _id: userId, cart, userLoginHandler, request } = useAuth();
  const { createUserProfile } = useCreateUserProfile();

  const updateCartHandler = async (productId, quantity, price, imageUrl, name) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsUpdating(true);

    try {
      const profile = await findUserProfile(userId, request);

      if (!profile) {
        return { success: false, error: 'User profile not found' };
      }

      let updatedCart = profile.cart ? [...profile.cart] : [];

      const existingProduct = updatedCart.find(item => item.productId === productId);

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        updatedCart.push({ productId, quantity, price, imageUrl, name });
      }

      const updatedUser = { ...profile, cart: updatedCart };
      const updateResult = await request.put(`${baseUrl}/${profile._id}`, updatedUser);

      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const newAuthData = { ...authData, cart: updatedCart };
      userLoginHandler(newAuthData);

      return { success: true, data: updateResult };
    } catch (err) {
      console.error('Error updating cart:', err);
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateCartHandler };
};

export const useCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { _id: userId, request } = useAuth();

  const fetchCart = async () => {
    if (!userId) {
      setLoading(false);
      setError("User not authenticated");
      return;
    }
    
    try {
      setLoading(true);
      
      const profile = await findUserProfile(userId, request);

      if (!profile) {
        setCartItems([]);
        setError('User profile not found');
        return;
      }

      const response = await request.get(
        `${baseUrl}/${profile._id}`
      );

      if (!response || !response.cart) {
        setCartItems([]);
        return;
      }

      const formattedCart = response.cart.map(item => ({
        productId: item?.productId,
        name: item?.name || "Unknown Product",
        imageUrl: item?.imageUrl || "",
        quantity: item?.quantity,
        price: item?.price || 0
      }));

      setCartItems(formattedCart);
      setError(null);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err.message || "Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [userId]);

  return { cartItems, loading, error };
export const useChangeQuantity = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const { _id: userId, cart, userLoginHandler, request } = useAuth();

  const changeQuantity = async (productId, newQuantity) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    if (newQuantity < 1) {
      return { success: false, error: 'Quantity must be at least 1' };
    }

    setIsUpdating(true);
    setError(null);

    try {
      const profile = await findUserProfile(userId, request);

      if (!profile) {
        throw new Error('User profile not found');
      }

      let updatedCart = profile.cart ? [...profile.cart] : [];
      
      const productIndex = updatedCart.findIndex(item => item.productId === productId);
      
      if (productIndex === -1) {
        throw new Error('Product not found in cart');
      }
      
      updatedCart[productIndex] = {
        ...updatedCart[productIndex],
        quantity: newQuantity
      };

      const updateResult = await request.put(`${baseUrl}/${profile._id}`, {
        ...profile,
        cart: updatedCart
      });

      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const updatedAuthData = {
        ...authData,
        cart: updatedCart
      };
      
      userLoginHandler(updatedAuthData);

      return { success: true, data: updateResult };
    } catch (err) {
      console.error('Error changing quantity:', err);
      setError(err.message || 'Failed to update quantity');
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };

  return { changeQuantity, isUpdating, error };
};
export const useRemoveFromCart = () => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState(null);
  const { _id: userId, userLoginHandler, request } = useAuth();
  
  const removeFromCart = async (productId) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }
    
    setIsRemoving(true);
    setError(null);
    
    try {
      const profile = await findUserProfile(userId, request);
      
      if (!profile) {
        throw new Error('User profile not found');
      }
      
      const updatedCart = profile.cart.filter(item => item.productId !== productId);
      
      const updateResult = await request.put(`${baseUrl}/${profile._id}`, {
        ...profile,
        cart: updatedCart
      });
      
      const authData = JSON.parse(localStorage.getItem('auth') || '{}');
      const updatedAuthData = {
        ...authData,
        cart: updatedCart
      };
      
      userLoginHandler(updatedAuthData);
      
      return { success: true, data: updateResult };
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError(err.message || 'Failed to remove item from cart');
      return { success: false, error: err.message };
    } finally {
      setIsRemoving(false);
    }
  };
};