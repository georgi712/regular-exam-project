import React from 'react';

const OrderDetailsModal = ({
  isOpen,
  order,
  onClose,
  formatDate,
  getStatusBadge,
  onStatusChange
}) => {
  if (!isOpen || !order) return null;
  
  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box w-11/12 max-w-5xl">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h3 className="font-bold text-lg">Order Details - {order.id}</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Customer Information</h4>
              <div className="space-y-2">
                <p className="font-medium">{order.customerName}</p>
                <p className="text-sm">{order.email}</p>
                <p className="text-sm">{order.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Delivery Address</h4>
              <p className="text-sm">{order.address}</p>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Order Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-base-content/60">Date & Time</p>
                  <p>{formatDate(order.date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/60">Payment Method</p>
                  <p>{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content/60">Status</p>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 shadow-sm border border-base-300">
            <div className="card-body p-5">
              <h4 className="font-semibold text-lg mb-3">Update Status</h4>
              <select 
                className="select select-bordered w-full"
                defaultValue={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
              >
                {Object.values(order.statuses || {}).map(status => (
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
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover">
                      <td className="font-medium">{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td className="font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="bg-base-200 font-bold">
                    <td colSpan="3" className="text-right">Total:</td>
                    <td>${order.total.toFixed(2)}</td>
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