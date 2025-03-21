import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Dashboard from './dashboard/Dashboard';
import ProductsManager from './products/ProductsManager';
import OrdersManager from './orders/OrdersManager';
import UsersManager from './users/UsersManager';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock stats for dashboard
  const stats = {
    totalOrders: 156,
    pendingOrders: 23,
    totalProducts: 87,
    totalUsers: 312,
    revenue: {
      total: 15680,
      thisMonth: 2450,
      lastMonth: 2150
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsManager />;
      case 'orders':
        return <OrdersManager />;
      case 'users':
        return <UsersManager />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-medium text-base-content/70">Total Orders</h3>
                <p className="text-4xl font-bold">{stats.totalOrders}</p>
                <div className="text-sm mt-2 text-success">+12% from last month</div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-medium text-base-content/70">Pending Orders</h3>
                <p className="text-4xl font-bold">{stats.pendingOrders}</p>
                <div className="text-sm mt-2 text-warning">5 require attention</div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-medium text-base-content/70">Total Products</h3>
                <p className="text-4xl font-bold">{stats.totalProducts}</p>
                <div className="text-sm mt-2 text-info">8 low on stock</div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="text-lg font-medium text-base-content/70">Total Users</h3>
                <p className="text-4xl font-bold">{stats.totalUsers}</p>
                <div className="text-sm mt-2 text-success">+24 this month</div>
              </div>
            </div>
            
            <div className="card bg-base-100 shadow-xl md:col-span-2 lg:col-span-4">
              <div className="card-body">
                <h3 className="text-lg font-medium text-base-content/70">Revenue Overview</h3>
                <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
                  <div className="stat">
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value">${stats.revenue.total.toLocaleString()}</div>
                    <div className="stat-desc">Lifetime earnings</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">This Month</div>
                    <div className="stat-value text-success">${stats.revenue.thisMonth.toLocaleString()}</div>
                    <div className="stat-desc text-success">↗︎ 14% from last month</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Last Month</div>
                    <div className="stat-value">${stats.revenue.lastMonth.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductsManager />;
      case 'orders':
        return <OrdersManager />;
      case 'users':
        return <UsersManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-base-content/70">Manage your products, orders, and users</p>
      </div>
      
      <div className="border-b border-base-300 mb-8">
        <div className="tabs tabs-bordered">
          <button
            className={`tab ${activeTab === 'dashboard' ? 'tab-active' : ''} text-lg`}
            onClick={() => setActiveTab('dashboard')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </button>
          
          <button
            className={`tab ${activeTab === 'products' ? 'tab-active' : ''} text-lg`}
            onClick={() => setActiveTab('products')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Products
          </button>
          
          <button
            className={`tab ${activeTab === 'orders' ? 'tab-active' : ''} text-lg`}
            onClick={() => setActiveTab('orders')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Orders
          </button>
          
          <button
            className={`tab ${activeTab === 'users' ? 'tab-active' : ''} text-lg`}
            onClick={() => setActiveTab('users')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </button>
        </div>
      </div>
      
      <div>
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default Admin; 