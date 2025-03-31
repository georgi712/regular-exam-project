import { Link } from 'react-router-dom';
import { useCart, useChangeQuantity, useRemoveFromCart, useClearCart } from '../../api/userProfileApi.js';
import { useState, useEffect } from 'react';

export default function Cart() {
  const { cartItems, loading, error, refreshCart } = useCart();
  const { changeQuantity, isUpdating } = useChangeQuantity();
  const { removeFromCart, isRemoving } = useRemoveFromCart();
  const { clearCart, isClearing } = useClearCart();
  const [updatingItems, setUpdatingItems] = useState({});
  const [removingItems, setRemovingItems] = useState({});
  const [localCartItems, setLocalCartItems] = useState([]);
  
  useEffect(() => {
    if (cartItems) {
      setLocalCartItems(cartItems);
    }
  }, [cartItems]);
  
  const subtotal = localCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = localCartItems.length > 0 ? 2.99 : 0;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;
  
  const handleIncreaseQuantity = async (productId, currentQuantity) => {
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      const newQuantity = currentQuantity + 1;
      const result = await changeQuantity(productId, newQuantity);
      
      if (result.success) {
        setLocalCartItems(prev => prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        ));
      } else {
        console.error(result.error);
        await refreshCart();
      }
    } catch (error) {
      console.error("Failed to increase quantity:", error);
      await refreshCart();
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };
  
  const handleDecreaseQuantity = async (productId, currentQuantity) => {
    if (currentQuantity <= 1) return;
    
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      const newQuantity = currentQuantity - 1;
      const result = await changeQuantity(productId, newQuantity);
      
      if (result.success) {
        setLocalCartItems(prev => prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        ));
      } else {
        console.error(result.error);
        await refreshCart();
      }
    } catch (error) {
      console.error("Failed to decrease quantity:", error);
      await refreshCart();
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };
  
  const handleQuantityChange = async (productId, event) => {
    const newQuantity = parseInt(event.target.value, 10);
    
    if (isNaN(newQuantity) || newQuantity < 1) return;
    
    setLocalCartItems(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
    
    setUpdatingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      const result = await changeQuantity(productId, newQuantity);
      
      if (!result.success) {
        console.error(result.error);
        // Refresh from server if the operation failed
        await refreshCart();
      }
    } catch (error) {
      console.error("Failed to update quantity:", error);
      await refreshCart();
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    setRemovingItems(prev => ({ ...prev, [productId]: true }));
    
    try {
      setLocalCartItems(prev => prev.filter(item => item.productId !== productId));
      
      const result = await removeFromCart(productId);
      
      if (!result.success) {
        console.error(result.error);
        await refreshCart();
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
      await refreshCart();
    } finally {
      setRemovingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        setLocalCartItems([]);
        
        const result = await clearCart();
        
        if (!result.success) {
          console.error(result.error);
          await refreshCart();
        }
      } catch (error) {
        console.error("Failed to clear cart:", error);
        await refreshCart();
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-base-content">Shopping Cart</h1>
                <p className="text-base-content/70 mt-2">
                  {localCartItems.length} {localCartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              {localCartItems.length > 0 && (
                <button
                  className="btn btn-ghost text-error hover:bg-error/10"
                  onClick={handleClearCart}
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Clearing...
                    </>
                  ) : 'Clear Cart'}
                </button>
              )}
            </div>

            {loading ? (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body flex justify-center items-center py-16">
                  <div className="loading loading-spinner loading-lg"></div>
                  <p className="mt-4 text-base-content/70">Loading your cart...</p>
                </div>
              </div>
            ) : localCartItems.length === 0 ? (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body text-center py-16">
                  <div className="bg-base-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-base-content/30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                  <p className="text-base-content/70 mb-8 max-w-md mx-auto">
                    Looks like you haven't added any items to your cart yet. Start shopping to add some delicious fruits!
                  </p>
                  <Link to="/products" className="btn btn-primary btn-lg">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="divide-y divide-base-200">
                    {localCartItems.map((item) => (
                      <div
                        key={item.productId}
                        className="flex flex-col sm:flex-row gap-6 items-center py-6 first:pt-0 last:pb-0"
                      >
                        <div className="relative group">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-28 h-28 object-cover rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300" />
                        </div>
                        <div className="flex-grow text-center sm:text-left">
                          <h3 className="font-bold text-xl">{item.name}</h3>
                          <p className="text-accent font-bold text-lg mt-1">
                            {item.price.toFixed(2)} лв
                          </p>
                          <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                            <button
                              className="btn btn-circle btn-sm btn-ghost hover:bg-base-200"
                              onClick={() => handleDecreaseQuantity(item.productId, item.quantity)}
                              disabled={updatingItems[item.productId] || item.quantity <= 1 || removingItems[item.productId] || isClearing}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.productId, e)}
                              className="input input-bordered w-20 text-center text-lg font-medium"
                              min="1"
                              disabled={updatingItems[item.productId] || removingItems[item.productId] || isClearing}
                            />
                            <button
                              className="btn btn-circle btn-sm btn-ghost hover:bg-base-200"
                              onClick={() => handleIncreaseQuantity(item.productId, item.quantity)}
                              disabled={updatingItems[item.productId] || removingItems[item.productId] || isClearing}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="font-bold text-xl mb-3">
                            {(item.price * item.quantity).toFixed(2)} лв
                          </p>
                          <button
                            className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                            onClick={() => handleRemoveItem(item.productId)}
                            disabled={removingItems[item.productId] || isClearing}
                          >
                            {removingItems[item.productId] ? (
                              <>
                                <span className="loading loading-spinner loading-xs mr-1"></span>
                                Removing...
                              </>
                            ) : 'Remove'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="card bg-base-100 shadow-lg sticky top-8">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-base-content/70">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(2)} лв</span>
                  </div>
                  <div className="flex justify-between text-base-content/70">
                    <span>Shipping</span>
                    <span>{shipping.toFixed(2)} лв</span>
                  </div>
                  <div className="flex justify-between text-base-content/70">
                    <span>Tax (10%)</span>
                    <span>{tax.toFixed(2)} лв</span>
                  </div>
                  <div className="divider my-2"></div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{total.toFixed(2)} лв</span>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    to="/checkout"
                    className="btn btn-primary btn-lg w-full mt-6"
                    disabled={localCartItems.length === 0 || isClearing}
                  >
                    Proceed to Checkout
                  </Link>

                  {/* Continue Shopping */}
                  <Link
                    to="/products"
                    className="btn btn-outline btn-lg w-full"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 