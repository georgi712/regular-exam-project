import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUpdateAddress } from '../../../api/userProfileApi';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Define delivery areas
const DELIVERY_AREAS = {
  "Младост": true,
  "Люлин": true,
  "Дружба": true,
  "Надежда": true,
  "Красно село": true,
  "Лозенец": true,
  "Център": true,
  "София": true,
};

function loadGoogleMapsScript() {
  return new Promise((resolve, reject) => {
    // Remove any existing Google Maps scripts
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => script.remove());

    // Clear any Google Maps objects from window
    window.google = undefined;
    
    // Create new script
    const script = document.createElement('script');
    const callbackName = 'googleMapsInitCallback_' + Date.now();
    
    window[callbackName] = function() {
      resolve(window.google);
      delete window[callbackName];
    };
    
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&callback=${callbackName}&language=bg`;
    script.async = true;
    script.defer = true;
    script.onerror = reject;
    
    document.head.appendChild(script);
  });
}

function ModalAddressInput({ 
  onAddressSelect, 
  initialValue = '',
  disabled = false,
  isLoading = false 
}) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [address, setAddress] = useState(initialValue);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(null);

  // Load Google Maps script when component mounts
  useEffect(() => {
    let isMounted = true;
    
    loadGoogleMapsScript()
      .then(google => {
        if (isMounted) {
          setScriptLoaded(true);
          setScriptError(null);
        }
      })
      .catch(error => {
        if (isMounted) {
          console.error("Failed to load Google Maps script:", error);
          setScriptError("Failed to load address search. Please try again.");
        }
      });
      
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize autocomplete when script is loaded and input is available
  useEffect(() => {
    if (scriptLoaded && inputRef.current && window.google?.maps?.places) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "BG" }
        });
        
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          
          if (!place || !place.geometry) {
            onAddressSelect({ 
              formatted_address: null, 
              address_components: null,
              valid: false, 
              message: "⚠️ Please select an address from the dropdown" 
            });
            return;
          }
          
          setAddress(place.formatted_address);
          onAddressSelect({
            formatted_address: place.formatted_address,
            address_components: place.address_components,
            valid: true,
            message: ""
          });
        });
      } catch (error) {
        console.error("Error initializing autocomplete:", error);
        setScriptError("Failed to initialize address search. Please try again.");
      }
    }
  }, [scriptLoaded, onAddressSelect]);
  
  const handleClear = useCallback(() => {
    setAddress("");
    
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    
    onAddressSelect({ 
      formatted_address: null, 
      address_components: null,
      valid: false, 
      message: "" 
    });
  }, [onAddressSelect]);
  
  const handleChange = useCallback((e) => {
    setAddress(e.target.value);
  }, []);
  
  return (
    <div className="form-control">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter your delivery address"
          className="input input-bordered w-full pr-10 text-base-content"
          value={address}
          onChange={handleChange}
          disabled={disabled || isLoading || !scriptLoaded}
        />
        {address && !isLoading && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {scriptError && (
        <div className="mt-2 text-sm text-error">{scriptError}</div>
      )}
      
      {!scriptLoaded && !scriptError && (
        <div className="mt-2 text-sm flex items-center gap-2">
          <span className="loading loading-spinner loading-xs"></span>
          <span>Loading address search...</span>
        </div>
      )}
      
      <div className="flex items-center gap-3 mt-2 px-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex flex-col xs:flex-row gap-1 xs:gap-3 text-sm">
          <span className="text-base-content/70">Format: <span className="text-info font-medium">Street name and number, District, Sofia</span></span>
        </div>
      </div>
    </div>
  );
}

export default function AddressFormModal({ isOpen, onClose }) {
  const [selectedAddress, setSelectedAddress] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isInDeliveryArea, setIsInDeliveryArea] = useState(false);

  // Use our custom hook
  const { updateAddress, isUpdating } = useUpdateAddress();

  // Reset state when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSelectedAddress('');
      setValidationMessage('');
      setIsInDeliveryArea(false);
    }
  }, [isOpen]);

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

  const handleAddressSelect = (placeData) => {
    if (!placeData.valid) {
      setValidationMessage(placeData.message || '');
      setIsInDeliveryArea(false);
      return;
    }
    
    const { deliverable, message } = checkDeliveryArea(placeData.address_components);
    setIsInDeliveryArea(deliverable);
    setValidationMessage(message);
    setSelectedAddress(placeData.formatted_address);
  };

  const handleSaveAddress = async () => {
    if (!selectedAddress) {
      setValidationMessage('Please enter a valid address');
      return;
    }

    if (!isInDeliveryArea) {
      setValidationMessage('Sorry, we don\'t deliver to this area yet.');
      return;
    }

    try {
      const result = await updateAddress({ address: selectedAddress });
      
      if (result.success) {
        setValidationMessage('Address saved successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setValidationMessage(result.error || 'Failed to save address');
      }
    } catch (err) {
      setValidationMessage(err.message || 'An unexpected error occurred');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-xl mb-4">Add New Delivery Address</h3>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Enter your delivery address</span>
          </label>
          
          <ModalAddressInput
            onAddressSelect={handleAddressSelect}
            initialValue={selectedAddress}
            disabled={isUpdating}
            isLoading={isUpdating}
          />
          
          {validationMessage && (
            <div className={`mt-3 text-sm ${
              validationMessage.includes('success') || validationMessage.includes('Great') 
                ? 'text-success' 
                : 'text-error'
            }`}>
              {validationMessage}
            </div>
          )}
        </div>
        
        <div className="modal-action mt-6">
          <button 
            className="btn btn-ghost" 
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSaveAddress}
            disabled={!selectedAddress || !isInDeliveryArea || isUpdating}
          >
            {isUpdating ? (
              <>
                <span className="loading loading-spinner loading-sm mr-2"></span>
                Saving...
              </>
            ) : (
              'Save Address'
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} style={{ zIndex: -1 }}></div>
    </div>
  );
} 