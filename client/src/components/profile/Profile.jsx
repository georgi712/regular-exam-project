import { useState } from 'react';

// Mock data for demonstration
const MOCK_USER = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 8900',
  avatar: '/images/avatar.jpg',
  addresses: [
    {
      id: 1,
      type: 'Home',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      isDefault: true,
    },
    // Add more addresses as needed
  ],
  orders: [
    {
      id: '#ORD-2024-001',
      date: '2024-03-15',
      total: 45.98,
      status: 'Delivered',
      items: [
        { name: 'Fresh Apples', quantity: 2, price: 2.99 },
        { name: 'Organic Bananas', quantity: 3, price: 3.99 },
      ],
    },
    // Add more orders as needed
  ],
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user] = useState(MOCK_USER);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={user.avatar} alt={user.name} />
                </div>
              </div>
              <h2 className="card-title mt-4">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <div className="tabs tabs-boxed mt-8 w-full">
                <button
                  className={`tab flex-1 ${activeTab === 'profile' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  Profile
                </button>
                <button
                  className={`tab flex-1 ${activeTab === 'orders' ? 'tab-active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  Orders
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {activeTab === 'profile' ? (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="card-title text-2xl mb-2">Personal Information</h2>
                    <p className="text-base-content/70">Manage your personal information and delivery preferences</p>
                  </div>
                  <button
                    className={`btn ${isEditing ? 'btn-primary' : 'btn-ghost'} btn-sm`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Personal Details Form */}
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-bold text-lg mb-1">Basic Details</h3>
                          <p className="text-base-content/70 text-sm">Your personal information</p>
                        </div>
                        {isEditing && (
                          <div className="text-sm text-base-content/70">
                            <span className="text-error">*</span> Required fields
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">
                              Full Name {isEditing && <span className="text-error">*</span>}
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={user.name}
                              className={`input input-bordered w-full ${!isEditing && 'bg-base-200'}`}
                              placeholder="Enter your full name"
                              disabled={!isEditing}
                            />
                            {!isEditing && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/30" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">
                              Email {isEditing && <span className="text-error">*</span>}
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              value={user.email}
                              className={`input input-bordered w-full ${!isEditing && 'bg-base-200'}`}
                              placeholder="your@email.com"
                              disabled={true}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/30" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                              </svg>
                            </div>
                          </div>
                          <label className="label">
                            <span className="label-text-alt text-base-content/60">Contact support to change email</span>
                          </label>
                        </div>

                        <div className="form-control w-full">
                          <label className="label">
                            <span className="label-text font-medium">
                              Phone {isEditing && <span className="text-error">*</span>}
                            </span>
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={user.phone}
                              className={`input input-bordered w-full ${!isEditing && 'bg-base-200'}`}
                              placeholder="+1 (234) 567-8900"
                              disabled={!isEditing}
                            />
                            {!isEditing && (
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-base-content/30" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="font-bold text-lg mb-1">Delivery Addresses</h3>
                          <p className="text-base-content/70 text-sm">Manage your delivery locations</p>
                        </div>
                        <button className="btn btn-primary btn-sm">Add New Address</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.addresses.map((address) => (
                          <div key={address.id} className="card bg-base-100 shadow-sm">
                            <div className="card-body">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold flex items-center gap-2">
                                    {address.type}
                                    {address.isDefault && (
                                      <span className="badge badge-primary badge-sm">Default</span>
                                    )}
                                  </h4>
                                  <p className="text-base-content/70 mt-1">{address.street}</p>
                                  <p className="text-base-content/70">
                                    {address.city}, {address.state} {address.zip}
                                  </p>
                                </div>
                                <div className="dropdown dropdown-end">
                                  <button tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                  </button>
                                  <ul
                                    tabIndex={0}
                                    className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                                  >
                                    <li><a className="text-base-content/70">Edit</a></li>
                                    <li><a className="text-error">Delete</a></li>
                                    {!address.isDefault && (
                                      <li><a className="text-primary">Set as Default</a></li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-6">Order History</h2>
                <div className="space-y-6">
                  {user.orders.map((order) => (
                    <div key={order.id} className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <h3 className="font-bold">Order {order.id}</h3>
                            <p className="text-sm text-gray-600">
                              Placed on {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${order.total.toFixed(2)}</p>
                            <div className="badge badge-accent">{order.status}</div>
                          </div>
                        </div>
                        <div className="divider"></div>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="card-actions justify-end mt-4">
                          <button className="btn btn-ghost btn-sm">View Details</button>
                          <button className="btn btn-primary btn-sm">Reorder</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 