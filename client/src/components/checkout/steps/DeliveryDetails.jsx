import React, { useState, useEffect, useRef } from 'react';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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

const loadGoogleMapsScript = (callback) => {
  if (window.google) {
    callback();
    return;
  }
  
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places&language=bg`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
};

const DeliveryDetails = ({ formData, formErrors, handleInputChange, handleAddressSelect, isAddressValid }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [placesService, setPlacesService] = useState(null);
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  
  useEffect(() => {
    loadGoogleMapsScript(() => {
      setScriptLoaded(true);
    });
  }, []);
  
  useEffect(() => {
    if (scriptLoaded && addressInputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'bg' } 
      });
      
      autocompleteRef.current.addListener('place_changed', handlePlaceChanged);
      
      setPlacesService(new window.google.maps.places.PlacesService(document.createElement('div')));
    }
  }, [scriptLoaded]);
  
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    
    if (!place || !place.address_components) {
      console.error('Invalid place object:', place);
      return;
    }
    
    const cityComponent = place.address_components.find(
      component => component.types.includes("locality")
    );
    
    const subLocalityComponent = place.address_components.find(
      component => component.types.includes("sublocality") || 
                   component.types.includes("neighborhood")
    );

    const city = cityComponent?.long_name;
    const district = subLocalityComponent?.long_name;
    
    let isValidDeliveryArea = false;
    
    if (city === "София" || city === "Sofia") {
      if (district && DELIVERY_AREAS[district]) {
        isValidDeliveryArea = true;
      } else {
        // If we can't identify a specific district but the city is Sofia, we'll deliver
        isValidDeliveryArea = true;
      }
    }
    
    handleAddressSelect(place.formatted_address, isValidDeliveryArea);
  };
  
  const handleAddressInputChange = (e) => {
    handleInputChange(e);
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-8 text-center sm:text-left">Delivery Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="form-control w-full">
          <label className="label" htmlFor="firstName">
            <span className="label-text font-medium">First Name</span>
          </label>
          <input 
            type="text" 
            id="firstName"
            name="firstName"
            placeholder="First Name" 
            className={`input input-bordered w-full rounded-lg h-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${formErrors.firstName ? 'input-error' : ''}`} 
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          {formErrors.firstName && <span className="text-error text-sm mt-1.5">{formErrors.firstName}</span>}
        </div>
        
        <div className="form-control w-full">
          <label className="label" htmlFor="lastName">
            <span className="label-text font-medium">Last Name</span>
          </label>
          <input 
            type="text" 
            id="lastName"
            name="lastName"
            placeholder="Last Name" 
            className={`input input-bordered w-full rounded-lg h-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${formErrors.lastName ? 'input-error' : ''}`} 
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
          {formErrors.lastName && <span className="text-error text-sm mt-1.5">{formErrors.lastName}</span>}
        </div>
      </div>
      
      <div className="form-control w-full mb-6">
        <label className="label" htmlFor="phone">
          <span className="label-text font-medium">Phone Number</span>
        </label>
        <input 
          type="tel" 
          id="phone"
          name="phone"
          placeholder="Phone Number" 
          className={`input input-bordered w-full rounded-lg h-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${formErrors.phone ? 'input-error' : ''}`} 
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
        {formErrors.phone && <span className="text-error text-sm mt-1.5">{formErrors.phone}</span>}
      </div>
      
      <div className="form-control w-full mb-6">
        <label className="label" htmlFor="address">
          <span className="label-text font-medium">Delivery Address</span>
        </label>
        <input 
          ref={addressInputRef}
          type="text"
          id="address"
          name="address"
          placeholder="Enter your delivery address" 
          className={`input input-bordered w-full rounded-lg h-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${formErrors.address ? 'input-error' : ''}`}
          value={formData.address}
          onChange={handleAddressInputChange}
          required
        />
        {formErrors.address && (
          <span className="text-error text-sm mt-1.5">{formErrors.address}</span>
        )}
        {!formErrors.address && isAddressValid && formData.address && (
          <span className="text-success text-sm mt-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Delivery available to this address
          </span>
        )}
        <div className="text-xs text-base-content/70 mt-2">
          We currently deliver to the following districts in Sofia: Младост, Люлин, Дружба, Надежда, Красно село, Лозенец, Център
        </div>
      </div>
      
      <div className="form-control w-full mb-6">
        <label className="label" htmlFor="notes">
          <span className="label-text font-medium">Delivery Notes (Optional)</span>
        </label>
        <textarea 
          id="notes"
          name="notes"
          placeholder="Any special instructions for delivery" 
          className="textarea textarea-bordered w-full rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
        ></textarea>
      </div>
    </div>
  );
};

export default DeliveryDetails; 