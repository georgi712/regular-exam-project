import React from 'react';
import { Link } from 'react-router-dom';

const FeaturedCategories = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Categories</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">Explore our wide range of fresh and healthy products, carefully organized into categories for your convenience.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {['Fruits', 'Vegetables', 'Fresh Juices', 'Nuts'].map((category) => (
            <div key={category} className="card bg-base-100 border border-base-200 hover:border-accent transition-all duration-300">
              <figure className="px-4 pt-4">
                <img 
                  src={`/images/categories/categories-${category.toLowerCase().replace(' ', '-')}.png`}
                  alt={category} 
                  className="rounded-xl h-56 w-full object-cover"
                />
              </figure>
              <div className="card-body items-center text-center">
                <h3 className="card-title text-xl">{category}</h3>
                <Link 
                  to={`products?category=${category === 'Fresh Juices' ? 'juices' : category.toLowerCase().replace(' ', '-')}`} 
                  className="btn btn-accent btn-sm mt-2"
                >
                  View All
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories; 