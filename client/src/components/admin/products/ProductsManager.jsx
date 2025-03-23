import React, { useState } from 'react';
import AddProductModal from './modals/AddProductModal';
import EditProductModal from './modals/EditProductModal';
import { useCreateProduct } from '../../../api/productApi.js';
import { useNavigate } from 'react-router-dom';

const ProductsManager = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const {create} = useCreateProduct();
  const navigate = useNavigate();
  
  // Product categories for filtering
  const PRODUCT_CATEGORIES = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'home', label: 'Home & Kitchen' },
    { value: 'books', label: 'Books' },
    { value: 'toys', label: 'Toys & Games' },
  ];
  
  // Mock products data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Wireless Bluetooth Headphones',
      category: 'electronics',
      price: 89.99,
      stock: 45,
      featured: true,
      image: 'https://placehold.co/100x100/333/FFF?text=BT+Headphones',
      description: 'High-quality wireless headphones with noise cancellation.'
    },
    {
      id: 2,
      name: 'Men\'s Casual T-Shirt',
      category: 'clothing',
      price: 24.99,
      stock: 120,
      featured: false,
      image: 'https://placehold.co/100x100/333/FFF?text=T-Shirt',
      description: 'Comfortable cotton t-shirt for everyday wear.'
    },
    {
      id: 3,
      name: 'Stainless Steel Cookware Set',
      category: 'home',
      price: 149.99,
      stock: 30,
      featured: true,
      image: 'https://placehold.co/100x100/333/FFF?text=Cookware',
      description: 'Premium 10-piece stainless steel cookware set.'
    },
    {
      id: 4,
      name: 'Best-Selling Novel',
      category: 'books',
      price: 18.95,
      stock: 200,
      featured: false,
      image: 'https://placehold.co/100x100/333/FFF?text=Book',
      description: 'The latest best-selling fiction novel.'
    },
    {
      id: 5,
      name: 'Building Blocks Set',
      category: 'toys',
      price: 34.50,
      stock: 60,
      featured: false,
      image: 'https://placehold.co/100x100/333/FFF?text=Blocks',
      description: 'Creative building blocks for ages 3+.'
    },
  ]);

  const handleToggleFeatured = (productId) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, featured: !product.featured } 
        : product
    );
    setProducts(updatedProducts);
  };

  const handleDeleteProduct = (productId) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleSaveProduct = async (newProduct) => {
    const response = await create(newProduct)
    setProducts([...products, newProduct]);
    console.log(response);
    setShowAddModal(false);
    navigate('/products')
  };

  const handleUpdateProduct = (updatedProduct) => {
    const updatedProducts = products.map(product => 
      product.id === updatedProduct.id 
        ? updatedProduct
        : product
    );
    setProducts(updatedProducts);
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const getCategoryLabel = (categoryValue) => {
    const category = PRODUCT_CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-semibold">Products Management</h2>
        <div className="flex w-full md:w-auto gap-3 items-center">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-outline btn-sm">
              Filter by Category
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow bg-base-100 rounded-box w-52 mt-2">
              <li><a>All Categories</a></li>
              {PRODUCT_CATEGORIES.map(category => (
                <li key={category.value}><a>{category.label}</a></li>
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
          
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-xl border border-base-300">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200">
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover">
                <td className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-lg">
                      <img src={product.image} alt={product.name} />
                    </div>
                  </div>
                  <div className="font-medium">{product.name}</div>
                </td>
                <td>{getCategoryLabel(product.category)}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {product.stock}
                    {product.stock < 10 && <div className="badge badge-sm badge-error">Low</div>}
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
                      onClick={() => openEditModal(product)}
                    >
                      Edit
                    </button>
                    
                    <button 
                      className="btn btn-ghost btn-sm text-error"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Modal Components */}
      <AddProductModal
        isOpen={showAddModal}
        categories={PRODUCT_CATEGORIES}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveProduct}
      />
      
      <EditProductModal
        isOpen={showEditModal}
        product={selectedProduct}
        categories={PRODUCT_CATEGORIES}
        onClose={() => setShowEditModal(false)}
        onSave={handleUpdateProduct}
      />
    </div>
  );
};

export default ProductsManager; 