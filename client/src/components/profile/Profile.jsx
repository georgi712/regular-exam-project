import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../contexts/userContext.js';
import { useSetDefaultAddress, useDeleteAddress } from '../../api/userProfileApi.js';
import AddressFormModal from './address/AddressFormModal.jsx';
import { useToastContext } from '../../contexts/ToastContext.jsx';

export default function Profile() {
  const { email, username, addresses = [], _id } = useContext(UserContext);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToastContext();
  
  // Use our custom hooks
  const { setDefaultAddress } = useSetDefaultAddress();
  const { deleteAddress } = useDeleteAddress();
  
  // Redirect to login if not authenticated
  if (!_id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-base-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Link to="/login" className="btn btn-primary">Sign In</Link>
        </div>
      </div>
    );
  }
  
  const handleSetDefaultAddress = async (addressToUpdate) => {
    try {
      setIsLoading(true);
      
      const loadingToastId = toast.info('Setting address as default...', 10000);
      
      const result = await setDefaultAddress(addressToUpdate);
      
      toast.removeToast(loadingToastId);
      
      if (result.success) {
        toast.success('Default address updated successfully');
      } else {
        toast.error(result.error || 'Failed to set default address');
      }
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAddress = async (addressToDelete) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const loadingToastId = toast.info('Deleting address...', 10000);
      
      const result = await deleteAddress(addressToDelete);
      
      toast.removeToast(loadingToastId);
      
      if (result.success) {
        toast.success('Address deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete address');
      }
    } catch (err) {
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Profile header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <div className="flex gap-3 mt-3 md:mt-0">
              <Link to="/orders" className="btn btn-outline btn-sm">My Orders</Link>
              <Link to="/logout" className="btn btn-outline btn-error btn-sm">Sign Out</Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Info Card */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-lg">Personal Information</h2>
                <div className="divider my-0"></div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-base-content/70">Name</label>
                    <p>{username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-base-content/70">Email</label>
                    <p>{email}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Addresses Card */}
            <div className="card bg-base-100 shadow-md md:col-span-2">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h2 className="card-title text-lg">Delivery Addresses</h2>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setIsAddressModalOpen(true)}
                    disabled={isLoading}
                  >
                    Add Address
                  </button>
                </div>
                
                <div className="divider my-0"></div>
                
                {addresses.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-base-content/70 mb-3">No saved addresses yet.</p>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsAddressModalOpen(true)}
                      disabled={isLoading}
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 mt-2">
                    {addresses.map((address, index) => (
                      <div key={index} className={`border rounded-lg p-3 ${address.isDefault ? 'border-primary bg-primary/5' : 'border-base-300'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{address.address}</p>
                            {address.isDefault && (
                              <span className="badge badge-primary badge-sm">Default</span>
                            )}
                          </div>
                          <div className="flex gap-2 w-full sm:w-auto justify-end">
                            {!address.isDefault && (
                              <button 
                                className="btn btn-xs btn-outline" 
                                onClick={() => handleSetDefaultAddress(address)}
                                disabled={isLoading}
                              >
                                Set Default
                              </button>
                            )}
                            <button 
                              className="btn btn-xs btn-outline btn-error"
                              onClick={() => handleDeleteAddress(address)}
                              disabled={isLoading}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Address Form Modal */}
      <AddressFormModal 
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </div>
  );
} 