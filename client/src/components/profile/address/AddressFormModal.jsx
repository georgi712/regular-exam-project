import React, { useState, useEffect } from 'react';
import { useUpdateAddress } from '../../../api/userProfileApi';
import { useToastContext } from '../../../contexts/ToastContext.jsx';

// Import our simplified address input component
// Make sure to adjust the import path if needed
import AddressInput, { DELIVERY_AREAS } from '../../../components/home/user-welcome/AddressInput';

export default function AddressFormModal({ isOpen, onClose }) {
  // Use our custom hooks
  const { updateAddress, isUpdating } = useUpdateAddress();
  const toast = useToastContext();

  const handleAddressSave = async (addressData) => {
    // Close the modal immediately
    onClose();
    
    const loadingToastId = toast.info('Saving your address...', 10000);
    
    try {
      const result = await updateAddress({
        address: addressData.formattedAddress,
        isDefault: false
      });
      
      // Remove loading toast
      toast.removeToast(loadingToastId);
      
      if (result.success) {
        toast.success('Address saved successfully!');
        
        // No need for auto-close since we already closed the modal
      } else {
        toast.error(result.error || 'Failed to save address');
      }
    } catch (error) {
      // Remove loading toast if there's an error
      toast.removeToast(loadingToastId);
      toast.error('An error occurred. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-xl mb-6">Add New Delivery Address</h3>
        
        <AddressInput
          onSave={handleAddressSave}
          onCancel={onClose}
          isLoading={isUpdating}
        />
      </div>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: -1 }}></div>
    </div>
  );
} 