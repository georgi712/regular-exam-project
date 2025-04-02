import { useAdvancedProductFiltering } from "../../api/productApi.js";
import ProductCard from "../product-card/ProductCard";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToastContext } from "../../contexts/ToastContext.jsx";

const CATEGORIES = ['All', 'Fruits', 'Vegetables', 'Fresh Juices', 'Nuts'];
const SORT_OPTIONS = ['Default Sorting', 'Newest', 'Price: Low to High', 'Price: High to Low'];
const ITEMS_PER_PAGE = 6; 

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const toast = useToastContext();
  
  const { 
    products, 
    error, 
    loading, 
    filters, 
    updateFilters, 
    resetFilters, 
    filterOptions
  } = useAdvancedProductFiltering({
    sortBy: 'name',
    sortDirection: 'asc'
  });

  useEffect(() => {
    if (error) {
      toast.error(`Error loading products: ${error}`);
    }
  }, [error, toast]);

  useEffect(() => {
    const offset = searchParams.get('offset');
    if (offset) {
      const page = Math.floor(parseInt(offset) / ITEMS_PER_PAGE) + 1;
      setCurrentPage(page);
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categoryParam !== filters.category) {
      updateFilters({ category: categoryParam });
    }
    
    const sortByParam = searchParams.get('sortBy');
    if (sortByParam) {
      if (sortByParam === '_createdOn desc') {
        updateFilters({ sortBy: '_createdOn', sortDirection: 'desc' });
      } else if (sortByParam === 'price') {
        updateFilters({ sortBy: 'price', sortDirection: 'asc' });
      } else if (sortByParam === 'price desc') {
        updateFilters({ sortBy: 'price', sortDirection: 'desc' });
      }
    }
  }, [searchParams]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE, 
    currentPage * ITEMS_PER_PAGE
  );

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    
    let formatedSort = '';
    let sortBy, sortDirection;

    if(newSort === 'Newest') {
      formatedSort = '_createdOn desc';
      sortBy = '_createdOn';
      sortDirection = 'desc';
    } else if(newSort === 'Default Sorting') {
      formatedSort = '';
      sortBy = 'name';
      sortDirection = 'asc';
    } else if(newSort === 'Price: Low to High') {
      formatedSort = 'price';
      sortBy = 'price';
      sortDirection = 'asc';
    } else if (newSort === 'Price: High to Low'){
      formatedSort = 'price desc';
      sortBy = 'price';
      sortDirection = 'desc';
    }

    if (newSort === 'Default Sorting') {
      newParams.delete('sortBy');
    } else {
      newParams.set('sortBy', formatedSort);
    }
    
    setCurrentPage(1);
    newParams.delete('offset');
    setSearchParams(newParams);
    updateFilters({ sortBy, sortDirection });
  };

  const handleCategoryChange = (category) => {
    const newParams = new URLSearchParams(searchParams);
    
    let categoryValue = '';
    if (category === 'All') {
      newParams.delete('category');
      categoryValue = '';
    } else {
      categoryValue = category === 'Fresh Juices' ? 'juices' : category.toLowerCase();
      newParams.set('category', categoryValue);
    }
    
    setCurrentPage(1);
    newParams.delete('offset');
    newParams.set('pageSize', ITEMS_PER_PAGE.toString());
    setSearchParams(newParams);
    updateFilters({ category: categoryValue });
    
    if (category === 'All') {
      toast.info('Showing all categories');
    } else {
      toast.info(`Filtering by ${category}`);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    const newParams = new URLSearchParams(searchParams);
    const offset = (page - 1) * ITEMS_PER_PAGE;
    
    if (offset > 0) {
      newParams.set('offset', offset.toString());
    } else {
      newParams.delete('offset');
    }
    
    newParams.set('pageSize', ITEMS_PER_PAGE.toString());
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  const handleResetFilters = () => {
    resetFilters();
    const newParams = new URLSearchParams();
    newParams.set('pageSize', ITEMS_PER_PAGE.toString());
    setSearchParams(newParams);
    toast.info('All filters have been reset');
  };

  const handleFilterChange = (filterName, value) => {
    updateFilters({ [filterName]: value });
    
  }

  const getCurrentSortOption = () => {
    if (filters.sortBy === '_createdOn' && filters.sortDirection === 'desc') {
      return 'Newest';
    } else if (filters.sortBy === 'price' && filters.sortDirection === 'asc') {
      return 'Price: Low to High';
    } else if (filters.sortBy === 'price' && filters.sortDirection === 'desc') {
      return 'Price: High to Low';
    }
    return 'Default Sorting';
  };

  const getSelectedCategory = () => {
    if (!filters.category) return 'All';
    if (filters.category === 'juices') return 'Fresh Juices';
    return filters.category.charAt(0).toUpperCase() + filters.category.slice(1);
  };

  return (
    <div>
      <div className="relative py-16 bg-[url('/images/background.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-4xl font-bold text-white mb-4 md:mb-0">Our Products</h1>
            <div className="flex flex-wrap gap-4">
              <div className="join">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="input input-bordered join-item w-full md:w-auto bg-white/90"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <button className="btn join-item bg-white/90">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              <select 
                className="select select-bordered w-full md:w-auto bg-white/90" 
                value={getCurrentSortOption()}
                onChange={handleSortChange}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="alert alert-error shadow-lg mb-8">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/4">
            <div className="card bg-base-100 border border-base-200">
              <div className="card-body">
                <h2 className="card-title mb-4">Filters</h2>
                
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Categories</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          className="radio radio-accent" 
                          checked={cat === getSelectedCategory()}
                          value={cat}
                          onChange={() => handleCategoryChange(cat)}
                          name="category"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {filterOptions.origins && filterOptions.origins.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2">Origin</h3>
                    <select 
                      className="select select-bordered w-full"
                      value={filters.origin}
                      onChange={(e) => handleFilterChange('origin', e.target.value)}
                    >
                      <option value="">All Origins</option>
                      {filterOptions.origins.map(origin => (
                        <option key={origin} value={origin}>{origin}</option>
                      ))}
                    </select>
                  </div>
                )}

                {filterOptions.priceRange && (
                  <div className="mb-6">
                    <h3 className="font-bold mb-2">Price Range</h3>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="Min Price" 
                          className="input input-bordered w-full"
                          value={filters.minPrice}
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          placeholder="Max Price" 
                          className="input input-bordered w-full"
                          value={filters.maxPrice}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Range: ${filterOptions.priceRange.min?.toFixed(2)} - ${filterOptions.priceRange.max?.toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-bold mb-2">Featured</h3>
                  <select 
                    className="select select-bordered w-full"
                    value={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.value)}
                  >
                    <option value="">All Products</option>
                    <option value="true">Featured Only</option>
                    <option value="false">Non-Featured Only</option>
                  </select>
                </div>

                <button 
                  className="btn btn-outline btn-block"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          <div className="lg:w-3/4 flex flex-col min-h-[600px]">
            {(filters.search || filters.category || filters.minPrice || filters.maxPrice || filters.origin || filters.featured) && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm font-medium self-center">Active filters:</span>
                {filters.search && (
                  <div className="badge badge-primary gap-1">
                    Search: {filters.search}
                    <button onClick={() => handleFilterChange('search', '')}>×</button>
                  </div>
                )}
                {filters.category && (
                  <div className="badge badge-primary gap-1">
                    Category: {getSelectedCategory()}
                    <button onClick={() => handleCategoryChange('All')}>×</button>
                  </div>
                )}
                {filters.minPrice && (
                  <div className="badge badge-primary gap-1">
                    Min Price: ${filters.minPrice}
                    <button onClick={() => handleFilterChange('minPrice', '')}>×</button>
                  </div>
                )}
                {filters.maxPrice && (
                  <div className="badge badge-primary gap-1">
                    Max Price: ${filters.maxPrice}
                    <button onClick={() => handleFilterChange('maxPrice', '')}>×</button>
                  </div>
                )}
                {filters.origin && (
                  <div className="badge badge-primary gap-1">
                    Origin: {filters.origin}
                    <button onClick={() => handleFilterChange('origin', '')}>×</button>
                  </div>
                )}
                {filters.featured && (
                  <div className="badge badge-primary gap-1">
                    {filters.featured === 'true' ? 'Featured' : 'Non-Featured'}
                    <button onClick={() => handleFilterChange('featured', '')}>×</button>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="flex-grow flex justify-center items-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            {!loading && (
              <div className="mb-4 text-sm text-gray-500">
                Showing {currentProducts.length} of {products.length} products
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
                {currentProducts.length > 0 ? (
                  currentProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      id={product._id}
                      imageUrl={product.image || product.imageUrl}
                      name={product.name}
                      price={product.price}
                      pricePerKg={product.pricePerKg}
                      weight={product.weight}
                      origin={product.origin}
                      originFlag={product.originFlag || "https://via.placeholder.com/30"}
                    />
                  ))
                ) : !error ? (
                  <div className="col-span-full flex items-center justify-center h-[400px]">
                    <div className="text-4xl font-bold text-gray-400">No products found</div>
                  </div>
                ) : null}
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="flex justify-center mt-auto pt-8">
                <div className="join">
                  <button 
                    className="join-item btn" 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || totalPages <= 1}
                  >«</button>
                  
                  {[...Array(Math.max(1, totalPages))].map((_, index) => (
                    <button 
                      key={index + 1}
                      className={`join-item btn ${currentPage === index + 1 ? 'btn-primary' : ''}`} 
                      onClick={() => handlePageChange(index + 1)}
                      disabled={totalPages <= 1}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button 
                    className="join-item btn"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages <= 1}
                  >»</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 