import { useProductUrlParams } from "../../api/productApi.js";
import ProductCard from "../product-card/ProductCard";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const CATEGORIES = ['All', 'Fruits', 'Vegetables', 'Fresh Juices', 'Nuts'];
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Popular'];
const ITEMS_PER_PAGE = 6; // Number of items per page

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const currentSort = searchParams.get('sort') || 'Sort by';
  
  // Get category directly from URL parameter
  const categoryParam = searchParams.get('category') || '';
  let currentCategory = 'All';
  
  // Map category values to display names
  if (categoryParam === 'fruits') currentCategory = 'Fruits';
  else if (categoryParam === 'vegetables') currentCategory = 'Vegetables';
  else if (categoryParam === 'juices') currentCategory = 'Fresh Juices';
  else if (categoryParam === 'nuts') currentCategory = 'Nuts';

  useEffect(() => {
    setSelectedCategory(currentCategory);
  }, [currentCategory]);

  const { products, totalCount } = useProductUrlParams();
  
  const totalPages = Math.ceil((totalCount || products.length) / ITEMS_PER_PAGE);

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const newParams = new URLSearchParams(searchParams);
    
    let formatedSort = '';

    if(newSort === 'Newest') {
      formatedSort = '_createdOn desc'
    } else if(newSort === 'Most Popular') {
      formatedSort = 'rating asc'
    } else if(newSort === 'Price: Low to High') {
      formatedSort = 'price asc'
    } else if (newSort === 'Price: High to Low'){
      formatedSort = 'price desc'
    }

    if (newSort !== 'Sort by') {
      newParams.set('sortBy', formatedSort);
    } else {
      newParams.delete('sortBy');
    }
    
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  const handleCategoryChange = (category) => {
    // Update local state immediately for responsive UI
    setSelectedCategory(category);
    
    const newParams = new URLSearchParams(searchParams);
    
    if (category === 'All') {
      newParams.delete('category');
    } else {
      // Handle special case for Fresh Juices
      const categoryValue = category === 'Fresh Juices' ? 'juices' : category.split(' ')[0].toLowerCase();
      
      // Use simple category parameter instead of where clause
      newParams.set('category', categoryValue);
    }
    
    // Remove any existing where parameter
    newParams.delete('where');
    
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;
    
    if (offset > 0) {
      newParams.set('offset', offset.toString());
    } else {
      newParams.delete('offset');
    }
    
    newParams.set('pageSize', ITEMS_PER_PAGE.toString());
    
    if (newParams.get('offset') !== searchParams.get('offset') || 
        newParams.get('pageSize') !== searchParams.get('pageSize')) {
      setSearchParams(newParams);
    }
  }, [currentPage, searchParams, setSearchParams]);

  return (
    <div>
      <div className="relative py-16 bg-[url('/images/background.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-4xl font-bold text-white mb-4 md:mb-0">Our Products</h1>
            <div className="flex flex-wrap gap-4">
              <select 
                className="select select-bordered w-full md:w-auto bg-white/90" 
                value={currentSort}
                onChange={handleSortChange}
              >
                <option value="Sort by" disabled>Sort by</option>
                {SORT_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="card bg-base-100 border border-base-200">
              <div className="card-body">
                <h2 className="card-title mb-4">Filters</h2>
                
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Categories</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          className="radio radio-accent" 
                          checked={cat === selectedCategory}
                          value={cat}
                          onChange={() => handleCategoryChange(cat)}
                          name="category"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Price Range</h3>
                  <input type="range" min="0" max="100" className="range range-accent" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>$0</span>
                    <span>$100</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Rating</h3>
                  <div className="rating rating-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name="rating-filter"
                        className="mask mask-star-2 bg-accent"
                      />
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button className="btn btn-accent w-full">Apply Filters</button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4 flex flex-col min-h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
              {products.length > 0
               ? (products?.map((product) => (
                <ProductCard
                  key={product._id}
                  imageUrl={product.imageUrl}
                  name={product.name}
                  price={product.price}
                  pricePerKg={product.pricePerKg}
                  weight={product.weight}
                  origin={product.origin}
                  originFlag={product.originFlag}
                  onAddToCart={(item) => console.log('Added to cart:', item)}
                />
              )))
              : (
                <div className="col-span-full flex items-center justify-center h-[400px]">
                  <div className="text-4xl font-bold text-gray-400">No products found</div>
                </div>
              )}
            </div>

            {/* Pagination */}
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
          </div>
        </div>
      </div>
    </div>
  );
} 