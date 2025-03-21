import React, { useContext, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from '../../../contexts/userContext.js';
import { LoadScript, Autocomplete } from "@react-google-maps/api";

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
 
export default function UserWelcome() {
  const [showAddressChange, setShowAddressChange] = useState(false);
  const {username} = useContext(UserContext);
  
  // Address validation state
  const [address, setAddress] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isInDeliveryArea, setIsInDeliveryArea] = useState(false);
  const autocompleteRef = useRef(null);

  const checkDeliveryArea = (addressComponents) => {
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
    if (autocompleteRef.current) {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.value = "";
        autocompleteRef.current.set('place', null);
      }
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry) {
        setValidationMessage("⚠️ Please select an address from the dropdown");
        return;
      }

      if (place.address_components) {
        const { deliverable, message } = checkDeliveryArea(place.address_components);
        setIsInDeliveryArea(deliverable);
        setValidationMessage(message);
      }

      setAddress(place.formatted_address);
    }
  };

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handleSaveAddress = () => {
    // Here you would typically save the address to the user profile
    // For now we'll just close the form
    setShowAddressChange(false);
    // Reset the form state
    clearAddress();
  };

  return (
    <section className="py-12 bg-base-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {username}!</h2>
            <p className="text-base-content/70">Ready for fresh and healthy options today?</p>
          </div>
          
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-6">
              {!showAddressChange ? (
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
                      <p className="text-base-content/80">ул. Витоша 89, Лозенец, София</p>
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
              ) : (
                <div className="space-y-4">
                  <h3 className="font-semibold">Update Your Delivery Address</h3>
                  
                  <LoadScript googleMapsApiKey={GOOGLE_API_KEY} libraries={["places"]}>
                    <div className="flex flex-col gap-4">
                      <div className="flex-grow relative">
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
                                placeholder="Enter your new delivery address"
                                className="input input-bordered input-lg w-full pr-10"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                              />
                              {address && (
                                <button
                                  onClick={clearAddress}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-sm"
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
                      </div>
                      
                      {validationMessage && (
                        <div className={`alert ${isInDeliveryArea ? 'alert-success' : 'alert-error'} shadow-lg`}>
                          <span>{validationMessage}</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-4 mt-2">
                        <button 
                          className="btn btn-outline btn-lg flex-1 h-14 sm:h-auto py-3"
                          onClick={() => {
                            setShowAddressChange(false);
                            clearAddress();
                          }}
                        >
                          Cancel
                        </button>
                        <button 
                          className={`btn btn-success btn-lg flex-1 h-14 sm:h-auto py-3 ${!isInDeliveryArea && address ? 'btn-disabled' : ''}`}
                          disabled={!isInDeliveryArea && address}
                          onClick={handleSaveAddress}
                        >
                          {isInDeliveryArea ? 'Save Address' : 'Check & Update Address'}
                        </button>
                      </div>
                    </div>
                  </LoadScript>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 