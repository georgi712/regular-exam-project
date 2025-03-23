import React, { useState } from 'react';
import OrderDetailsModal from './modals/OrderDetailsModal';

const OrdersManager = () => {
  const [viewOrderId, setViewOrderId] = useState(null);
  
  // Mock order statuses
  const ORDER_STATUSES = {
    PENDING: { value: 'pending', label: 'Pending', color: 'warning' },
    PROCESSING: { value: 'processing', label: 'Processing', color: 'info' },
    SHIPPED: { value: 'shipped', label: 'Shipped', color: 'primary' },
    DELIVERED: { value: 'delivered', label: 'Delivered', color: 'success' },
    CANCELLED: { value: 'cancelled', label: 'Cancelled', color: 'error' },
  };
  
  // Mock orders data
  const [orders, setOrders] = useState([
    {
      id: 'ORD-2023-001',
      date: '2023-03-20T14:35:00',
      customerName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 234 567 8901',
      address: '123 Main Street, Cityville, State, 12345',
      items: [
        { id: 1, name: 'Fresh Apples', price: 2.99, quantity: 2 },
        { id: 3, name: 'Sweet Oranges', price: 4.99, quantity: 1 },
      ],
      total: 10.97,
      status: 'delivered',
      paymentMethod: 'Card'
    },
    {
      id: 'ORD-2023-002',
      date: '2023-03-19T11:22:00',
      customerName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 234 567 8902',
      address: '456 Oak Avenue, Townsburg, State, 67890',
      items: [
        { id: 2, name: 'Organic Bananas', price: 3.99, quantity: 3 },
        { id: 4, name: 'Fresh Strawberries', price: 5.99, quantity: 1 },
        { id: 5, name: 'Organic Broccoli', price: 3.49, quantity: 2 },
      ],
      total: 25.94,
      status: 'processing',
      paymentMethod: 'Card'
    },
    {
      id: 'ORD-2023-003',
      date: '2023-03-19T09:45:00',
      customerName: 'Robert Johnson',
      email: 'robert.johnson@example.com',
      phone: '+1 234 567 8903',
      address: '789 Pine Road, Villageton, State, 45678',
      items: [
        { id: 1, name: 'Fresh Apples', price: 2.99, quantity: 5 },
      ],
      total: 14.95,
      status: 'pending',
      paymentMethod: 'Cash on Delivery'
    },
    {
      id: 'ORD-2023-004',
      date: '2023-03-18T16:12:00',
      customerName: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      phone: '+1 234 567 8904',
      address: '321 Elm Lane, Hamletville, State, 98765',
      items: [
        { id: 3, name: 'Sweet Oranges', price: 4.99, quantity: 2 },
        { id: 5, name: 'Organic Broccoli', price: 3.49, quantity: 3 },
      ],
      total: 20.45,
      status: 'shipped',
      paymentMethod: 'Card'
    },
    {
      id: 'ORD-2023-005',
      date: '2023-03-17T13:28:00',
      customerName: 'David Wilson',
      email: 'david.wilson@example.com',
      phone: '+1 234 567 8905',
      address: '654 Maple Court, Suburbia, State, 54321',
      items: [
        { id: 2, name: 'Organic Bananas', price: 3.99, quantity: 1 },
        { id: 4, name: 'Fresh Strawberries', price: 5.99, quantity: 2 },
      ],
      total: 15.97,
      status: 'cancelled',
      paymentMethod: 'Card'
    },
  ]);

  const handleStatusChange = (orderId, newStatus) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus } 
        : order
    );
    setOrders(updatedOrders);
  };

  const getStatusBadge = (status) => {
    const statusObj = Object.values(ORDER_STATUSES).find(s => s.value === status);
    return (
      <div className={`badge badge-${statusObj.color}`}>
        {statusObj.label}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getOrderById = (id) => {
    return orders.find(order => order.id === id);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Orders Management</h2>
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              Filter by Status
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
              <li><a>All Orders</a></li>
              {Object.values(ORDER_STATUSES).map(status => (
                <li key={status.value}><a>{status.label}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="join flex-1 md:flex-initial">
            <input type="text" placeholder="Search orders..." className="input input-bordered join-item w-full" />
            <button className="btn join-item">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
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
            {orders.map((order) => (
              <tr key={order.id} className="hover">
                <td>{order.id}</td>
                <td>{formatDate(order.date)}</td>
                <td>
                  <div className="font-bold">{order.customerName}</div>
                  <div className="text-sm opacity-50">{order.email}</div>
                </td>
                <td>
                  <div className="font-medium">{order.items.length} item(s)</div>
                </td>
                <td className="font-semibold">${order.total.toFixed(2)}</td>
                <td>{getStatusBadge(order.status)}</td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => setViewOrderId(order.id)}
                    >
                      View
                    </button>
                    <div className="dropdown dropdown-end dropdown-left">
                      <label tabIndex={0} className="btn btn-ghost btn-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </label>
                      <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow bg-base-100 rounded-box w-52">
                        {Object.values(ORDER_STATUSES).map(status => (
                          <li key={status.value}>
                            <a onClick={() => handleStatusChange(order.id, status.value)}>
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
      
      {/* Order Details Modal */}
      {viewOrderId && (
        <OrderDetailsModal
          isOpen={!!viewOrderId}
          order={{
            ...getOrderById(viewOrderId),
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