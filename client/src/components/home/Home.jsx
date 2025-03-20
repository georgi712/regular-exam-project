import React from 'react';
import Hero from './hero/Hero';
import AddressChecker from './address-checker/AddressChecker';
import UserWelcome from './user-welcome/UserWelcome';
import FeaturedProducts from './featured-products/FeaturedProducts';
import FeaturedCategories from './featured-categories/FeaturedCategories';
import WhyChooseUs from './why-choose-us/WhyChooseUs';
import Newsletter from './newsletter/Newsletter';

export default function Home() {
  // This would be determined by authentication state
  const isLoggedIn = false;
  const userName = "John Doe";

  return (
    <>
      {/* Conditionally render either the UserWelcome or AddressChecker component based on login status */}
      {isLoggedIn ? (
        <UserWelcome userName={userName} />
      ) : (
        <AddressChecker />
      )}
      <Hero />
      <FeaturedProducts />
      <FeaturedCategories />
      <WhyChooseUs />
      <Newsletter />
    </>
  );
} 