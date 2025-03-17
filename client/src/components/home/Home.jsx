import { useState, useRef } from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import ProductCard from "../product-card/ProductCard";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

// Define delivery areas
const DELIVERY_AREAS = {
  "Младост": true,
  "Люлин": true,
  "Дружба": true,
  "Надежда": true,
  "Красно село": true,
  "Лозенец": true,
  "Център": true,
  "София": true,
};

export default function Home() {
  const [address, setAddress] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isInDeliveryArea, setIsInDeliveryArea] = useState(false);
  const autocompleteRef = useRef(null);

  const checkDeliveryArea = (addressComponents) => {
    const cityComponent = addressComponents.find(
      component => component.types.includes("locality")
    );
    
    const subLocalityComponent = addressComponents.find(
      component => component.types.includes("sublocality") || 
                   component.types.includes("neighborhood")
    );

    const city = cityComponent?.long_name;
    const district = subLocalityComponent?.long_name;

    if (city === "София" || city === "Sofia") {
      if (district && DELIVERY_AREAS[district]) {
        return {
          deliverable: true,
          message: `✅ Great! We deliver to ${district}, ${city}`
        };
      }
      return {
        deliverable: true,
        message: "✅ Great! We deliver to your area in Sofia"
      };
    }

    return {
      deliverable: false,
      message: `❌ Sorry, we currently don't deliver to ${city || 'this area'}`
    };
  };

  const clearAddress = () => {
    setAddress("");
    setValidationMessage("");
    setIsInDeliveryArea(false);
    if (autocompleteRef.current) {
      const input = document.querySelector('input[type="text"]');
      if (input) {
        input.value = "";
        // Clear Google Places Autocomplete
        autocompleteRef.current.set('place', null);
      }
    }
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();

      if (!place.geometry) {
        setValidationMessage("⚠️ Please select an address from the dropdown");
        return;
      }

      if (place.address_components) {
        const { deliverable, message } = checkDeliveryArea(place.address_components);
        setIsInDeliveryArea(deliverable);
        setValidationMessage(message);
      }

      setAddress(place.formatted_address);
    }
  };

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  return (
    <>
      {/* Address Checker Section */}
      <section className="py-12 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Check Delivery Availability</h2>
              <p className="text-base-content/70">Enter your address to see if we deliver to your area</p>
            </div>
            <LoadScript googleMapsApiKey={GOOGLE_API_KEY} libraries={["places"]}>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-grow relative">
                        <Autocomplete
                          onLoad={onAutocompleteLoad}
                          onPlaceChanged={onPlaceChanged}
                          options={{
                            types: ["address"],
                            componentRestrictions: { country: "BG" }
                          }}
                        >
                          <div className="form-control">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Enter your delivery address"
                                className="input input-bordered input-lg w-full pr-10"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                              />
                              {address && (
                                <button
                                  onClick={clearAddress}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-sm"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-2 px-1">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div className="flex flex-col xs:flex-row gap-1 xs:gap-3 text-sm">
                                <span className="text-base-content/70">Format: <span className="text-info font-medium">Street name and number, District, Sofia</span></span>
                                <span className="hidden xs:inline text-base-content/50">•</span>
                                <span className="text-base-content/60 text-xs">Example: ул. Витоша 89, Лозенец, София</span>
                              </div>
                            </div>
                          </div>
                        </Autocomplete>
                      </div>
                      <button 
                        className={`btn btn-lg whitespace-nowrap ${isInDeliveryArea ? 'btn-primary' : 'btn-disabled'}`}
                        disabled={!isInDeliveryArea}
                      >
                        {isInDeliveryArea ? 'Proceed to Order' : 'Check Availability'}
                      </button>
                    </div>
                    {validationMessage && (
                      <div className={`alert ${isInDeliveryArea ? 'alert-success' : 'alert-error'} shadow-lg`}>
                        <span>{validationMessage}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </LoadScript>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="hero min-h-[70vh] bg-[url('/images/background.jpg')] bg-cover bg-center">
        <div className="hero-overlay bg-black/40"></div>
        <div className="hero-content text-center text-white">
          <div className="max-w-3xl">
            <h1 className="mb-5 text-5xl font-bold">Fresh & Healthy Food Delivered To Your Door</h1>
            <p className="mb-8 text-xl">Experience the finest selection of fresh fruits, vegetables, and healthy beverages delivered right to your doorstep.</p>
            <button className="btn btn-primary btn-lg">Browse Products</button>
          </div>
        </div>
      </section>

      {/* Featured Products Carousel */}
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

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Featured Categories</h2>
            <p className="text-base-content/70 max-w-2xl mx-auto">Explore our wide range of fresh and healthy products, carefully organized into categories for your convenience.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {['Fruits', 'Vegetables', 'Fresh Juices', 'Smoothies'].map((category) => (
              <div key={category} className="card bg-base-100 border border-base-200 hover:border-accent transition-all duration-300">
                <figure className="px-4 pt-4">
                  <img
                    src={`/images/${category.toLowerCase().replace(' ', '-')}.jpg`}
                    alt={category}
                    className="rounded-xl h-56 w-full object-cover"
                  />
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title text-xl">{category}</h3>
                  <button className="btn btn-accent btn-sm mt-2">
                    View All
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
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

      {/* Newsletter */}
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
    </>
  );
} 