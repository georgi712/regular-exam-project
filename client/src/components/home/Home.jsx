import Hero from './hero/Hero';
import UserWelcome from './user-welcome/UserWelcome';
import FeaturedProducts from './featured-products/FeaturedProducts';
import FeaturedCategories from './featured-categories/FeaturedCategories';
import WhyChooseUs from './why-choose-us/WhyChooseUs';
import useAuth from '../../hooks/useAuth.js';

export default function Home() {
  const {accessToken} = useAuth();
  return (
    <>
      { !!accessToken
      ? <UserWelcome />
      : null
    }
      <Hero />
      <FeaturedProducts />
      <FeaturedCategories />
      <WhyChooseUs />
    </>
  );
} 