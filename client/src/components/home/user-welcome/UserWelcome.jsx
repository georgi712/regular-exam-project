import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../../contexts/userContext.js';
import { useUpdateAddress } from '../../../api/userProfileApi.js';
import AddressInput from './AddressInput.jsx';

export default function UserWelcome() {
  const userContext = useContext(UserContext);
  const { username, addresses, updateUserAddress } = userContext;
  const [savedAddress, setSavedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const { updateAddress, isUpdating } = useUpdateAddress();

  // Get the user's saved address, if any
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSavedAddress(defaultAddress);
    } else {
      setSavedAddress(null);
      setShowAddressForm(true);
    }
  }, [addresses]);

  const handleAddressSave = async (addressData) => {
    setErrorMessage("");
    
    // Hide form immediately after save is clicked
    setShowAddressForm(false);
    
    try {
      const result = await updateAddress({
        address: addressData.formattedAddress,
        isDefault: true
      });
      
      if (result.success) {
        const newAddress = {
          address: addressData.formattedAddress,
          isDefault: true
        };
        
        updateUserAddress(newAddress);
        setSavedAddress(newAddress);
        setSuccessMessage("✅ Address saved successfully!");
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        setErrorMessage(result.error || "Failed to save address");
        // Show form again if there was an error
        setShowAddressForm(true);
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again.");
      // Show form again if there was an error
      setShowAddressForm(true);
    }
  };

  const handleAddressChange = () => {
    setShowAddressForm(true);
    setErrorMessage("");
  };

  const handleCancel = () => {
    setShowAddressForm(false);
    setErrorMessage("");
  };

  // Render the form to add/change address
  const renderAddressForm = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">
            {savedAddress ? "Change Your Delivery Address" : "Set Your Delivery Address"}
          </h3>
          <p className="text-base-content/70">
            Enter your address to see if we deliver to your area
          </p>
        </div>

        <AddressInput 
          onSave={handleAddressSave}
          onCancel={savedAddress ? handleCancel : null}
          isLoading={isUpdating}
        />
        
        {errorMessage && (
          <div className="alert alert-error shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  };

  // Render the view with the saved address
  const renderSavedAddressView = () => {
    return (
      <>
        <div className="flex items-start gap-4 mb-6">
          <div className="bg-success text-success-content p-3 rounded-full flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">Your Default Delivery Address</h3>
            <p className="text-base-content/80 break-words">{savedAddress.address}</p>
          </div>
        </div>
        
        {successMessage && (
          <div className="alert alert-success mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={"/products?category=fruits"} className="btn btn-primary btn-lg flex-1 h-14 sm:h-auto py-3">Browse Products</Link>
          <button
            className="btn btn-outline btn-success btn-lg flex-1 h-14 sm:h-auto py-3"
            onClick={handleAddressChange}
          >
            Change Delivery Address
          </button>
        </div>
      </>
    );
  };

  return (
    <section className="py-12 bg-base-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {username || 'there'}!</h2>
            <p className="text-base-content/70">Ready for fresh and healthy options today?</p>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-6">
              {savedAddress && !showAddressForm ? 
                renderSavedAddressView() : 
                renderAddressForm()
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 