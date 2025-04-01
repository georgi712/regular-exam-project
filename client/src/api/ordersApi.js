import { useState, useEffect } from 'react';
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
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [userId]); // Remove 'request' from dependencies if it changes on each render

  return { orders, loading, error };
};