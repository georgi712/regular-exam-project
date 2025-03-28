import Hero from './hero/Hero';
import AddressChecker from './address-checker/AddressChecker';
import UserWelcome from './user-welcome/UserWelcome';
import FeaturedProducts from './featured-products/FeaturedProducts';
import FeaturedCategories from './featured-categories/FeaturedCategories';
import WhyChooseUs from './why-choose-us/WhyChooseUs';
import Newsletter from './newsletter/Newsletter';
import useAuth from '../../hooks/useAuth.js';

export default function Home() {
  const {accessToken} = useAuth();
  return (
    <>
      {!!accessToken ? (
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