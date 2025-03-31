import React, { useState, useEffect } from 'react';
import { useCart, useClearCart } from '../../api/userProfileApi.js';
import { useCreateOrder } from '../../api/ordersApi.js';
import useAuth from '../../hooks/useAuth.js';
import ReviewCart from './steps/ReviewCart';
import DeliveryDetails from './steps/DeliveryDetails';
import PaymentMethod from './steps/PaymentMethod';

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [deliveryOption, setDeliveryOption] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const { _id: userId, email, username, addresses } = useAuth();
  const defaultAddress = addresses?.find(addr => addr.isDefault) || addresses?.[0];
  
  const getUserNames = () => {
    if (!username) return { firstName: '', lastName: '' };
    
    const nameParts = username.trim().split(' ');
    if (nameParts.length === 1) {
      return { firstName: nameParts[0], lastName: '' };
    }
    
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    return { firstName, lastName };
  };
  
  const { firstName: authFirstName, lastName: authLastName } = getUserNames();
  
  const [formData, setFormData] = useState({
    firstName: authFirstName || '',
    lastName: authLastName || '',
    phone: '',
    address: defaultAddress?.address || '',
    notes: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    promoCode: ''
  });
  
  // Update form data if auth data changes
  useEffect(() => {
    const { firstName, lastName } = getUserNames();
    setFormData(prev => ({
      ...prev,
      firstName: firstName || prev.firstName,
      lastName: lastName || prev.lastName,
      address: defaultAddress?.address || prev.address
    }));
  }, [username, defaultAddress]);
  
  const [formErrors, setFormErrors] = useState({});
  const [isAddressValid, setIsAddressValid] = useState(!!defaultAddress);
  
  const { cartItems, loading, error } = useCart();
  const { createOrder, isCreating } = useCreateOrder();
  const { clearCart, isClearing } = useClearCart();
  
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = deliveryOption === 'express' ? 5.99 : 2.99;
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + deliveryFee + tax;
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleAddressSelect = (address, isValid) => {
    setFormData({
      ...formData,
      address: address
    });
    setIsAddressValid(isValid);
    
    if (!isValid) {
      setFormErrors({
        ...formErrors,
        address: 'We do not deliver to this address'
      });
    } else {
      const newErrors = { ...formErrors };
      delete newErrors.address;
      setFormErrors(newErrors);
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (activeStep === 2) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.address.trim()) errors.address = 'Delivery address is required';
      if (!isAddressValid) errors.address = 'We do not deliver to this address';
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
  
  const handlePlaceOrder = async () => {
    const errors = validateForm();
    
    if (Object.keys(errors).length === 0) {
      const orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
        items: cartItems,
        paymentMethod: paymentMethod,
        subtotal,
        deliveryFee,
        tax,
        total,
        deliveryOption
      };

      if (paymentMethod === 'card') {
        orderData.cardNumber = formData.cardNumber;
        orderData.cardName = formData.cardName;
      }

      const result = await createOrder(orderData);
      
      if (result.success) {
        await clearCart();
        setOrderNumber(result.data._id);
        setOrderSuccess(true);
      } else {
        setFormErrors({
          ...formErrors,
          submit: result.error
        });
      }
    } else {
      setFormErrors(errors);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }
  
  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p>Add some products to your cart before checking out.</p>
        <a href="/" className="btn btn-primary">Continue Shopping</a>
      </div>
    );
  }
  
  if (orderSuccess) {
    return (
      <div className="bg-base-200 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full bg-success/20 flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-2">Order Placed Successfully!</h2>
                  <p className="text-xl opacity-75 mb-6">Thank you for your purchase</p>
                  
                  <div className="badge badge-primary badge-lg font-medium text-base py-4 px-6 mb-6">
                    Order #{orderNumber}
                  </div>
                  
                  <div className="bg-base-200 rounded-lg p-6 w-full mb-8">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Order Total:</span>
                      <span className="font-bold">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Delivery Method:</span>
                      <span className="font-medium capitalize">{deliveryOption}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Payment Method:</span>
                      <span className="font-medium capitalize">{paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}</span>
                    </div>
                  </div>
                  
                  <p className="mb-8 text-sm opacity-70">
                    A confirmation email has been sent to <span className="font-medium">{email}</span>. 
                    You will receive updates about your order status.
                  </p>
                  
                  <a href="/" className="btn btn-primary btn-lg px-8 btn-wide">
                    Continue Shopping
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
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
                    <ReviewCart 
                      cartItems={cartItems} 
                      deliveryOption={deliveryOption}
                      setDeliveryOption={setDeliveryOption}
                    />
                  )}
                  
                  {/* Step 2: Delivery Details */}
                  {activeStep === 2 && (
                    <DeliveryDetails 
                      formData={formData}
                      formErrors={formErrors}
                      handleInputChange={handleInputChange}
                      handleAddressSelect={handleAddressSelect}
                      isAddressValid={isAddressValid}
                    />
                  )}
                  
                  {/* Step 3: Payment */}
                  {activeStep === 3 && (
                    <PaymentMethod 
                      formData={formData}
                      formErrors={formErrors}
                      paymentMethod={paymentMethod}
                      setPaymentMethod={setPaymentMethod}
                      handleInputChange={handleInputChange}
                    />
                  )}
                  
                  {formErrors.submit && (
                    <div className="alert alert-error mt-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>{formErrors.submit}</span>
                    </div>
                  )}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-10 pt-6 border-t border-base-300">
                    {activeStep > 1 && (
                      <button 
                        className="btn btn-outline rounded-lg px-6"
                        onClick={handlePrevStep}
                        type="button"
                        disabled={isCreating || isClearing}
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
                          disabled={isCreating || isClearing}
                        >
                          {isCreating || isClearing ? (
                            <>
                              <span className="loading loading-spinner loading-sm mr-2"></span>
                              Processing...
                            </>
                          ) : (
                            'Place Order'
                          )}
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

                    <div className="flex justify-between text-base">
                      <span>Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    
                    <div className="divider my-2"></div>
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
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