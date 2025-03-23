import React from 'react';

const AddProductModal = ({ isOpen, onClose, categories, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h3 className="font-bold text-lg">Add New Product</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        
        <div className="form-control w-full mb-3">
          <label className="label">
            <span className="label-text">Product Name</span>
          </label>
          <input type="text" placeholder="Enter product name" className="input input-bordered w-full" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Price ($)</span>
            </label>
            <input type="number" step="0.01" min="0" placeholder="0.00" className="input input-bordered w-full" />
          </div>
          
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select className="select select-bordered w-full">
              <option disabled selected>Select category</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text">Stock Quantity</span>
            </label>
            <input type="number" min="0" placeholder="0" className="input input-bordered w-full" />
          </div>
          
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Featured Product</span>
              <input type="checkbox" className="toggle toggle-primary" />
            </label>
          </div>
        </div>
        
        <div className="form-control w-full mb-3">
          <label className="label">
            <span className="label-text">Product Image</span>
          </label>
          <input type="file" className="file-input file-input-bordered w-full" />
        </div>
        
        <div className="form-control w-full mb-3">
          <label className="block mb-2">
            <span className="text-sm font-medium">Description</span>
          </label>
          <textarea className="textarea textarea-bordered h-24 w-full" placeholder="Enter product description"></textarea>
        </div>
        
        <div className="modal-action pt-4 border-t">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}>Save Product</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  );
};

export default AddProductModal; 