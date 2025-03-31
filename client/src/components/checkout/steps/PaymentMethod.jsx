import React from 'react';

const PaymentMethod = ({ formData, formErrors, paymentMethod, setPaymentMethod, handleInputChange }) => {
  return (
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
  );
};

export default PaymentMethod; 