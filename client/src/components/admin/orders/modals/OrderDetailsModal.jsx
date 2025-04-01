import React, { useState, useEffect } from 'react';

const OrderDetailsModal = ({
  isOpen,
  order,
  onClose,
  formatDate,
  getStatusBadge,
  onStatusChange
}) => {
  const [localOrder, setLocalOrder] = useState(order);
  
  useEffect(() => {
    setLocalOrder(order);
  }, [order]);
  
  if (!isOpen || !localOrder) return null;
  
  const customerName = localOrder.userInfo ? 
    `${localOrder.userInfo.firstName} ${localOrder.userInfo.lastName}` : 
    localOrder.customerName || 'Unknown Customer';
  
  const email = localOrder.userInfo?.email || localOrder.email || '';
  
  const phone = localOrder.userInfo?.phone || localOrder.phone || '';
  
  const paymentMethod = localOrder.payment?.method || localOrder.paymentMethod || '';
  
  const orderDate = localOrder._createdOn ? new Date(localOrder._createdOn) : (localOrder.date ? new Date(localOrder.date) : null);

  const totalPrice = localOrder.pricing?.total || localOrder.total || 0;
  
  const handleStatusChange = async (orderId, newStatus) => {
    setLocalOrder(prev => ({
      ...prev,
      status: newStatus
    }));
    
    await onStatusChange(orderId, newStatus);
  };
  
  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box w-11/12 max-w-5xl">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h3 className="font-bold text-lg">Order Details - {localOrder._id}</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Customer Information</h4>
              <div className="space-y-2">
                <p className="font-medium">{customerName}</p>
                <p className="text-sm">{email}</p>
                <p className="text-sm">{phone}</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Delivery Address</h4>
              <p className="text-sm">{localOrder.address || ''}</p>
              {localOrder.deliveryNotes && (
                <>
                  <h5 className="font-medium mt-3 mb-1">Delivery Notes:</h5>
                  <p className="text-sm">{localOrder.deliveryNotes}</p>
                </>
              )}
              {localOrder.deliveryOption && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Delivery: </span> 
                  {localOrder.deliveryOption.charAt(0).toUpperCase() + localOrder.deliveryOption.slice(1)}
                </p>
              )}
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Order Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-base-content/60">Date & Time</p>
                  <p>{orderDate ? formatDate(orderDate.toISOString()) : 'No date'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/60">Payment Method</p>
                  <p className="capitalize">{paymentMethod}</p>
                  {localOrder.payment?.cardDetails && (
                    <p className="text-sm text-base-content/70">
                      Card ending in {localOrder.payment.cardDetails.lastFour}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/60">Status</p>
                  <div>{getStatusBadge(localOrder.status)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Update Status</h4>
              <select 
                className="select select-bordered w-full"
                value={localOrder.status}
                onChange={(e) => handleStatusChange(localOrder._id, e.target.value)}
              >
                {Object.values(localOrder.statuses || {}).map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="card bg-base-100 shadow-sm border border-base-300 mb-6">
          <div className="card-body p-5">
            <h4 className="font-semibold text-lg mb-3">Order Items</h4>
            <div className="overflow-x-auto">
              <table className="table table-compact w-full">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {localOrder.items.map((item, index) => (
                    <tr key={item.productId || index} className="hover">
                      <td className="font-medium">{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td className="font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-base-200 font-bold">
                    <td colSpan="3" className="text-right">Subtotal:</td>
                    <td>${(localOrder.pricing?.subtotal || 0).toFixed(2)}</td>
                  </tr>
                  {(localOrder.pricing?.deliveryFee || 0) > 0 && (
                    <tr className="bg-base-200">
                      <td colSpan="3" className="text-right">Delivery Fee:</td>
                      <td>${(localOrder.pricing?.deliveryFee || 0).toFixed(2)}</td>
                    </tr>
                  )}
                  {(localOrder.pricing?.tax || 0) > 0 && (
                    <tr className="bg-base-200">
                      <td colSpan="3" className="text-right">Tax:</td>
                      <td>${(localOrder.pricing?.tax || 0).toFixed(2)}</td>
                    </tr>
                  )}
                  <tr className="bg-base-200 font-bold">
                    <td colSpan="3" className="text-right">Total:</td>
                    <td>${totalPrice.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="modal-action pt-4 border-t">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  );
};

export default OrderDetailsModal; 