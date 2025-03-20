import React from 'react';

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-base-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose Us</h2>
          <p className="text-base-content/70 max-w-2xl mx-auto">We're committed to providing you with the best quality products and service.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Fresh & Local',
              description: 'We source our products directly from local farmers',
              icon: '🌱'
            },
            {
              title: 'Fast Delivery',
              description: 'Same day delivery for orders placed before 2 PM',
              icon: '🚚'
            },
            {
              title: 'Quality Guaranteed',
              description: '100% satisfaction guarantee or your money back',
              icon: '✨'
            }
          ].map((feature) => (
            <div key={feature.title} className="card bg-base-100 border border-base-200 hover:border-accent transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="card-title text-xl mb-2">{feature.title}</h3>
                <p className="text-base-content/70">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs; 