import React, { useState, useEffect } from 'react';
import { useUpdateAddress } from '../../../api/userProfileApi';

// Import our simplified address input component
// Make sure to adjust the import path if needed
import AddressInput, { DELIVERY_AREAS } from '../../../components/home/user-welcome/AddressInput';

export default function AddressFormModal({ isOpen, onClose }) {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Use our custom hook
  const { updateAddress, isUpdating } = useUpdateAddress();

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSuccessMessage('');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleAddressSave = async (addressData) => {
    setErrorMessage('');
    
    try {
      const result = await updateAddress({
        address: addressData.formattedAddress,
        isDefault: false
      });
      
      if (result.success) {
        setSuccessMessage('✅ Address saved successfully!');
        
        // Auto-close after success
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(result.error || 'Failed to save address');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-xl mb-6">Add New Delivery Address</h3>
        
        {errorMessage && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="break-words">{errorMessage}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="alert alert-success mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="break-words">{successMessage}</span>
          </div>
        )}
        
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