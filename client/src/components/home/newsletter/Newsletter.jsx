import React from 'react';

const Newsletter = () => {
  return (
    <section className="py-16 bg-accent text-accent-content">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="mb-8">Get updates about new products and special offers!</p>
          <div className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your.email@example.com"
              className="input input-lg flex-grow bg-base-100 text-base-content placeholder:text-base-content/60"
            />
            <button className="btn btn-primary btn-lg">Subscribe</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter; 