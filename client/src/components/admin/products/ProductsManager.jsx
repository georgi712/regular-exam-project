import React, { useState } from 'react';

const ProductsManager = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Mock product data
  const [products, setProducts] = useState([
    {
      id: 1,
      image: "/images/products/apples.jpg",
      name: "Fresh Apples",
      price: 2.99,
      category: "Fruits",
      stock: 42,
      featured: true,
    },
    {
      id: 2,
      image: "/images/products/bananas.jpg",
      name: "Organic Bananas",
      price: 3.99,
      category: "Fruits",
      stock: 28,
      featured: false,
    },
    {
      id: 3,
      image: "/images/products/oranges.jpg",
      name: "Sweet Oranges",
      price: 4.99,
      category: "Fruits",
      stock: 15,
      featured: true,
    },
    {
      id: 4,
      image: "/images/products/strawberries.jpg",
      name: "Fresh Strawberries",
      price: 5.99,
      category: "Berries",
      stock: 8,
      featured: true,
    },
    {
      id: 5,
      image: "/images/products/broccoli.jpg",
      name: "Organic Broccoli",
      price: 3.49,
      category: "Vegetables",
      stock: 22,
      featured: false,
    },
  ]);

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleToggleFeatured = (productId) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, featured: !product.featured } 
        : product
    );
    setProducts(updatedProducts);
  };

  // Product categories for filtering
  const categories = [
    'All Categories',
    'Fruits',
    'Vegetables',
    'Berries',
    'Dairy',
    'Bakery',
    'Meat',
    'Seafood',
    'Frozen',
    'Snacks',
    'Beverages'
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Products Management</h2>
        
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              Categories
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
              {categories.map((category, index) => (
                <li key={index}><a>{category}</a></li>
              ))}
            </ul>
          </div>
          
          <div className="join flex-1 md:flex-initial">
            <input type="text" placeholder="Search products..." className="input input-bordered join-item w-full" />
            <button className="btn join-item">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          <button 
            className="btn btn-primary" 
            onClick={() => setShowAddModal(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-base-300">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200">
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover">
                <td>
                  <div className="avatar">
                    <div className="mask mask-squircle w-12 h-12">
                      <img src={product.image} alt={product.name} />
                    </div>
                  </div>
                </td>
                <td className="font-medium">{product.name}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.category}</td>
                <td>
                  <div className="flex items-center">
                    <span className={`mr-2 ${
                      product.stock > 20 ? 'text-success' : 
                      product.stock > 10 ? 'text-warning' : 'text-error'
                    }`}>●</span>
                    {product.stock} in stock
                  </div>
                </td>
                <td>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary toggle-sm" 
                    checked={product.featured} 
                    onChange={() => handleToggleFeatured(product.id)}
                  />
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button className="btn btn-ghost btn-sm text-error">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="font-bold text-lg">Add New Product</h3>
              <button className="btn btn-sm btn-circle" onClick={() => setShowAddModal(false)}>✕</button>
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
                  {categories.filter(cat => cat !== 'All Categories').map((category, index) => (
                    <option key={index}>{category}</option>
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
              <button className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn btn-primary">Save Product</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowAddModal(false)}>close</button>
          </form>
        </div>
      )}
      
      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="modal modal-open modal-bottom sm:modal-middle">
          <div className="modal-box">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
              <h3 className="font-bold text-lg">Edit Product: {selectedProduct.name}</h3>
              <button className="btn btn-sm btn-circle" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            
            <div className="form-control w-full mb-3">
              <label className="label">
                <span className="label-text">Product Name</span>
              </label>
              <input 
                type="text" 
                placeholder="Enter product name" 
                className="input input-bordered w-full" 
                defaultValue={selectedProduct.name}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Price ($)</span>
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  placeholder="0.00" 
                  className="input input-bordered w-full" 
                  defaultValue={selectedProduct.price}
                />
              </div>
              
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select 
                  className="select select-bordered w-full"
                  defaultValue={selectedProduct.category}
                >
                  {categories.filter(cat => cat !== 'All Categories').map((category, index) => (
                    <option key={index}>{category}</option>
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
                  type="number" 
                  min="0" 
                  placeholder="0" 
                  className="input input-bordered w-full" 
                  defaultValue={selectedProduct.stock}
                />
              </div>
              
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Featured Product</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    defaultChecked={selectedProduct.featured}
                  />
                </label>
              </div>
            </div>
            
            <div className="form-control w-full mb-3">
              <label className="label">
                <span className="label-text">Current Image</span>
              </label>
              <div className="flex items-center gap-3 mb-2">
                <div className="avatar">
                  <div className="mask mask-squircle w-16 h-16">
                    <img src={selectedProduct.image} alt={selectedProduct.name} />
                  </div>
                </div>
                <span className="text-sm">{selectedProduct.image}</span>
              </div>
              <label className="label">
                <span className="label-text">Change Image (optional)</span>
              </label>
              <input type="file" className="file-input file-input-bordered w-full" />
            </div>
            
            <div className="form-control w-full mb-3">
              <label className="block mb-2">
                <span className="text-sm font-medium">Description</span>
              </label>
              <textarea 
                className="textarea textarea-bordered h-24 w-full" 
                placeholder="Enter product description"
              ></textarea>
            </div>
            
            <div className="modal-action pt-4 border-t">
              <button className="btn btn-ghost" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary">Save Changes</button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowEditModal(false)}>close</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProductsManager; 