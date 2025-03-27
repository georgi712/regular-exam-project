import React, { useState, useRef, useEffect } from 'react';
import ProductCard from '../../product-card/ProductCard';
import { useFeaturedProducts } from '../../../api/productApi.js';

const FeaturedProducts = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  useFeaturedProducts();
  const products = [
    {
      id: 1,
      image: "/images/apple.jpg",
      name: "Fresh Apples",
      price: "2.99",
      pricePerKg: "5.98",
      grammage: "500g",
      origin: "Bulgaria",
      originFlag: "/images/flags/bg.png",
    },
    {
      id: 2,
      image: "/images/banana.jpg",
      name: "Organic Bananas",
      price: "3.99",
      pricePerKg: "7.98",
      grammage: "500g",
      origin: "Ecuador",
      originFlag: "/images/flags/ec.png",
    },
    {
      id: 3,
      image: "/images/orange.jpg",
      name: "Sweet Oranges",
      price: "4.99",
      pricePerKg: "9.98",
      grammage: "500g",
      origin: "Spain",
      originFlag: "/images/flags/es.png",
    },
    {
      id: 4,
      image: "/images/strawberry.jpg",
      name: "Fresh Strawberries",
      price: "5.99",
      pricePerKg: "11.98",
      grammage: "500g",
      origin: "Bulgaria",
      originFlag: "/images/flags/bg.png",
    }
  ];

  // Create a circular array for infinite scrolling
  const getVisibleProducts = () => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      const index = (startIndex + i) % products.length;
      result.push(products[index]);
    }
    return result;
  };

  const visibleProducts = getVisibleProducts();

  const handleNext = () => {
    setStartIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    setStartIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  // Auto-scroll effect with pause on hover
  useEffect(() => {
    if (isHovering) return;
    
    const interval = setInterval(() => {
      handleNext();
    }, 7000);
    
    return () => clearInterval(interval);
  }, [isHovering]);

  return (
    <section className="py-20 bg-base-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">Discover our handpicked selection of premium fresh products, carefully chosen for their quality and taste.</p>
        </div>
        
        <div 
          className="relative pb-12"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Carousel Container */}
          <div className="overflow-visible px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {visibleProducts.map((product) => (
                <div 
                  key={`product-${product.id}`} 
                  className="p-3"
                >
                  <ProductCard
                    image={product.image}
                    name={product.name}
                    price={product.price}
                    pricePerKg={product.pricePerKg}
                    grammage={product.grammage}
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
        </div>
        
        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {products.map((_, index) => (
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
    </section>
  );
};

export default FeaturedProducts; 