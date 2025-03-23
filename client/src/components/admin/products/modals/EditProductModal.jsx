import React, { useState, useRef, useEffect } from 'react';

const EditProductModal = ({ isOpen, onClose, product, categories, onSave }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const nameRef = useRef(null);
  const priceRef = useRef(null);
  const categoryRef = useRef(null);
  const stockRef = useRef(null);
  const featuredRef = useRef(null);
  const descriptionRef = useRef(null);

  // Initialize with existing product data
  useEffect(() => {
    if (product && isOpen) {
      // Use existing product image for preview
      setImagePreview(product.image);
      setImageData(product.image);
    }
  }, [product, isOpen]);

  // Clean up preview URL when component unmounts or when preview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      // Read the file as Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result contains the Base64 data URL
        setImageData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create updated product object
      const updatedProduct = {
        ...product, // Keep the original id and other unchanged properties
        name: nameRef.current.value,
        price: parseFloat(priceRef.current.value),
        category: categoryRef.current.value,
        stock: parseInt(stockRef.current.value, 10),
        featured: featuredRef.current.checked,
        description: descriptionRef.current.value,
        image: imageData || product.image, // Use new image or keep existing
      };
      
      // Call the save function from props
      onSave(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Error updating product. Please try again.");
    } finally {
      setIsSubmitting(false);
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
              ref={nameRef}
              type="text" 
              placeholder="Enter product name" 
              className="input input-bordered w-full" 
              defaultValue={product.name}
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
                defaultValue={product.price}
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
                defaultValue={product.category}
                required
              >
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
                defaultValue={product.stock}
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
                  defaultChecked={product.featured}
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
              ref={descriptionRef}
              className="textarea textarea-bordered h-24 w-full" 
              placeholder="Enter product description"
              defaultValue={product.description}
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