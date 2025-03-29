import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../../contexts/userContext.js';
import { useUpdateAddress } from '../../../api/userProfileApi.js';
import AddressFormHome, { DELIVERY_AREAS } from './AddressFormHome.jsx';

export default function UserWelcome() {
  const [showAddressChange, setShowAddressChange] = useState(false);
  const userContext = useContext(UserContext);
  const { username, _id, addresses, updateUserAddress } = userContext;
  const [savedAddress, setSavedAddress] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const { updateAddress, isUpdating } = useUpdateAddress();
  
  const [address, setAddress] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isInDeliveryArea, setIsInDeliveryArea] = useState(false);

  useEffect(() => {
    if (errorMessage && address) {
      setErrorMessage(null);
    }
  }, [address, errorMessage]);

  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSavedAddress(defaultAddress);
    } else {
      setShowAddressChange(true);
    }
  }, [addresses]);

  // Force Google Maps to reload when showing address form
  useEffect(() => {
    if (showAddressChange) {
      // Clear any existing Google Maps scripts that might be in a bad state
      const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
      existingScripts.forEach(script => {
        script.remove();
      });
    }
  }, [showAddressChange]);

  const checkDeliveryArea = (addressComponents) => {
    if (!addressComponents) return { deliverable: false, message: "" };
    
    const cityComponent = addressComponents.find(
      component => component.types.includes("locality")
    );
    
    const subLocalityComponent = addressComponents.find(
      component => component.types.includes("sublocality") || 
                   component.types.includes("neighborhood")
    );

    const city = cityComponent?.long_name;
    const district = subLocalityComponent?.long_name;

    if (city === "София" || city === "Sofia") {
      if (district && DELIVERY_AREAS[district]) {
        return {
          deliverable: true,
          message: `✅ Great! We deliver to ${district}, ${city}`
        };
      }
      return {
        deliverable: true,
        message: "✅ Great! We deliver to your area in Sofia"
      };
    }

    return {
      deliverable: false,
      message: `❌ Sorry, we currently don't deliver to ${city || 'this area'}`
    };
  };

  const clearAddress = () => {
    setAddress("");
    setValidationMessage("");
    setIsInDeliveryArea(false);
    setErrorMessage(null);
  };

  const handleAddressSelect = useCallback((placeData) => {
    if (!placeData.valid) {
      setValidationMessage(placeData.message);
      setIsInDeliveryArea(false);
      return;
    }
    
    const { deliverable, message } = checkDeliveryArea(placeData.address_components);
    setIsInDeliveryArea(deliverable);
    setValidationMessage(message);
    setAddress(placeData.formatted_address);
  }, []);

  const handleSaveAddress = async () => {
    if (!isInDeliveryArea || !address) return;
    
    setErrorMessage(null);
    
    const addressData = {
      address: address,
      isDefault: true
    };
    
    const result = await updateAddress(addressData);
    
    if (result.success) {
      setSavedAddress(addressData);
      
      updateUserAddress(addressData);
      
      setValidationMessage(`✅ Address saved successfully!`);
      
      setShowAddressChange(false);
      clearAddress();
    } else {
      setErrorMessage(result.error || 'Failed to save address. Please try again.');
    }
  };

  const handleCancel = () => {
    setShowAddressChange(false);
    clearAddress();
  };

  const renderSavedAddressView = () => {
    return (
      <>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-success text-success-content p-3 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Your Default Delivery Address</h3>
            <p className="text-base-content/80">{savedAddress.address}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={"/products?category=fruits"} className="btn btn-primary btn-lg flex-1 h-14 sm:h-auto py-3">Browse Products</Link>
          <button
            className="btn btn-outline btn-success btn-lg flex-1 h-14 sm:h-auto py-3"
            onClick={() => setShowAddressChange(true)}
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
              {savedAddress && !showAddressChange ? 
                renderSavedAddressView() : 
                <AddressFormHome
                  address={address}
                  onAddressSelect={handleAddressSelect}
                  onSave={handleSaveAddress}
                  onCancel={handleCancel}
                  isLoading={isUpdating}
                  validationMessage={validationMessage}
                  isInDeliveryArea={isInDeliveryArea}
                  errorMessage={errorMessage}
                  hasSavedAddress={!!savedAddress}
                />
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 