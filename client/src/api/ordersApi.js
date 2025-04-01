import { useState, useEffect, use } from 'react';
import useAuth from '../hooks/useAuth.js';

const baseUrl = 'http://localhost:3030/data/orders';

export const useCreateOrder = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const { _id: userId, email, request } = useAuth();

  const createOrder = async (orderData) => {
    if (!userId) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsCreating(true);
    setError(null);

    try {
      const order = {
        userInfo: {
          email,
          firstName: orderData.firstName,
          lastName: orderData.lastName,
          phone: orderData.phone
        },
        address: orderData.address,
        deliveryNotes: orderData.notes || '',
        items: orderData.items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        payment: {
          method: orderData.paymentMethod
        },
        pricing: {
          subtotal: orderData.subtotal,
          deliveryFee: orderData.deliveryFee,
          tax: orderData.tax,
          total: orderData.total
        },
        deliveryOption: orderData.deliveryOption,
        status: 'pending'
      };

      if (orderData.paymentMethod === 'card' && orderData.cardNumber && orderData.cardName) {
        order.payment.cardDetails = {
          lastFour: orderData.cardNumber.slice(-4),
          nameOnCard: orderData.cardName
        };
      }

      const result = await request.post(baseUrl, order);
      
      return { success: true, data: result };
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'An error occurred while creating the order');
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  };

  return { createOrder, isCreating, error };
};

export const useGetUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { _id: userId, request } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchOrders = async () => {
      if (!userId) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await request.get(`${baseUrl}?_ownerId=${userId}`);
        
        if (isMounted) {
          setOrders(result || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        if (isMounted) {
          setError(err.message || 'An error occurred while fetching orders');
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [userId]); 

  return { orders, loading, error };
};

export const useGetAllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { request, role } = useAuth();
  const [count, setCount] = useState(0)

  useEffect(() => {
    let isMounted = true;
    
    const fetchAllOrders = async () => {
      if (role !== 'Admin') {
        setError('Unauthorized access');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await request.get(baseUrl);
        
        if (isMounted) {
          setOrders(result || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching all orders:', err);
        if (isMounted) {
          setError(err.message || 'An error occurred while fetching orders');
          setLoading(false);
        }
      }
    };

    fetchAllOrders();
    return () => {
      isMounted = false;
    };
  }, [role]);

  return { orders, loading, error };
};

export const useUpdateOrderStatus = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const { request, role } = useAuth();

  const updateOrderStatus = async (orderId, newStatus) => {
    if (role !== 'Admin') {
      return { success: false, error: 'Unauthorized access' };
    }

    setIsUpdating(true);
    setError(null);

    try {
      console.log(`Fetching order ${orderId} for status update to ${newStatus}`);
      const order = await request.get(`${baseUrl}/${orderId}`);
      
      if (!order) {
        throw new Error('Order not found');
      }

      
      const updatedOrder = {
        status: newStatus
      };

      
      const adminHeaders = {
        'X-Admin': 'true'
      };
      
      try {
        const result = await request.patch(`${baseUrl}/${orderId}`, updatedOrder, { headers: adminHeaders });
        return { success: true, data: result };
      } catch (patchErr) {
        
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message || 'An error occurred while updating order status');
      return { success: false, error: err.message };
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateOrderStatus, isUpdating, error };
};