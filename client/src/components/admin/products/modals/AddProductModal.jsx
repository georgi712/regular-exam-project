import React, { useState, useRef, useEffect } from 'react';
import { uploadImageToFirebase } from '../../../../firebase/storage.js';

const AddProductModal = ({ isOpen, onClose, categories, onSave }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const categoryRef = useRef(null);
  const stockRef = useRef(null);
  const featuredRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (categoryRef.current && categories.length > 0) {
      setSelectedCategory(categories[0].value);
    }
  }, [categories]);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImageFile(file)
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      let imageUrl = '';

      if (imageFile) {
        imageUrl = await uploadImageToFirebase(imageFile);
      }

      const newProduct = {
        name: nameRef.current.value,
        price: parseFloat(priceRef.current.value),
        category: categoryRef.current.value,
        stock: parseInt(stockRef.current.value, 10),
        featured: featuredRef.current.checked,
        description: descriptionRef.current.value,
        imageUrl: imageUrl ,
      };
      
      onSave(newProduct);
      
      setImagePreview(null);
      setImageData(null);
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Error creating product. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-6 pb-3 border-b">
          <h3 className="font-bold text-lg">Add New Product</h3>
          <button className="btn btn-sm btn-circle" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-control w-full mb-3">
            <label className="label">
              <span className="label-text">Product Name</span>
            </label>
            <input 
              ref={nameRef}
              type="text" 
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
                ref={priceRef}
                type="number" 
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
                ref={categoryRef}
                className="select select-bordered w-full"
                required
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option disabled value="">Select category</option>
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
              <input 
                ref={stockRef}
                type="number" 
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
                  ref={featuredRef}
                  type="checkbox" 
                  className="toggle toggle-primary" 
                />
              </label>
            </div>
          </div>
          
          <div className="form-control w-full mb-3">
            <label className="label">
              <span className="label-text">Product Image</span>
            </label>
            {imagePreview && (
              <div className="mb-2">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="h-32 w-32 object-cover rounded-lg"
                />
              </div>
            )}
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full" 
            />
          </div>
          
          <div className="form-control w-full mb-3">
            <label className="block mb-2">
              <span className="text-sm font-medium">Description</span>
            </label>
            <textarea 
              ref={descriptionRef}
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
              disabled={isUploading}
            >
              {isUploading ? 'Saving...' : 'Save Product'}
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

export default AddProductModal; 