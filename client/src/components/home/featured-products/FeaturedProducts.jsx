import React, { useState, useEffect } from 'react';
import ProductCard from '../../product-card/ProductCard';
import { useFeaturedProducts } from '../../../api/productApi.js';

const FeaturedProducts = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const { featuredProducts, loading, error } = useFeaturedProducts();
  
  const hasProducts = Array.isArray(featuredProducts) && featuredProducts.length > 0;

  // Create a circular array for infinite scrolling
  const getVisibleProducts = () => {
    if (!hasProducts) return [];
    
    const result = [];
    const productCount = Math.min(4, featuredProducts.length);
    
    for (let i = 0; i < productCount; i++) {
      const index = (startIndex + i) % featuredProducts.length;
      result.push(featuredProducts[index]);
    }
    return result;
  };

  const visibleProducts = getVisibleProducts();

  const handleNext = () => {
    if (!hasProducts) return;
    setStartIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const handlePrev = () => {
    if (!hasProducts) return;
    setStartIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  // Auto-scroll effect with pause on hover
  useEffect(() => {
    if (isHovering || !hasProducts) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 7000);
    
    return () => clearInterval(interval);
  }, [isHovering, hasProducts, featuredProducts]);

  return (
    <section className="py-20 bg-base-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
          {loading ? (
            <>
              <p className="text-base-content/70 max-w-2xl mx-auto">Loading our premium selection...</p>
              <div className="flex justify-center mt-8">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            </>
          ) : error ? (
            <p className="text-error max-w-2xl mx-auto">Sorry, we couldn't load featured products. Please try again later.</p>
          ) : !hasProducts ? (
            <p className="text-base-content/70 max-w-2xl mx-auto">No featured products available at the moment.</p>
          ) : (
            <>
              <p className="text-base-content/70 max-w-2xl mx-auto">Discover our handpicked selection of premium fresh products, carefully chosen for their quality and taste.</p>
              
              <div 
                className="relative pb-12 mt-12"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                {/* Carousel Container */}
                <div className="overflow-visible px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {visibleProducts.map((product) => (
                      <div 
                        key={`product-${product._id || product.id}`} 
                        className="p-3"
                      >
                        <ProductCard
                          id={product._id || product.id}
                          imageUrl={product.image || product.imageUrl}
                          name={product.name}
                          price={product.price}
                          pricePerKg={product.pricePerKg}
                          weight={product.weight}
                          origin={product.origin}
                          originFlag={product.originFlag}
                          onAddToCart={(item) => console.log('Added to cart:', item)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Navigation Arrows - Show on both sides for circular navigation */}
                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-40">
                  <button 
                    onClick={handlePrev}
                    className="btn btn-circle shadow-lg bg-base-100/90 backdrop-blur border-2 border-accent hover:bg-accent hover:text-accent-content transition-all duration-300"
                  >
                    ❮
                  </button>
                </div>
                
                <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-40">
                  <button 
                    onClick={handleNext}
                    className="btn btn-circle shadow-lg bg-base-100/90 backdrop-blur border-2 border-accent hover:bg-accent hover:text-accent-content transition-all duration-300"
                  >
                    ❯
                  </button>
                </div>
              
                {/* Indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {featuredProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setStartIndex(index)}
                      className={`transition-all duration-300 ease-out rounded-full ${
                        startIndex === index 
                          ? 'w-10 h-4 bg-accent shadow-md' 
                          : 'w-4 h-4 bg-base-300 hover:bg-base-content/50'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 