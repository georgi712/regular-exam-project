import React, { useState, useEffect } from 'react';
import OrderDetailsModal from './modals/OrderDetailsModal';
import { useGetAllOrders, useUpdateOrderStatus } from '../../../api/ordersApi';

const OrdersManager = () => {
  const [viewOrderId, setViewOrderId] = useState(null);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { orders, loading, error } = useGetAllOrders();
  const { updateOrderStatus, isUpdating } = useUpdateOrderStatus();
  
  const ORDER_STATUSES = {
    PENDING: { value: 'pending', label: 'Pending', color: 'warning' },
    PROCESSING: { value: 'processing', label: 'Processing', color: 'info' },
    SHIPPED: { value: 'shipped', label: 'Shipped', color: 'primary' },
    DELIVERED: { value: 'delivered', label: 'Delivered', color: 'success' },
    CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'error' },
  };

  useEffect(() => {
    if (!orders) return;
    
    let result = [...orders];
    
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.id?.toLowerCase().includes(term) || 
        order._id?.toLowerCase().includes(term) ||
        order.userInfo?.email?.toLowerCase().includes(term) ||
        order.userInfo?.firstName?.toLowerCase().includes(term) ||
        order.userInfo?.lastName?.toLowerCase().includes(term) ||
        `${order.userInfo?.firstName} ${order.userInfo?.lastName}`.toLowerCase().includes(term)
      );
    }
    
    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (isUpdating) return;
    
    const result = await updateOrderStatus(orderId, newStatus);
    
    if (result.success) {
      setFilteredOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } else {
      console.error('Failed to update order status:', result.error);
    }
  };

  const getStatusBadge = (status) => {
    const statusObj = Object.values(ORDER_STATUSES).find(s => s.value === status);
    return (
      <div className={`badge badge-${statusObj?.color || 'neutral'}`}>
        {statusObj?.label || status}
      </div>
    );
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return 'No date';
      }
      
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };

  const getOrderById = (id) => {
    return orders.find(order => order._id === id);
  };

  const getCustomerName = (order) => {
    if (order.customerName) return order.customerName;
    if (order.userInfo) {
      if (order.userInfo.firstName && order.userInfo.lastName) {
        return `${order.userInfo.firstName} ${order.userInfo.lastName}`;
      }
    }
    return 'Unknown Customer';
  };

  const getCustomerEmail = (order) => {
    if (order.email) return order.email;
    if (order.userInfo && order.userInfo.email) return order.userInfo.email;
    return '';
  };

  const getOrderDate = (order) => {
    try {
      if (!order) return null;
      
      if (order._createdOn) {
        if (typeof order._createdOn === 'number' || /^\d+$/.test(order._createdOn)) {
          const timestamp = typeof order._createdOn === 'number' 
            ? order._createdOn 
            : parseInt(order._createdOn, 10);
            
          if (!isNaN(timestamp)) {
            const date = new Date(timestamp);
            return date.toISOString();
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error processing order date:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>Error loading orders: {error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Orders Management</h2>
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              {statusFilter === 'all' ? 'All Orders' : `Status: ${ORDER_STATUSES[statusFilter.toUpperCase()]?.label || statusFilter}`}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
              <li><a onClick={() => setStatusFilter('all')}>All Orders</a></li>
              {Object.values(ORDER_STATUSES).map(status => (
                <li key={status.value}><a onClick={() => setStatusFilter(status.value)}>{status.label}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="join flex-1 md:flex-initial">
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="input input-bordered join-item w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn join-item">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Status update indicator */}
      {isUpdating && (
        <div className="alert alert-info mb-4">
          <div className="loading loading-spinner loading-sm mr-2"></div>
          <span>Updating order status...</span>
        </div>
      )}
      
      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 bg-base-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
          <p className="text-base-content/70">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try changing your search or filter criteria'
              : 'There are no orders in the system yet'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-300">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="hover">
                  <td>{order._id}</td>
                  <td>{formatDate(getOrderDate(order))}</td>
                  <td>
                    <div className="font-bold">{getCustomerName(order)}</div>
                    <div className="text-sm opacity-50">{getCustomerEmail(order)}</div>
                  </td>
                  <td>
                    <div className="font-medium">{order.items?.length || 0} item(s)</div>
                  </td>
                  <td className="font-semibold">${(order.pricing?.total || order.total || 0).toFixed(2)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setViewOrderId(order._id || order.id)}
                        disabled={isUpdating}
                      >
                        View
                      </button>
                      <div className="dropdown dropdown-end dropdown-left">
                        <label tabIndex={0} className="btn btn-ghost btn-sm" disabled={isUpdating}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                          </svg>
                        </label>
                        <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow bg-base-100 rounded-box w-52">
                          {Object.values(ORDER_STATUSES).map(status => (
                            <li key={status.value}>
                              <a 
                                onClick={() => handleStatusChange(order._id || order.id, status.value)}
                                className={order.status === status.value ? 'font-bold bg-base-200' : ''}
                                disabled={isUpdating}
                              >
                                Mark as {status.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Order Details Modal */}
      {viewOrderId && (
        <OrderDetailsModal
          isOpen={!!viewOrderId}
          order={{
            ...(filteredOrders.find(order => order._id === viewOrderId) || getOrderById(viewOrderId)),
            statuses: ORDER_STATUSES
          }}
          onClose={() => setViewOrderId(null)}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

export default OrdersManager; 