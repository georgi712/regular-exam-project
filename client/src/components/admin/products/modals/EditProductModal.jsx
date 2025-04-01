import React, { useState, useEffect } from 'react';
import { uploadImageToFirebase } from '../../../../firebase/storage';
import { useEditProduct } from '../../../../api/productApi.js';
import { useToastContext } from '../../../../contexts/ToastContext.jsx';

const EditProductModal = ({ isOpen, onClose, product, categories, onProductUpdated }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { edit, isEditing, error } = useEditProduct();
  const toast = useToastContext();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    origin: '',
    pricePerKg: '',
    weight: '',
    category: '',
    stock: '',
    featured: false,
    description: '',
  });
  
  useEffect(() => {
    if (product && isOpen) {
      setImagePreview(product.imageUrl);
      
      setFormData({
        name: product.name || '',
        price: product.price || '',
        origin: product.origin || '',
        pricePerKg: product.pricePerKg || '',
        weight: product.weight || '',
        category: product.category || '',
        stock: product.stock || '',
        featured: product.featured || false,
        description: product.description || '',
      });
    }
  }, [product, isOpen]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setImageFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const requiredFields = ['name', 'price', 'category', 'stock'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    const numericFields = ['price', 'pricePerKg', 'stock'];
    for (const field of numericFields) {
      if (formData[field] && isNaN(parseFloat(formData[field]))) {
        toast.error(`${field} must be a valid number`);
        return;
      }
    }
    
    const loadingToastId = toast.info('Updating product...', 10000);
    
    try {
      let imageUrl = product.imageUrl; 
      
      if (imageFile) {
        imageUrl = await uploadImageToFirebase(imageFile);
      }
      
      const updatedProduct = {
        ...product, 
        ...formData,
        price: parseFloat(formData.price),
        pricePerKg: parseFloat(formData.pricePerKg),
        weight: parseFloat(formData.weight),
        stock: parseInt(formData.stock, 10),
        imageUrl: imageUrl, 
        updatedAt: new Date().toISOString(),
      };
      
      const result = await edit(product._id, updatedProduct);
      
      toast.removeToast(loadingToastId);
      
      if (result.success) {
        onProductUpdated(result.data);
        toast.success(`Product "${formData.name}" updated successfully`);
      } else {
        toast.error(result.error || 'Failed to update product');
      }
    } catch (error) {
      toast.removeToast(loadingToastId);
      toast.error(`Error: ${error.message || 'Failed to update product'}`);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h3 className="font-bold text-lg">Edit Product</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-control w-full mb-3">
            <label className="label">
              <span className="label-text">Product Name</span>
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name" 
              className="input input-bordered w-full" 
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Price ($)</span>
              </label>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01" 
                min="0" 
                placeholder="0.00" 
                className="input input-bordered w-full" 
                required
              />
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Category</span>
              </label>
              <select 
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select select-bordered w-full"
                required
              >
                <option key="select-category" disabled value="">Select category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-control w-full mb-3">
            <label className="label">
              <span className="label-text">Origin (Country/Region)</span>
            </label>
            <input 
              type="text" 
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              placeholder="e.g., Spain, Italy, Greece" 
              className="input input-bordered w-full"
              required
            />
            <label className="label">
              <span className="label-text-alt">Where the product is from</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Price per Kg ($)</span>
              </label>
              <input 
                type="number" 
                name="pricePerKg"
                value={formData.pricePerKg}
                onChange={handleChange}
                step="0.01" 
                min="0" 
                placeholder="0.00" 
                className="input input-bordered w-full"
                required
              />
              <label className="label">
                <span className="label-text-alt">Cost per kilogram</span>
              </label>
            </div>
            
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Weight (kg)</span>
              </label>
              <input 
                type="number" 
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.01" 
                min="0" 
                placeholder="0.00" 
                className="input input-bordered w-full"
                required
              />
              <label className="label">
                <span className="label-text-alt">Weight in kilograms</span>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Stock Quantity</span>
              </label>
              <input 
                type="number" 
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0" 
                placeholder="0" 
                className="input input-bordered w-full" 
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Featured Product</span>
                <input 
                  type="checkbox" 
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="toggle toggle-primary" 
                />
              </label>
            </div>
          </div>
          
          <div className="form-control w-full mb-3">
            <label className="label">
              <span className="label-text">Product Image</span>
            </label>
            <div className="mb-2">
              <img 
                src={imagePreview} 
                alt={product.name} 
                className="h-32 w-32 object-cover rounded-lg" 
              />
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full" 
            />
            <p className="text-xs mt-1 text-base-content/70">Leave empty to keep the current image</p>
          </div>
          
          <div className="form-control w-full mb-3">
            <label className="block mb-2">
              <span className="text-sm font-medium">Description</span>
            </label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="textarea textarea-bordered h-24 w-full" 
              placeholder="Enter product description"
              required
            ></textarea>
          </div>
          
          <div className="modal-action pt-4 border-t">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </div>
  );
};

export default EditProductModal; 