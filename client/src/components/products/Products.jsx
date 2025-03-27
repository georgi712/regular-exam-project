import { useProductUrlParams } from "../../api/productApi.js";
import ProductCard from "../product-card/ProductCard";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const CATEGORIES = ['All', 'Fruits', 'Vegetables', 'Fresh Juices', 'Nuts'];
const SORT_OPTIONS = ['Default Sorting', 'Newest', 'Price: Low to High', 'Price: High to Low'];
const ITEMS_PER_PAGE = 6; 

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSort, setSelectedSort] = useState('Sort by');

  const categoryParam = searchParams.get('category') || '';
  let currentCategory = 'All';
  
  if (categoryParam === 'fruits') currentCategory = 'Fruits';
  else if (categoryParam === 'vegetables') currentCategory = 'Vegetables';
  else if (categoryParam === 'juices') currentCategory = 'Fresh Juices';
  else if (categoryParam === 'nuts') currentCategory = 'Nuts';

  useEffect(() => {
    setSelectedCategory(currentCategory);
    
    const sortByParam = searchParams.get('sortBy');
    if (sortByParam) {
      if (sortByParam === '_createdOn desc') setSelectedSort('Newest');
      else if (sortByParam === 'price') setSelectedSort('Price: Low to High');
      else if (sortByParam === 'price desc') setSelectedSort('Price: High to Low');
      else setSelectedSort('Default Sorting');
    } else {
      setSelectedSort('Default Sorting');
    }
  }, [currentCategory, searchParams]);

  useEffect(() => {
    const pageSize = searchParams.get('pageSize');
    if (!pageSize) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('pageSize', ITEMS_PER_PAGE.toString());
      setSearchParams(newParams);
    }
  }, []);

  useEffect(() => {
    const offset = searchParams.get('offset');
    if (offset) {
      const page = Math.floor(parseInt(offset) / ITEMS_PER_PAGE) + 1;
      setCurrentPage(page);
    } else {
      setCurrentPage(1);
    }
  }, [searchParams]);

  const { products, totalCount, error, loading } = useProductUrlParams();
  
  const totalPages = Math.ceil((totalCount || products.length) / ITEMS_PER_PAGE);

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSelectedSort(newSort);
    
    const newParams = new URLSearchParams(searchParams);
    
    let formatedSort = '';

    if(newSort === 'Newest') {
      formatedSort = '_createdOn desc'
    } else if(newSort === 'Default Sorting') {
      formatedSort = '' 
    } else if(newSort === 'Price: Low to High') {
      formatedSort = 'price'
      console.log("Sorting price ascending");
    } else if (newSort === 'Price: High to Low'){
      formatedSort = 'price desc'
      console.log("Sorting price descending");
    }

    console.log(`Sorting by: ${newSort} => ${formatedSort}`);

    if (newSort === 'Default Sorting') {
      newParams.delete('sortBy');
    } else {
      newParams.set('sortBy', formatedSort);
    }
    
    setCurrentPage(1);
    newParams.delete('offset');
    
    setSearchParams(newParams);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    
    const newParams = new URLSearchParams(searchParams);
    
    if (category === 'All') {
      newParams.delete('category');
    } else {
      const categoryValue = category === 'Fresh Juices' ? 'juices' : category.split(' ')[0].toLowerCase();
      newParams.set('category', categoryValue);
    }
    
    setCurrentPage(1);
    newParams.delete('offset');
    
    newParams.set('pageSize', ITEMS_PER_PAGE.toString());
    
    setSearchParams(newParams);
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
                value={selectedSort}
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
        {/* Error Message */}
        {error && (
          <div className="alert alert-error shadow-lg mb-8">
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          </div>
        )}

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
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4 flex flex-col min-h-[600px]">
            {/* Loading State */}
            {loading && (
              <div className="flex-grow flex justify-center items-center">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            )}

            {/* Products or No Products Message */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
                {products.length > 0 ? (
                  products.map((product) => {
                    console.log("Rendering product:", product);
                    return (
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
                        onAddToCart={(item) => console.log('Added to cart:', item)}
                      />
                    );
                  })
                ) : !error ? (
                  <div className="col-span-full flex items-center justify-center h-[400px]">
                    <div className="text-4xl font-bold text-gray-400">No products found</div>
                  </div>
                ) : null}
              </div>
            )}

            {/* Pagination */}
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