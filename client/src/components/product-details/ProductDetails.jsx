import { useParams } from 'react-router-dom';
import { useProduct } from '../../api/productApi';
import { useState } from 'react';
import { useAddToCart } from '../../api/userProfileApi.js';

export default function ProductDetails() {
  const { productId } = useParams();
  const { product } = useProduct(productId);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const {updateCartHandler} = useAddToCart();
  
  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    updateCartHandler(productId, quantity, product.price, product.imageUrl, product.name);
    setQuantity(1);
  };
  
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
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

          {/* Quantity selector */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Quantity</h3>
            <div className="flex items-center bg-base-200/50 rounded-lg p-3 w-full md:w-1/2">
              <button 
                className="btn btn-circle btn-sm"
                onClick={() => handleQuantityChange(-1)}
              >
                -
              </button>
              <span className="flex-1 text-center text-xl font-medium">{quantity}</span>
              <button 
                className="btn btn-circle btn-sm"
                onClick={() => handleQuantityChange(1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="mt-auto">
            <button 
              className="btn btn-accent btn-lg w-full"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
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
    </div>
  );
} 