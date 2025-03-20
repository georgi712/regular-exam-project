import React from 'react';
import ProductCard from '../../product-card/ProductCard';

const FeaturedProducts = () => {
  return (
    <section className="py-20 bg-base-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Products</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">Discover our handpicked selection of premium fresh products, carefully chosen for their quality and taste.</p>
        </div>
        <div className="carousel carousel-center w-full gap-4">
          <div className="carousel-item w-full md:w-1/2 lg:w-1/3">
            <ProductCard
              image="/images/apple.jpg"
              name="Fresh Apples"
              price="2.99"
              pricePerKg="5.98"
              grammage="500g"
              origin="Bulgaria"
              originFlag="/images/flags/bg.png"
              onAddToCart={(item) => console.log('Added to cart:', item)}
            />
          </div>
          <div className="carousel-item w-full md:w-1/2 lg:w-1/3">
            <ProductCard
              image="/images/banana.jpg"
              name="Organic Bananas"
              price="3.99"
              pricePerKg="7.98"
              grammage="500g"
              origin="Ecuador"
              originFlag="/images/flags/ec.png"
              onAddToCart={(item) => console.log('Added to cart:', item)}
            />
          </div>
          <div className="carousel-item w-full md:w-1/2 lg:w-1/3">
            <ProductCard
              image="/images/orange.jpg"
              name="Sweet Oranges"
              price="4.99"
              pricePerKg="9.98"
              grammage="500g"
              origin="Spain"
              originFlag="/images/flags/es.png"
              onAddToCart={(item) => console.log('Added to cart:', item)}
            />
          </div>
          <div className="carousel-item w-full md:w-1/2 lg:w-1/3">
            <ProductCard
              image="/images/strawberry.jpg"
              name="Fresh Strawberries"
              price="5.99"
              pricePerKg="11.98"
              grammage="500g"
              origin="Bulgaria"
              originFlag="/images/flags/bg.png"
              onAddToCart={(item) => console.log('Added to cart:', item)}
            />
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-12">
          <button className="btn btn-circle btn-lg btn-ghost hover:bg-accent hover:text-accent-content">❮</button>
          <button className="btn btn-circle btn-lg btn-ghost hover:bg-accent hover:text-accent-content">❯</button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts; 