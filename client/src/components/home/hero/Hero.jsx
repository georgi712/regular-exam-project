import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="hero min-h-[70vh] bg-[url('/images/background.jpg')] bg-cover bg-center">
      <div className="hero-overlay bg-black/40"></div>
      <div className="hero-content text-center text-white">
        <div className="max-w-3xl">
          <h1 className="mb-5 text-5xl font-bold">Fresh & Healthy Food Delivered To Your Door</h1>
          <p className="mb-8 text-xl">Experience the finest selection of fresh fruits, vegetables, and healthy beverages delivered right to your doorstep.</p>
          <Link to={'/products'} className="btn btn-primary btn-lg">Browse Products</Link>
        </div>
      </div>
    </section>
  );
};

export default Hero; 