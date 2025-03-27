import { useParams } from 'react-router-dom';
import { useProduct } from '../../api/productApi';
import { useState, useEffect } from 'react';

export default function ProductDetails() {
  const { productId } = useParams();
  const { product } = useProduct(productId);
  
  const [activeTab, setActiveTab] = useState("details");
  const [quantity, setQuantity] = useState(1);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  const reviews = [
    { id: 1, user: 'Alice', avatar: 'A', rating: 5, comment: 'Great product! Really enjoyed the taste and quality.' },
    { id: 2, user: 'Bob', avatar: 'B', rating: 4, comment: 'Very useful and healthy. Would recommend to friends and family.' },
  ];
  
  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  
  // Rating breakdown
  const ratingCounts = Array(5).fill(0);
  reviews.forEach(review => {
    ratingCounts[review.rating - 1]++;
  });

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-[400px]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="rounded-xl overflow-hidden">
          <img
            src={product.image || product.imageUrl}
            alt={product.name}
            className="w-full h-[500px] object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-accent">{product.price} лв</span>
            <span className="text-lg text-base-content/70">/ {product.pricePerKg} лв/кг</span>
          </div>

          <div className="flex items-center gap-2 text-base-content/70 text-base bg-base-200/50 p-3 rounded-lg">
            <span>{product.weight}</span>
            <span>•</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-base-300">
                <img 
                  src={product.originFlag || "https://via.placeholder.com/30"} 
                  alt={`${product.origin} flag`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span>{product.origin}</span>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-base-content/80">{product.description || 'No description available.'}</p>
          </div>

          <div className="mt-auto">
            <button className="btn btn-accent btn-lg w-full">
              Add to Cart
            </button>
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
    </div>
  );
} 