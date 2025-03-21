import Hero from './hero/Hero';
import AddressChecker from './address-checker/AddressChecker';
import UserWelcome from './user-welcome/UserWelcome';
import FeaturedProducts from './featured-products/FeaturedProducts';
import FeaturedCategories from './featured-categories/FeaturedCategories';
import WhyChooseUs from './why-choose-us/WhyChooseUs';
import Newsletter from './newsletter/Newsletter';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/userContext.js';

export default function Home() {
  // This would be determined by authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const {email} = useContext(UserContext);
  useEffect(() => {
    if (email) {
      setIsLoggedIn(true)
    }
  }, [email])
  return (
    <>
      {isLoggedIn ? (
        <UserWelcome />
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