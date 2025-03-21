import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const UserWelcome = ({ userName = "Guest" }) => {
  const [showAddressChange, setShowAddressChange] = useState(false);
  
  return (
    <section className="py-12 bg-base-200">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h2>
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
                  
                  <div className="form-control">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter your new delivery address"
                        className="input input-bordered input-lg w-full pr-10"
                      />
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
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
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      className="btn btn-outline btn-lg flex-1 h-14 sm:h-auto py-3"
                      onClick={() => setShowAddressChange(false)}
                    >
                      Cancel
                    </button>
                    <button className="btn btn-success btn-lg flex-1 h-14 sm:h-auto py-3">
                      Check & Update Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserWelcome; 