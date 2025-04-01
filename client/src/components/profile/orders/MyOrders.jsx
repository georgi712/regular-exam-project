import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetUserOrders } from '../../../api/ordersApi';

// Format date using native JavaScript
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const MyOrders = () => {
  const { orders, loading, error } = useGetUserOrders();
  const [expandedOrder, setExpandedOrder] = useState(null);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col justify-center items-center min-h-[400px] bg-base-100 rounded-lg shadow-sm p-8">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <p className="text-base-content/70 animate-pulse">Loading your orders...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-error shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <div>
            <h3 className="font-bold">We couldn't load your orders</h3>
            <p className="text-sm">Error: {error}</p>
          </div>
        </div>
      );
    }

    if (!orders.length) {
      return (
        <div className="text-center py-12 px-4 bg-base-100 rounded-lg shadow-sm">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-3">No Orders Yet</h2>
          <p className="text-base-content/70 max-w-md mx-auto mb-6">
            Looks like you haven't placed any orders yet. Check out our products and get started!
          </p>
          <a href="/shop" className="btn btn-primary">Browse Products</a>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Your Order History</h2>
            <p className="text-base-content/70 mt-1">View and track all your previous orders</p>
          </div>
          <div className="badge badge-primary p-3 font-medium">{orders.length} Order{orders.length !== 1 ? 's' : ''}</div>
        </div>

        {orders.map((order) => (
          <div key={order._id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-base-300">
            {/* Order header - always visible */}
            <div 
              className="card-body p-5 cursor-pointer"
              onClick={() => toggleOrderDetails(order._id)}
            >
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 rounded-full p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Order #{order._id}</h3>
                    <p className="text-base-content/70 text-sm">
                      {formatDate(order._createdOn)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-bold">${order.pricing.total.toFixed(2)}</p>
                  <div className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </div>
                  <span className="text-primary">
                    {expandedOrder === order._id ? 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg> : 
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Order details - only visible when expanded */}
            {expandedOrder === order._id && (
              <div className="border-t border-base-300 animate-fadeIn">
                {/* Order items */}
                <div className="p-5">
                  <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Order Items
                  </h4>
                  <div className="space-y-5">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 bg-base-200 rounded-lg p-3 hover:bg-base-300 transition-colors">
                        <div className="avatar">
                          <div className="w-20 h-20 rounded-lg border border-base-300 overflow-hidden bg-white">
                            <img src={item.imageUrl} alt={item.name} className="object-contain" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-base">{item.name}</h5>
                          <div className="grid grid-cols-2 gap-x-4 mt-1">
                            <p className="text-base-content/70 text-sm">
                              Quantity: <span className="font-medium">{item.quantity}</span>
                            </p>
                            <p className="text-base-content/70 text-sm">
                              Price: <span className="font-medium">${item.price.toFixed(2)}</span>
                            </p>
                            <p className="text-base-content/70 text-sm col-span-2">
                              Subtotal: <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order summary */}
                <div className="bg-base-200 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-10">
                    {/* Delivery information */}
                    <div>
                      <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Delivery Information
                      </h4>
                      <div className="bg-base-100 rounded-lg p-3 shadow-sm">
                        <p className="text-sm mb-1">
                          <span className="text-base-content/70">Address: </span>
                          <span className="font-medium">{order.address}</span>
                        </p>
                        {order.deliveryNotes && (
                          <p className="text-sm">
                            <span className="text-base-content/70">Notes: </span>
                            <span className="font-medium">{order.deliveryNotes}</span>
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="text-base-content/70">Option: </span>
                          <span className="font-medium">{order.deliveryOption}</span>
                        </p>
                      </div>
                    </div>

                    {/* Payment information */}
                    <div>
                      <h4 className="font-medium text-base mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        Payment Information
                      </h4>
                      <div className="bg-base-100 rounded-lg p-3 shadow-sm">
                        <p className="text-sm mb-1">
                          <span className="text-base-content/70">Method: </span>
                          <span className="font-medium capitalize">{order.payment.method}</span>
                        </p>
                        {order.payment.cardDetails && (
                          <p className="text-sm">
                            <span className="text-base-content/70">Card: </span>
                            <span className="font-medium">**** **** **** {order.payment.cardDetails.lastFour}</span>
                          </p>
                        )}
                      </div>

                      <h4 className="font-medium text-base mt-5 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Order Summary
                      </h4>
                      <div className="bg-base-100 rounded-lg p-3 shadow-sm">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-base-content/70">Subtotal:</span>
                          <span>${order.pricing.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-base-content/70">Shipping:</span>
                          <span>${order.pricing.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-base-content/70">Tax:</span>
                          <span>${order.pricing.tax.toFixed(2)}</span>
                        </div>
                        <div className="divider my-1"></div>
                        <div className="flex justify-between items-center font-bold">
                          <span>Total:</span>
                          <span>${order.pricing.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const toggleOrderDetails = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-6 md:p-8">
            {/* Page Header */}
            <div className="border-b border-base-300 pb-4 mb-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold">My Orders</h1>
                <div className="flex gap-3">
                  <Link to="/profile" className="btn btn-outline btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Profile
                  </Link>
                  <Link to="/" className="btn btn-outline">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Orders Content */}
            {renderContent()}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 2000px; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'badge-warning',
    processing: 'badge-info',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-error',
  };
  return classes[status.toLowerCase()] || 'badge-neutral';
};

export default MyOrders; 