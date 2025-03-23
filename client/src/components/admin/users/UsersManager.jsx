import React, { useState } from 'react';
import UserDetailsModal from './modals/UserDetailsModal';

const UsersManager = () => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [tempRole, setTempRole] = useState(null);
  
  // User roles
  const USER_ROLES = {
    CUSTOMER: { value: 'customer', label: 'Customer', color: 'info' },
    ADMIN: { value: 'admin', label: 'Admin', color: 'error' },
    MANAGER: { value: 'manager', label: 'Manager', color: 'warning' },
  };
  
  // Mock users data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'admin',
      registeredDate: '2022-11-10T10:30:00',
      lastLogin: '2023-03-15T15:45:00',
      status: 'active',
      ordersCount: 12,
      totalSpent: 1245.50
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'manager',
      registeredDate: '2022-12-05T09:15:00',
      lastLogin: '2023-03-14T11:30:00',
      status: 'active',
      ordersCount: 8,
      totalSpent: 875.20
    },
    {
      id: 3,
      name: 'Michael Johnson',
      email: 'michael.johnson@example.com',
      role: 'customer',
      registeredDate: '2023-01-20T14:00:00',
      lastLogin: '2023-03-10T16:20:00',
      status: 'active',
      ordersCount: 5,
      totalSpent: 350.75
    },
    {
      id: 4,
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      role: 'customer',
      registeredDate: '2023-02-15T11:45:00',
      lastLogin: '2023-03-01T09:10:00',
      status: 'inactive',
      ordersCount: 2,
      totalSpent: 125.30
    },
    {
      id: 5,
      name: 'Robert Wilson',
      email: 'robert.wilson@example.com',
      role: 'customer',
      registeredDate: '2023-02-28T16:30:00',
      lastLogin: '2023-03-12T14:50:00',
      status: 'active',
      ordersCount: 3,
      totalSpent: 210.45
    },
  ]);

  const handleRoleChange = (userId, newRole) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, role: newRole } 
        : user
    );
    setUsers(updatedUsers);
  };

  const handleStatusToggle = (userId) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } 
        : user
    );
    setUsers(updatedUsers);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(date);
  };
  
  const getRoleBadge = (role) => {
    const roleObj = Object.values(USER_ROLES).find(r => r.value === role);
    return (
      <div className={`badge badge-${roleObj.color}`}>
        {roleObj.label}
      </div>
    );
  };

  const openUserModal = (user) => {
    setSelectedUser(user);
    setTempRole(user.role);
    setShowUserModal(true);
  };

  const handleSaveChanges = () => {
    if (tempRole && tempRole !== selectedUser.role) {
      handleRoleChange(selectedUser.id, tempRole);
    }
    setShowUserModal(false);
  };
  
  const handleTempRoleChange = (newRole) => {
    setTempRole(newRole);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Users Management</h2>
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              Filter by Role
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
              <li><a>All Users</a></li>
              {Object.values(USER_ROLES).map(role => (
                <li key={role.value}><a>{role.label}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="join flex-1 md:flex-initial">
            <input type="text" placeholder="Search users..." className="input input-bordered join-item w-full" />
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
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered</th>
              <th>Orders</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover">
                <td className="font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>{getRoleBadge(user.role)}</td>
                <td>{formatDate(user.registeredDate)}</td>
                <td className="text-center">{user.ordersCount}</td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => openUserModal(user)}
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
                        <li>
                          <a onClick={() => handleStatusToggle(user.id)}>
                            {user.status === 'active' ? 'Deactivate' : 'Activate'} User
                          </a>
                        </li>
                        {Object.values(USER_ROLES).map(role => (
                          <li key={role.value}>
                            <a onClick={() => handleRoleChange(user.id, role.value)}>
                              Change Role to {role.label}
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
      
      {/* User modal */}
      <UserDetailsModal 
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        userRoles={USER_ROLES}
        tempRole={tempRole}
        onRoleChange={handleTempRoleChange}
        onStatusToggle={handleStatusToggle}
        onSave={handleSaveChanges}
        formatDate={formatDate}
        getRoleBadge={getRoleBadge}
      />
    </div>
  );
};

export default UsersManager; 