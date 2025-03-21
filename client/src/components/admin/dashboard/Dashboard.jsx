import React from 'react';

const Dashboard = () => {
  // Mock data for dashboard metrics
  const metrics = {
    totalOrders: 156,
    totalRevenue: 3782.45,
    totalProducts: 48,
    totalUsers: 210,
    lowStock: 7,
    pendingOrders: 12,
  };

  // Mock data for recent orders
  const recentOrders = [
    { id: 'ORD-2023-005', customer: 'David Wilson', date: '2023-03-17', total: 15.97, status: 'cancelled' },
    { id: 'ORD-2023-004', customer: 'Maria Garcia', date: '2023-03-18', total: 20.45, status: 'shipped' },
    { id: 'ORD-2023-003', customer: 'Robert Johnson', date: '2023-03-19', total: 14.95, status: 'pending' },
    { id: 'ORD-2023-002', customer: 'Jane Smith', date: '2023-03-19', total: 25.94, status: 'processing' },
    { id: 'ORD-2023-001', customer: 'John Doe', date: '2023-03-20', total: 10.97, status: 'delivered' },
  ];

  // Order status colors
  const statusColors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error',
  };

  // Mock data for low stock products
  const lowStockProducts = [
    { id: 4, name: 'Fresh Strawberries', stock: 8, image: '/images/products/strawberries.jpg' },
    { id: 3, name: 'Sweet Oranges', stock: 15, image: '/images/products/oranges.jpg' },
    { id: 6, name: 'Organic Carrots', stock: 9, image: '/images/products/carrots.jpg' },
    { id: 7, name: 'Fresh Milk', stock: 5, image: '/images/products/milk.jpg' },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
        <div className="badge badge-primary p-3">Last updated: Today, 10:30 AM</div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-normal text-base-content/70">Total Orders</h3>
                <p className="text-3xl font-bold">{metrics.totalOrders}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-normal text-base-content/70">Revenue</h3>
                <p className="text-3xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-success/10 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-normal text-base-content/70">Products</h3>
                <p className="text-3xl font-bold">{metrics.totalProducts}</p>
              </div>
              <div className="rounded-full bg-info/10 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-normal text-base-content/70">Users</h3>
                <p className="text-3xl font-bold">{metrics.totalUsers}</p>
              </div>
              <div className="rounded-full bg-secondary/10 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-lg font-semibold flex justify-between">
              Recent Orders
              <button className="btn btn-sm btn-ghost">View All</button>
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-compact w-full">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover">
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.date}</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        <div className={`badge badge-${statusColors[order.status]} badge-sm`}>
                          {order.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h3 className="card-title text-lg font-semibold flex justify-between">
              Low Stock Products
              <button className="btn btn-sm btn-ghost">View All</button>
            </h3>
            <div className="overflow-x-auto">
              <table className="table table-compact w-full">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map(product => (
                    <tr key={product.id} className="hover">
                      <td>
                        <div className="flex items-center space-x-3">
                          <div className="avatar">
                            <div className="mask mask-squircle w-10 h-10">
                              <img src={product.image} alt={product.name} />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-error font-medium">{product.stock} left</div>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline">Restock</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 