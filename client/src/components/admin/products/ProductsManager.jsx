import React, { useState, useCallback, useEffect } from 'react';
import AddProductModal from './modals/AddProductModal';
import EditProductModal from './modals/EditProductModal';
import { useDeleteProduct, useAdvancedProductFiltering } from '../../../api/productApi.js';
import { useSearchParams } from 'react-router-dom';

const ProductsManager = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { deleteProduct } = useDeleteProduct();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const PRODUCT_CATEGORIES = [
    { value: 'all', label: 'All Categories' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'juices', label: 'Fresh Juices' },
    { value: 'nuts', label: 'Nuts' },
  ];
  
  const { 
    products, 
    allProducts,
    totalCount, 
    error, 
    loading, 
    filters, 
    updateFilters, 
    resetFilters, 
    refreshProducts,
    filterOptions
  } = useAdvancedProductFiltering();

  const handleProductAdded = useCallback((newProduct) => {
    refreshProducts();
    setShowAddModal(false);
  }, [refreshProducts]);

  const handleProductUpdated = useCallback((updatedProduct) => {
    refreshProducts();
    setShowEditModal(false);
    setSelectedProduct(null);
  }, [refreshProducts]);

  const handleDeleteProduct = async (productId) => {
    try {
      const result = await deleteProduct(productId);      
      refreshProducts();
    } catch (error) {
      alert(`Failed to delete product: ${error.message || 'Unknown error'}`);
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const getCategoryLabel = (categoryValue) => {
    const category = PRODUCT_CATEGORIES.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'Stock' },
    { value: 'origin', label: 'Origin' }
  ];

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

      {/* Filtering and Search UI */}
      <div className="bg-base-200 p-5 rounded-xl mb-6 shadow-sm border border-base-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-base-content">Filter Products</h3>
          <button 
            className="btn btn-sm btn-ghost"
            onClick={resetFilters}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          {/* Search input */}
          <div className="form-control md:col-span-5">
            <label className="label">
              <span className="label-text text-xs font-medium">Search</span>
            </label>
            <div className="flex w-full">
              <input 
                type="text" 
                placeholder="Search by name, description, origin..." 
                className="input input-sm input-bordered rounded-r-none flex-grow"
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
              <button className="btn btn-sm btn-primary rounded-l-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Category filter */}
          <div className="form-control md:col-span-3">
            <label className="label">
              <span className="label-text text-xs font-medium">Category</span>
            </label>
            <select 
              className="select select-sm select-bordered w-full"
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map(cat => (
                cat.value !== 'all' && <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Origin filter */}
          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text text-xs font-medium">Origin</span>
            </label>
            <select 
              className="select select-sm select-bordered w-full"
              value={filters.origin}
              onChange={(e) => updateFilters({ origin: e.target.value })}
            >
              <option value="">All Origins</option>
              {filterOptions.origins?.map(origin => (
                <option key={origin} value={origin}>{origin}</option>
              ))}
            </select>
          </div>

          {/* Featured filter */}
          <div className="form-control md:col-span-2">
            <label className="label">
              <span className="label-text text-xs font-medium">Featured</span>
            </label>
            <select 
              className="select select-sm select-bordered w-full"
              value={filters.featured}
              onChange={(e) => updateFilters({ featured: e.target.value })}
            >
              <option value="">All Products</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured Only</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Price range filters */}
          <div className="form-control md:col-span-7">
            <label className="label">
              <span className="label-text text-xs font-medium">Price Range</span>
              {filterOptions.priceRange && 
                <span className="label-text-alt text-xs">
                  Range: ${filterOptions.priceRange.min?.toFixed(2)} - ${filterOptions.priceRange.max?.toFixed(2)}
                </span>
              }
            </label>
            <div className="join w-full">
              <input 
                type="number" 
                placeholder="Min Price" 
                className="input input-sm input-bordered join-item w-full"
                value={filters.minPrice}
                onChange={(e) => updateFilters({ minPrice: e.target.value })}
              />
              <span className="join-item flex items-center px-2 bg-base-300 text-xs">to</span>
              <input 
                type="number" 
                placeholder="Max Price" 
                className="input input-sm input-bordered join-item w-full"
                value={filters.maxPrice}
                onChange={(e) => updateFilters({ maxPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Sort by */}
          <div className="form-control md:col-span-5">
            <label className="label">
              <span className="label-text text-xs font-medium">Sort By</span>
            </label>
            <div className="join w-full">
              <select 
                className="select select-sm select-bordered join-item w-4/5"
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value })}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button 
                className="btn btn-sm join-item w-1/5"
                onClick={() => updateFilters({ 
                  sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' 
                })}
              >
                {filters.sortDirection === 'asc' ? 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg> : 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {(filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.origin || filters.featured) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-base-300">
            <span className="text-xs font-medium mt-1">Active filters:</span>
            {filters.search && (
              <div className="badge badge-sm badge-primary gap-1">
                Search: {filters.search}
                <button onClick={() => updateFilters({ search: '' })}>×</button>
              </div>
            )}
            {filters.category && (
              <div className="badge badge-sm badge-primary gap-1">
                Category: {getCategoryLabel(filters.category)}
                <button onClick={() => updateFilters({ category: '' })}>×</button>
              </div>
            )}
            {filters.minPrice && (
              <div className="badge badge-sm badge-primary gap-1">
                Min Price: ${filters.minPrice}
                <button onClick={() => updateFilters({ minPrice: '' })}>×</button>
              </div>
            )}
            {filters.maxPrice && (
              <div className="badge badge-sm badge-primary gap-1">
                Max Price: ${filters.maxPrice}
                <button onClick={() => updateFilters({ maxPrice: '' })}>×</button>
              </div>
            )}
            {filters.origin && (
              <div className="badge badge-sm badge-primary gap-1">
                Origin: {filters.origin}
                <button onClick={() => updateFilters({ origin: '' })}>×</button>
              </div>
            )}
            {filters.featured && (
              <div className="badge badge-sm badge-primary gap-1">
                {filters.featured === 'true' ? 'Featured' : 'Non-Featured'}
                <button onClick={() => updateFilters({ featured: '' })}>×</button>
              </div>
            )}
          </div>
        )}
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

      {/* Total count and loading state */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm opacity-70">
          {!loading && `Showing ${products.length} of ${totalCount} products`}
        </div>
        {loading && (
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        )}
      </div>

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
                          <img src={product.imageUrl} alt={product.name} onError={(e) => e.target.src = '/placeholder-image.jpg'} />
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
                      <div className={product.featured ? "badge badge-sm badge-success" : "badge badge-sm badge-ghost"}>
                        {product.featured ? 'Yes' : 'No'}
                      </div>
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
                          onClick={() => handleDeleteProduct(product._id)}
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
        categories={PRODUCT_CATEGORIES.filter(cat => cat.value !== 'all')}
        onClose={() => setShowAddModal(false)}
        onProductAdded={handleProductAdded}
      />
      
      <EditProductModal
        isOpen={showEditModal}
        product={selectedProduct}
        categories={PRODUCT_CATEGORIES.filter(cat => cat.value !== 'all')}
        onClose={() => setShowEditModal(false)}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
};

export default ProductsManager; 