import ProductCard from "../product-card/ProductCard";

// Mock data for visual template
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Fresh Apples',
    category: 'Fruits',
    price: 2.99,
    pricePerKg: 5.98,
    grammage: '500g',
    origin: 'Bulgaria',
    originFlag: '/images/flags/bg.png',
    image: '/images/apple.jpg',
    rating: 4.5,
  },
  {
    id: 2,
    name: 'Organic Bananas',
    category: 'Fruits',
    price: 3.99,
    pricePerKg: 7.98,
    grammage: '500g',
    origin: 'Ecuador',
    originFlag: '/images/flags/ec.png',
    image: '/images/banana.jpg',
    rating: 4.8,
  },
  // Add more mock products as needed
];

const CATEGORIES = ['All', 'Fruits', 'Vegetables', 'Fresh Juices', 'Smoothies'];
const SORT_OPTIONS = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Most Popular'];

export default function Products() {
  return (
    <div>
      {/* Header with Background */}
      <div className="relative py-16 bg-[url('/images/background.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-4xl font-bold text-white mb-4 md:mb-0">Our Products</h1>
            <div className="flex flex-wrap gap-4">
              <select className="select select-bordered w-full md:w-auto bg-white/90">
                <option disabled selected>Sort by</option>
                {SORT_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="card bg-base-100 border border-base-200">
              <div className="card-body">
                <h2 className="card-title mb-4">Filters</h2>
                
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Categories</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                      <label key={category} className="flex items-center gap-2">
                        <input type="checkbox" className="checkbox checkbox-accent" />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Price Range</h3>
                  <input type="range" min="0" max="100" className="range range-accent" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>$0</span>
                    <span>$100</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2">Rating</h3>
                  <div className="rating rating-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <input
                        key={star}
                        type="radio"
                        name="rating-filter"
                        className="mask mask-star-2 bg-accent"
                      />
                    ))}
                  </div>
                </div>

                {/* Apply Filters Button */}
                <button className="btn btn-accent w-full">Apply Filters</button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard
                  key={product.id}
                  image={product.image}
                  name={product.name}
                  price={product.price}
                  pricePerKg={product.pricePerKg}
                  grammage={product.grammage}
                  origin={product.origin}
                  originFlag={product.originFlag}
                  onAddToCart={(item) => console.log('Added to cart:', item)}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <div className="join">
                <button className="join-item btn">«</button>
                <button className="join-item btn btn-active">1</button>
                <button className="join-item btn">2</button>
                <button className="join-item btn">3</button>
                <button className="join-item btn">»</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 