import React, { useState } from 'react';
import AddProductModal from './modals/AddProductModal';
import EditProductModal from './modals/EditProductModal';
import { useCreateProduct, useAllProducts } from '../../../api/productApi.js';
import { useNavigate } from 'react-router-dom';
import { useProductUrlParams } from '../../../api/productApi.js';

const ProductsManager = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const {create} = useCreateProduct();
  const navigate = useNavigate();
  
  const PRODUCT_CATEGORIES = [
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fresh-juices', label: 'Fresh Juices' },
    { value: 'nuts', label: 'Nuts' },
  ];
  
  const { products, error, loading, setProducts } = useProductUrlParams();

  const handleToggleFeatured = (productId) => {
    if (!products || !Array.isArray(products)) return;
    
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, featured: !product.featured } 
        : product
    );
    setProducts(updatedProducts);
  };

  const handleDeleteProduct = (productId) => {
    if (!products || !Array.isArray(products)) return;
    
    setProducts(products.filter(product => product.id !== productId));
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleSaveProduct = async (newProduct) => {
    try {
      const response = await create(newProduct);
      console.log('Product created:', response);
      
      if (!products || !Array.isArray(products)) {
        setProducts([response]);
      } else {
        setProducts([...products, response]);
      }
      
      setShowAddModal(false);
      navigate('/products');
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdateProduct = (updatedProduct) => {
    if (!products || !Array.isArray(products)) return;
    
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          Add Product
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error shadow-lg mb-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center my-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      {/* Product Table */}
      {!loading && (
        <div className="overflow-x-auto rounded-xl border border-base-300">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Origin</th>
                <th>Price/Kg</th>
                <th>Weight</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover">
                    <td className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 h-12 rounded-lg">
                          <img src={product.imageUrl} alt={product.name} />
                        </div>
                      </div>
                      <div className="font-medium">{product.name}</div>
                    </td>
                    <td>{getCategoryLabel(product.category)}</td>
                    <td>${product.price?.toFixed(2) || '0.00'}</td>
                    <td>{product.origin || 'N/A'}</td>
                    <td>${product.pricePerKg?.toFixed(2) || '0.00'}</td>
                    <td>{product.weight ? `${product.weight} kg` : 'N/A'}</td>
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
                ))
              ) : !loading && !error ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    No products found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}

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