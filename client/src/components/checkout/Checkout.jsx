import React, { useState } from 'react';

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    notes: '',
    saveAddress: false,
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    promoCode: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  // Mock cart data - would come from a cart context or redux store in a real app
  const cartItems = [
    {
      id: 1,
      name: 'Fresh Apples',
      price: 2.99,
      quantity: 2,
      image: '/images/apple.jpg',
      grammage: '500g'
    },
    {
      id: 2,
      name: 'Organic Bananas',
      price: 3.99,
      quantity: 1,
      image: '/images/banana.jpg',
      grammage: '500g'
    },
    {
      id: 3,
      name: 'Sweet Oranges',
      price: 4.99,
      quantity: 3,
      image: '/images/orange.jpg',
      grammage: '500g'
    }
  ];
  
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOption === 'express' ? 5.99 : 2.99;
  const total = subtotal + deliveryFee;
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is being edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (activeStep === 2) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.address.trim()) errors.address = 'Delivery address is required';
    }
    
    if (activeStep === 3 && paymentMethod === 'card') {
      if (!formData.cardNumber.trim()) errors.cardNumber = 'Card number is required';
      if (!formData.cardExpiry.trim()) errors.cardExpiry = 'Expiry date is required';
      if (!formData.cardCvc.trim()) errors.cardCvc = 'CVC is required';
      if (!formData.cardName.trim()) errors.cardName = 'Name on card is required';
    }
    
    return errors;
  };
  
  const handleNextStep = () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      setActiveStep(prevStep => Math.min(prevStep + 1, 3));
    } else {
      setFormErrors(errors);
    }
  };
  
  const handlePrevStep = () => {
    setActiveStep(prevStep => Math.max(prevStep - 1, 1));
  };
  
  const handlePlaceOrder = () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      // Handle order submission
      alert('Your order has been placed successfully!');
    } else {
      setFormErrors(errors);
    }
  };
  
  return (
    <div className="bg-base-200 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-10">Checkout</h1>
          
          {/* Progress Steps */}
          <div className="flex justify-center mb-12">
            <ul className="steps steps-horizontal w-full md:w-2/3">
              <li className={`step ${activeStep >= 1 ? 'step-primary' : ''}`}>Review Cart</li>
              <li className={`step ${activeStep >= 2 ? 'step-primary' : ''}`}>Delivery Details</li>
              <li className={`step ${activeStep >= 3 ? 'step-primary' : ''}`}>Payment</li>
            </ul>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-6 sm:p-8">
                  {/* Step 1: Review Cart */}
                  {activeStep === 1 && (
                    <div>
                      <h2 className="text-xl font-bold mb-8 text-center sm:text-left">Review Your Order</h2>
                      
                      <div className="overflow-x-auto rounded-lg border border-base-300 mb-8">
                        <table className="table w-full">
                          <thead className="bg-base-200">
                            <tr>
                              <th className="bg-transparent">Product</th>
                              <th className="bg-transparent text-center">Quantity</th>
                              <th className="bg-transparent text-end">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cartItems.map(item => (
                              <tr key={item.id} className="hover">
                                <td>
                                  <div className="flex items-center space-x-3">
                                    <div className="avatar">
                                      <div className="mask mask-squircle w-12 h-12 border border-base-300">
                                        <img src={item.image} alt={item.name} />
                                      </div>
                                    </div>
                                    <div>
                                      <div className="font-bold">{item.name}</div>
                                      <div className="text-sm opacity-70">{item.grammage}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-end font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">Delivery Options</h3>
                        <div className="flex flex-col gap-4">
                          <label className="flex items-center p-4 border border-base-300 rounded-xl cursor-pointer hover:border-primary hover:bg-base-100/50 transition-all duration-200">
                            <input 
                              type="radio" 
                              className="radio radio-primary" 
                              checked={deliveryOption === 'standard'}
                              onChange={() => setDeliveryOption('standard')}
                              name="deliveryOption"
                              id="standard"
                            />
                            <div className="flex flex-col ml-4">
                              <span className="font-medium text-lg">Standard Delivery</span>
                              <span className="text-sm opacity-70">Delivery within 24 hours</span>
                            </div>
                            <span className="ml-auto font-semibold text-lg">$2.99</span>
                          </label>
                          
                          <label className="flex items-center p-4 border border-base-300 rounded-xl cursor-pointer hover:border-primary hover:bg-base-100/50 transition-all duration-200">
                            <input 
                              type="radio" 
                              className="radio radio-primary" 
                              checked={deliveryOption === 'express'}
                              onChange={() => setDeliveryOption('express')}
                              name="deliveryOption"
                              id="express"
                            />
                            <div className="flex flex-col ml-4">
                              <span className="font-medium text-lg">Express Delivery</span>
                              <span className="text-sm opacity-70">Delivery within 2 hours</span>
                            </div>
                            <span className="ml-auto font-semibold text-lg">$5.99</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Delivery Details */}
                  {activeStep === 2 && (
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
                        <textarea 
                          id="address"
                          name="address"
                          placeholder="Enter your delivery address" 
                          className={`textarea textarea-bordered w-full rounded-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${formErrors.address ? 'textarea-error' : ''}`}
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={4}
                          required
                        ></textarea>
                        {formErrors.address && <span className="text-error text-sm mt-1.5">{formErrors.address}</span>}
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
                      
                      <div className="form-control mt-6 bg-base-200 p-4 rounded-lg">
                        <label className="cursor-pointer flex items-center justify-start gap-3" htmlFor="saveAddress">
                          <input 
                            type="checkbox" 
                            id="saveAddress"
                            name="saveAddress"
                            className="checkbox checkbox-primary" 
                            checked={formData.saveAddress}
                            onChange={handleInputChange}
                          />
                          <span className="label-text text-base">Save this address for future orders</span>
                        </label>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Payment */}
                  {activeStep === 3 && (
                    <div>
                      <h2 className="text-xl font-bold mb-8 text-center sm:text-left">Payment Method</h2>
                      
                      <div className="flex flex-col gap-4 mb-8">
                        <label className="flex items-center p-4 border border-base-300 rounded-xl cursor-pointer hover:border-primary hover:bg-base-100/50 transition-all duration-200">
                          <input 
                            type="radio" 
                            className="radio radio-primary" 
                            checked={paymentMethod === 'card'}
                            onChange={() => setPaymentMethod('card')}
                            name="paymentMethod"
                            id="cardPayment"
                          />
                          <div className="flex flex-col ml-4">
                            <span className="font-medium text-lg">Credit/Debit Card</span>
                          </div>
                          <div className="ml-auto flex gap-2">
                            <div className="w-10 h-6 bg-base-300 rounded-md flex items-center justify-center text-xs font-medium">VISA</div>
                            <div className="w-10 h-6 bg-base-300 rounded-md flex items-center justify-center text-xs font-medium">MC</div>
                          </div>
                        </label>
                        
                        {paymentMethod === 'card' && (
                          <div className="card bg-base-200 rounded-xl p-6 mt-2 mb-6 border border-base-300">
                            <div className="grid grid-cols-1 gap-5">
                              <div className="form-control w-full">
                                <label className="label" htmlFor="cardNumber">
                                  <span className="label-text font-medium">Card Number</span>
                                </label>
                                <input 
                                  type="text" 
                                  id="cardNumber"
                                  name="cardNumber"
                                  placeholder="0000 0000 0000 0000" 
                                  className={`input input-bordered w-full rounded-lg h-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${formErrors.cardNumber ? 'input-error' : ''}`}
                                  value={formData.cardNumber}
                                  onChange={handleInputChange}
                                  required
                                />
                                {formErrors.cardNumber && <span className="text-error text-sm mt-1.5">{formErrors.cardNumber}</span>}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-5">
                                <div className="form-control w-full">
                                  <label className="label" htmlFor="cardExpiry">
                                    <span className="label-text font-medium">Expiry Date</span>
                                  </label>
                                  <input 
                                    type="text" 
                                    id="cardExpiry"
                                    name="cardExpiry"
                                    placeholder="MM/YY" 
                                    className={`input input-bordered w-full rounded-lg h-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${formErrors.cardExpiry ? 'input-error' : ''}`}
                                    value={formData.cardExpiry}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  {formErrors.cardExpiry && <span className="text-error text-sm mt-1.5">{formErrors.cardExpiry}</span>}
                                </div>
                                
                                <div className="form-control w-full">
                                  <label className="label" htmlFor="cardCvc">
                                    <span className="label-text font-medium">CVC</span>
                                  </label>
                                  <input 
                                    type="text" 
                                    id="cardCvc"
                                    name="cardCvc"
                                    placeholder="CVC" 
                                    className={`input input-bordered w-full rounded-lg h-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${formErrors.cardCvc ? 'input-error' : ''}`}
                                    value={formData.cardCvc}
                                    onChange={handleInputChange}
                                    required
                                  />
                                  {formErrors.cardCvc && <span className="text-error text-sm mt-1.5">{formErrors.cardCvc}</span>}
                                </div>
                              </div>
                              
                              <div className="form-control w-full">
                                <label className="label" htmlFor="cardName">
                                  <span className="label-text font-medium">Name on Card</span>
                                </label>
                                <input 
                                  type="text" 
                                  id="cardName"
                                  name="cardName"
                                  placeholder="Name on Card" 
                                  className={`input input-bordered w-full rounded-lg h-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${formErrors.cardName ? 'input-error' : ''}`}
                                  value={formData.cardName}
                                  onChange={handleInputChange}
                                  required
                                />
                                {formErrors.cardName && <span className="text-error text-sm mt-1.5">{formErrors.cardName}</span>}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <label className="flex items-center p-4 border border-base-300 rounded-xl cursor-pointer hover:border-primary hover:bg-base-100/50 transition-all duration-200">
                          <input 
                            type="radio" 
                            className="radio radio-primary" 
                            checked={paymentMethod === 'cash'}
                            onChange={() => setPaymentMethod('cash')}
                            name="paymentMethod"
                            id="cashPayment"
                          />
                          <div className="flex flex-col ml-4">
                            <span className="font-medium text-lg">Cash on Delivery</span>
                            <span className="text-sm opacity-70">Pay when you receive your order</span>
                          </div>
                        </label>
                      </div>
                      
                      <div className="alert alert-success rounded-xl shadow-md mt-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-medium">Your order is ready to be placed!</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-10 pt-6 border-t border-base-300">
                    {activeStep > 1 && (
                      <button 
                        className="btn btn-outline rounded-lg px-6"
                        onClick={handlePrevStep}
                        type="button"
                      >
                        Back
                      </button>
                    )}
                    
                    <div className="ml-auto">
                      {activeStep < 3 ? (
                        <button 
                          className="btn btn-primary rounded-lg px-8"
                          onClick={handleNextStep}
                          type="button"
                        >
                          Continue
                        </button>
                      ) : (
                        <button 
                          className="btn btn-success btn-lg rounded-lg px-8"
                          onClick={handlePlaceOrder}
                          type="button"
                        >
                          Place Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card bg-base-100 shadow-xl sticky top-8">
                <div className="card-body p-6">
                  <h2 className="text-xl font-bold mb-6 text-center sm:text-left">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-base">
                      <span>Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between text-base">
                      <span>Delivery</span>
                      <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                    </div>
                    
                    <div className="divider my-2"></div>
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <div className="form-control">
                      <label className="label pb-1" htmlFor="promoCode">
                        <span className="label-text font-medium">Promo Code</span>
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          id="promoCode"
                          name="promoCode"
                          placeholder="Enter promo code" 
                          className="input input-bordered flex-1 rounded-lg h-12 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                          value={formData.promoCode}
                          onChange={handleInputChange}
                        />
                        <button className="btn btn-outline rounded-lg" type="button">Apply</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-base-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-success">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-sm font-medium">Secure Checkout</span>
                    </div>
                    <p className="text-xs text-base-content/70 mt-2">
                      Your personal data will be used to process your order, support your experience, and for other purposes described in our privacy policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 