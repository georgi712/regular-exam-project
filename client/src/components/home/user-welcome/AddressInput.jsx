import React, { useState, useRef, useEffect } from 'react';

// Google Maps API key
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Valid delivery areas
export const DELIVERY_AREAS = {
  "Младост": true,
  "Люлин": true,
  "Дружба": true,
  "Надежда": true,
  "Красно село": true,
  "Лозенец": true,
  "Център": true,
  "София": true,
};

export default function AddressInput({ onSave, onCancel, isLoading }) {
  const [address, setAddress] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  
  // Load Google Maps script
  useEffect(() => {
    // Cleanup any existing scripts first
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => script.remove());
    
    // Reset google object to force reload
    window.google = undefined;
    
    // Create and load the script
    const script = document.createElement('script');
    script.id = 'google-maps-script-home';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&language=bg`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setGoogleLoaded(true);
    };
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup on unmount
      const script = document.getElementById('google-maps-script-home');
      if (script) {
        script.remove();
      }
    };
  }, []);
  
  // Initialize autocomplete when Google is loaded
  useEffect(() => {
    if (googleLoaded && inputRef.current) {
      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: "BG" }
        });
      } catch (error) {
        console.error("Error initializing autocomplete:", error);
      }
    }
  }, [googleLoaded]);
  
  const handleChange = (e) => {
    setAddress(e.target.value);
    // Clear validation message when user types
    if (validationMessage) {
      setValidationMessage("");
    }
  };
  
  const handleClear = () => {
    setAddress("");
    setValidationMessage("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const handleInputKeyDown = (e) => {
    // Prevent form submission when pressing Enter in the autocomplete
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };
  
  const handleSaveClick = () => {
    if (!address.trim()) {
      setValidationMessage("Please enter an address");
      return;
    }
    
    // Verify the address only when save button is clicked
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      // If place is undefined or doesn't have geometry, it means the user hasn't selected from dropdown
      if (!place || !place.geometry) {
        setValidationMessage("Please select an address from the dropdown");
        return;
      }
      
      const addressComponents = place.address_components;
      const formattedAddress = place.formatted_address;
      
      // Check if address is in delivery area
      const isDeliverable = checkDeliveryArea(addressComponents);
      
      if (!isDeliverable.deliverable) {
        setValidationMessage(isDeliverable.message);
        return;
      }
      
      // Address is valid and in delivery area, save it
      onSave({
        formattedAddress,
        addressComponents
      });
    } else {
      setValidationMessage("Please try again");
    }
  };
  
  const checkDeliveryArea = (addressComponents) => {
    if (!addressComponents) return { deliverable: false, message: "Invalid address" };
    
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
          message: `Great! We deliver to ${district}, ${city}`
        };
      }
      return {
        deliverable: true,
        message: "Great! We deliver to your area in Sofia"
      };
    }

    return {
      deliverable: false,
      message: `Sorry, we currently don't deliver to ${city || 'this area'}`
    };
  };
  
  return (
    <div className="space-y-4">
      <div className="form-control">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter your delivery address"
            className="input input-bordered input-lg w-full pr-10"
            value={address}
            onChange={handleChange}
            onKeyDown={handleInputKeyDown}
            disabled={isLoading || !googleLoaded}
          />
          
          {address && !isLoading && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-sm btn-ghost btn-circle"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {!googleLoaded && (
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
      
      {validationMessage && (
        <div className={`alert ${validationMessage.includes("Sorry") ? "alert-error" : validationMessage.includes("Great") ? "alert-success" : "alert-warning"} shadow-lg`}>
          <span className="break-words">{validationMessage}</span>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        {onCancel && (
          <button
            className="btn btn-outline btn-lg flex-1 h-14 sm:h-auto py-3"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        
        <button
          className="btn btn-success btn-lg flex-1 h-14 sm:h-auto py-3"
          onClick={handleSaveClick}
          disabled={isLoading || !googleLoaded}
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-md mr-2"></span>
              Saving Address...
            </>
          ) : 'Save Address'}
        </button>
      </div>
    </div>
  );
} 