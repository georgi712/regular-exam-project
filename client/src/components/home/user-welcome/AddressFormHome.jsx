import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

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

const libraries = ["places"];

export default function AddressFormHome({ 
  address = "", 
  onAddressSelect, 
  onSave, 
  onCancel,
  isLoading,
  validationMessage = "",
  isInDeliveryArea = false,
  errorMessage = null,
  hasSavedAddress = false
}) {
  const autocompleteRef = useRef(null);
  const [inputAddress, setInputAddress] = useState(address);
  
  useEffect(() => {
    setInputAddress(address);
  }, [address]);

  const mapOptions = useMemo(() => ({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
    id: 'home-google-map-script'
  }), []);

  const onPlaceChanged = useCallback(() => {
    if (autocompleteRef.current) {
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

      setInputAddress(place.formatted_address);
      onAddressSelect({
        formatted_address: place.formatted_address,
        address_components: place.address_components,
        valid: true,
        message: ""
      });
    }
  }, [onAddressSelect]);

  const onAutocompleteLoad = useCallback((autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);
  
  const handleClear = useCallback(() => {
    setInputAddress("");
    if (autocompleteRef.current) {
      autocompleteRef.current.set('place', null);
    }
    onAddressSelect({ 
      formatted_address: null, 
      address_components: null,
      valid: false, 
      message: "" 
    });
  }, [onAddressSelect]);
  
  const handleChange = useCallback((e) => {
    setInputAddress(e.target.value);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">{hasSavedAddress ? "Update Your Delivery Address" : "Add Your Delivery Address"}</h3>
      
      <div className="flex flex-col gap-4">
        <div className="flex-grow relative">
          <LoadScript 
            {...mapOptions} 
            onError={(error) => console.error("Google Maps loading error:", error)}
            onLoad={() => console.log("Google Maps loaded successfully")}
            key={`maps-home-${Date.now()}`}
          >
            <Autocomplete
              onLoad={onAutocompleteLoad}
              onPlaceChanged={onPlaceChanged}
              options={{
                types: ["address"],
                componentRestrictions: { country: "BG" }
              }}
            >
              <div className="form-control">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter your delivery address"
                    className="input input-bordered input-lg w-full pr-10"
                    value={inputAddress}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {inputAddress && !isLoading && (
                    <button
                      onClick={handleClear}
                      className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-sm"
                      type="button"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 px-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex flex-col xs:flex-row gap-1 xs:gap-3 text-sm">
                    <span className="text-base-content/70">Format: <span className="text-info font-medium">Street name and number, District, Sofia</span></span>
                  </div>
                </div>
              </div>
            </Autocomplete>
          </LoadScript>
        </div>
        
        {/* Loading indicator overlay */}
        {isLoading && (
          <div className="alert alert-info shadow-lg animate-pulse">
            <div className="flex items-center">
              <span className="loading loading-spinner loading-md mr-2"></span>
              <span>Processing your address... Please wait</span>
            </div>
          </div>
        )}
        
        {validationMessage && !isLoading && (
          <div className={`alert ${isInDeliveryArea ? 'alert-success' : 'alert-error'} shadow-lg`}>
            <span>{validationMessage}</span>
          </div>
        )}
        
        {errorMessage && !isLoading && (
          <div className="alert alert-error shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{errorMessage}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          {hasSavedAddress && (
            <button
              className="btn btn-outline btn-lg flex-1 h-14 sm:h-auto py-3"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            className={`btn ${isLoading ? 'btn-info' : 'btn-success'} btn-lg flex-1 h-14 sm:h-auto py-3 ${
              (!isInDeliveryArea && inputAddress) || isLoading ? 'btn-disabled' : ''
            }`}
            disabled={(!isInDeliveryArea && inputAddress) || isLoading}
            onClick={onSave}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-md mr-2"></span>
                Saving Address...
              </>
            ) : isInDeliveryArea ? 'Save Address' : 'Check & Save Address'}
          </button>
        </div>
      </div>
    </div>
  );
} 