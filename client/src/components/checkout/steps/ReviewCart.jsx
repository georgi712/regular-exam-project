import React from 'react';

const ReviewCart = ({ cartItems, deliveryOption, setDeliveryOption }) => {
  return (
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
              <tr key={item.productId} className="hover">
                <td>
                  <div className="flex items-center space-x-3">
                    <div className="avatar">
                      <div className="mask mask-squircle w-12 h-12 border border-base-300">
                        <img src={item.imageUrl} alt={item.name} />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold">{item.name}</div>
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
  );
};

export default ReviewCart; 