import React from 'react';

const UserDetailsModal = ({ 
  isOpen, 
  onClose, 
  user, 
  userRoles, 
  tempRole, 
  onRoleChange, 
  onStatusToggle, 
  onSave, 
  formatDate, 
  getRoleBadge 
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box w-11/12 max-w-4xl">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h3 className="font-bold text-lg">User Profile - {user.name}</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Basic Information</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-base-content/60">Full Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/60">Email Address</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/60">Role</p>
                  <div>{getRoleBadge(user.role)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Account Details</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-base-content/60">Registered Date</p>
                  <p>{formatDate(user.registeredDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/60">Total Orders</p>
                  <p>{user.ordersCount} orders</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/60">Total Spent</p>
                  <p className="font-medium">${user.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
          <div className="card-body p-5">
            <h4 className="font-semibold text-lg mb-3">Account Management</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Change Role</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  value={tempRole}
                  onChange={(e) => onRoleChange(e.target.value)}
                >
                  {Object.values(userRoles).map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Account Status</span>
                </label>
                <button 
                  className={`btn ${user.status === 'active' ? 'btn-error' : 'btn-success'}`}
                  onClick={() => onStatusToggle(user.id)}
                >
                  {user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-action pt-4 border-t">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>Save Changes</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  );
};

export default UserDetailsModal; 