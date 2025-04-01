import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext.jsx';
import Dashboard from './dashboard/Dashboard';
import ProductsManager from './products/ProductsManager';
import OrdersManager from './orders/OrdersManager';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const toast = useToastContext();


  const handleTabChange = (tab) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsManager />;
      case 'orders':
        return <OrdersManager />;
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

  // Render the active component based on the selected tab
  const renderActiveComponent = () => {
    switch(activeTab) {
      case 'products':
        return <ProductsManager />;
      case 'orders':
        return <OrdersManager />;
      default:
        return <ProductsManager />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-base-content/70">Manage your products and orders</p>
      </div>
      
      {/* Always display the Dashboard component */}
      <Dashboard />
      
      <div className="mt-8 border-b border-base-300 mb-8">
        <div className="tabs tabs-bordered">
          <button
            className={`tab ${activeTab === 'products' ? 'tab-active' : ''} text-lg`}
            onClick={() => handleTabChange('products')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Products
          </button>
          
          <button
            className={`tab ${activeTab === 'orders' ? 'tab-active' : ''} text-lg`}
            onClick={() => handleTabChange('orders')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Orders
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