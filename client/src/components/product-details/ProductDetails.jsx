import { useState } from 'react';
import ProductCard from '../product-card/ProductCard';

export default function ProductDetails() {
  const [activeTab, setActiveTab] = useState("details");
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const reviews = [
    { id: 1, user: 'Alice', avatar: 'A', rating: 5, comment: 'Great product! Really enjoyed the taste and quality.' },
    { id: 2, user: 'Bob', avatar: 'B', rating: 4, comment: 'Very useful and healthy. Would recommend to friends and family.' },
  ];
  
  const relatedProducts = [
    { id: 1, name: 'Similar Product 1', price: '89.99', pricePerKg: '179.98', grammage: '500g', origin: 'Bulgaria', originFlag: '/images/flags/bg.png', image: 'https://via.placeholder.com/200x150' },
    { id: 2, name: 'Similar Product 2', price: '79.99', pricePerKg: '159.98', grammage: '500g', origin: 'Spain', originFlag: '/images/flags/es.png', image: 'https://via.placeholder.com/200x150/yellow' },
    { id: 3, name: 'Similar Product 3', price: '109.99', pricePerKg: '219.98', grammage: '500g', origin: 'Italy', originFlag: '/images/flags/it.png', image: 'https://via.placeholder.com/200x150/blue' },
  ];
  
  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  // Rating breakdown
  const ratingCounts = Array(5).fill(0);
  reviews.forEach(review => {
    ratingCounts[review.rating - 1]++;
  });

  return (
    <div className="container mx-auto p-4 bg-base-100">
      {/* Breadcrumbs */}
      <div className="text-sm breadcrumbs mb-4">
        <ul>
          <li><a>Home</a></li>
          <li><a>Products</a></li>
          <li>Product Name</li>
        </ul>
      </div>
      
      {/* Hero section with product image and details */}
      <div className="card lg:card-side bg-base-100 shadow-xl mb-8">
        <div className="lg:w-1/2">
          {/* Single product image */}
          <figure>
            <img src="https://via.placeholder.com/800x600" alt="Product" className="w-full h-full object-cover rounded-l-xl" />
          </figure>
        </div>
        
        <div className="card-body lg:w-1/2">
          <div className="flex justify-between items-start">
            <h1 className="card-title text-4xl font-bold">Product Name</h1>
            <div className="flex gap-2">
              <button className="btn btn-circle btn-outline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-circle btn-outline">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </label>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li><a>Share on Facebook</a></li>
                  <li><a>Share on Twitter</a></li>
                  <li><a>Share on Instagram</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex items-center mb-2">
            <div className="rating rating-sm">
              {[...Array(5)].map((_, i) => (
                <input 
                  key={i} 
                  type="radio" 
                  name="product-rating" 
                  className="mask mask-star-2 bg-orange-400"
                  checked={i + 1 === Math.round(averageRating)}
                  readOnly
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">({reviews.length} reviews)</span>
          </div>
          
          <div className="badge badge-accent badge-lg text-xl py-4 px-6 my-2">$99.99</div>
          <p className="text-lg mb-4">Product description goes here. It provides details about the product. Our premium organic selection ensures the highest quality for your health needs.</p>
          
          <div className="flex flex-wrap gap-2 my-2">
            <div className="badge badge-outline">Organic</div>
            <div className="badge badge-outline">Fresh</div>
            <div className="badge badge-outline">Healthy</div>
          </div>
          
          <div className="form-control w-full max-w-xs my-6">
            <label className="label mb-2">
              <span className="label-text text-lg">Quantity</span>
            </label>
            <div className="flex items-center gap-2">
              <button 
                className="btn"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              >-</button>
              <input 
                type="text" 
                className="input input-bordered w-20 text-center" 
                value={quantity}
                readOnly
              />
              <button 
                className="btn"
                onClick={() => setQuantity(prev => prev + 1)}
              >+</button>
            </div>
          </div>
          
          <div className="card-actions justify-end mt-6">
            <button className="btn btn-primary btn-lg">Add to Cart</button>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="tabs tabs-boxed mb-6">
        <a 
          className={`tab tab-lg ${activeTab === "details" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </a>
        <a 
          className={`tab tab-lg ${activeTab === "nutrition" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("nutrition")}
        >
          Nutrition
        </a>
        <a 
          className={`tab tab-lg ${activeTab === "reviews" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </a>
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-3xl font-bold">Product Details</h2>
            <p className="text-lg">This premium product is sourced from the finest organic farms. We ensure that all our products are fresh and of the highest quality.</p>
            
            <div className="stats stats-vertical lg:stats-horizontal shadow mt-4">
              <div className="stat">
                <div className="stat-title">Weight</div>
                <div className="stat-value">500g</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Origin</div>
                <div className="stat-value">Local Farms</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Shelf Life</div>
                <div className="stat-value">7 days</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nutrition Tab */}
      {activeTab === "nutrition" && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title text-3xl font-bold">Nutrition Information</h2>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Macronutrient</th>
                    <th>Amount</th>
                    <th>% Daily Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Protein</td>
                    <td>20g</td>
                    <td>40%</td>
                  </tr>
                  <tr>
                    <td>Carbohydrates</td>
                    <td>50g</td>
                    <td>17%</td>
                  </tr>
                  <tr>
                    <td>Fat</td>
                    <td>10g</td>
                    <td>15%</td>
                  </tr>
                  <tr>
                    <td>Fiber</td>
                    <td>5g</td>
                    <td>20%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-3xl font-bold">Customer Reviews</h2>
              <button 
                className="btn btn-primary"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                Write a Review
              </button>
            </div>
            
            {/* Rating summary */}
            <div className="stats shadow my-4">
              <div className="stat">
                <div className="stat-title">Average Rating</div>
                <div className="stat-value text-primary">{averageRating.toFixed(1)}/5</div>
                <div className="stat-desc">Based on {reviews.length} reviews</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Rating Breakdown</div>
                <div className="w-full">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center mb-1">
                      <span className="w-8 text-sm">{star} ★</span>
                      <progress 
                        className="progress progress-primary w-56" 
                        value={ratingCounts[star-1]} 
                        max={reviews.length}
                      ></progress>
                      <span className="ml-2 text-sm">{ratingCounts[star-1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Review form */}
            {showReviewForm && (
              <div className="card bg-base-200 mb-6">
                <div className="card-body">
                  <h3 className="card-title">Write Your Review</h3>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Your Rating</span>
                    </label>
                    <div className="rating rating-lg">
                      {[...Array(5)].map((_, i) => (
                        <input 
                          key={i} 
                          type="radio" 
                          name="new-review-rating" 
                          className="mask mask-star-2 bg-orange-400"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Your Review</span>
                    </label>
                    <textarea className="textarea textarea-bordered h-24" placeholder="Write your review here..."></textarea>
                  </div>
                  <div className="form-control mt-4">
                    <button className="btn btn-primary">Submit Review</button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="divider"></div>
            
            <ul className="space-y-6">
              {reviews.map((review) => (
                <li key={review.id} className="card bg-base-200">
                  <div className="card-body">
                    <div className="flex items-center gap-4">
                      <div className="avatar placeholder">
                        <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
                          <span>{review.avatar}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{review.user}</h3>
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <input 
                              key={i} 
                              type="radio" 
                              name={`rating-${review.id}`} 
                              className="mask mask-star-2 bg-orange-400"
                              checked={i + 1 === review.rating}
                              readOnly
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-lg mt-2">{review.comment}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold mb-6">You May Also Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedProducts.map(product => (
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
      </div>
    </div>
  );
} 