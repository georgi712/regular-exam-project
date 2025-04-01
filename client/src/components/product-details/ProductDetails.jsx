import { useParams } from 'react-router-dom';
import { useProduct } from '../../api/productApi';
import { useState, useEffect } from 'react';
import { useAddToCart } from '../../api/userProfileApi.js';
import { useGetComments, useGetAverageRating, useEditComment, useDeleteComment } from '../../api/commentsApi';
import CommentForm from './comments/CommentForm';
import useAuth from '../../hooks/useAuth.js';
import { useToastContext } from '../../contexts/ToastContext.jsx';

export default function ProductDetails() {
  const { productId } = useParams();
  const { product, loading: productLoading, error: productError } = useProduct(productId);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { updateCartHandler } = useAddToCart();
  const { _id: currentUserId } = useAuth();
  const toast = useToastContext();
  
  const { comments, loading: commentsLoading, error: commentsError, fetchComments } = useGetComments();
  const { 
    averageRating, 
    ratingCount, 
    loading: ratingLoading, 
    error: ratingError,
    fetchAverageRating 
  } = useGetAverageRating();
  const { editComment, isEditing } = useEditComment();
  const { deleteComment, isDeleting } = useDeleteComment();
  
  // For editing comments
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  
  useEffect(() => {
    if (productId) {
      fetchComments(productId);
      fetchAverageRating(productId);
    }
  }, [productId]);

  useEffect(() => {
    if (productError) {
      toast.error(`Error loading product: ${productError}`);
    }
  }, [productError, toast]);

  useEffect(() => {
    if (commentsError) {
      toast.error(`Error loading comments: ${commentsError}`);
    }
  }, [commentsError, toast]);

  useEffect(() => {
    if (ratingError) {
      toast.error(`Error loading ratings: ${ratingError}`);
    }
  }, [ratingError, toast]);
  
  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    try {
      updateCartHandler(productId, quantity, product.price, product.imageUrl, product.name);
      setQuantity(1);
      toast.success(`${quantity} × ${product.name} added to cart`);
    } catch (err) {
      toast.error('Failed to add product to cart');
    }
  };
  
  const handleCommentAdded = () => {
    fetchComments(productId);
    fetchAverageRating(productId);
    setShowReviewForm(false);
    toast.success('Your review has been added');
  };
  
  // Edit comment functions
  const startEditing = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
    setEditRating(comment.rating);
  };
  
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditText('');
    setEditRating(5);
  };
  
  const submitEdit = async (commentId) => {
    if (!editText.trim()) return;
    
    const loadingToastId = toast.info('Updating your review...', 10000);
    
    const result = await editComment(commentId, editText, editRating);
    
    toast.removeToast(loadingToastId);
    
    if (result.success) {
      setEditingCommentId(null);
      fetchComments(productId);
      fetchAverageRating(productId);
      toast.success('Your review has been updated');
    } else {
      toast.error(result.error || 'Failed to update review');
    }
  };
  
  // Delete comment function
  const handleDelete = async (commentId) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      const loadingToastId = toast.info('Deleting your review...', 10000);
      
      const result = await deleteComment(commentId);
      
      toast.removeToast(loadingToastId);
      
      if (result.success) {
        fetchComments(productId);
        fetchAverageRating(productId);
        toast.success('Your review has been deleted');
      } else {
        toast.error(result.error || 'Failed to delete review');
      }
    }
  };
 
  const ratingCounts = Array(5).fill(0);
  comments.forEach(comment => {
    if (comment.rating >= 1 && comment.rating <= 5) {
      ratingCounts[comment.rating - 1]++;
    }
  });

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-[400px]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>Failed to load product. Please try again later.</span>
        </div>
      </div>
    );
  }

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
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          </div>
          
          {/* Rating summary */}
          <div className="stats shadow my-4">
            <div className="stat">
              <div className="stat-title">Average Rating</div>
              <div className="stat-value text-primary">
                {commentsLoading ? (
                  <span className="loading loading-spinner loading-md"></span>
                ) : (
                  `${averageRating.toFixed(1)}/5`
                )}
              </div>
              <div className="stat-desc">Based on {ratingCount} reviews</div>
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
                      max={comments.length || 1}
                    ></progress>
                    <span className="ml-2 text-sm">{ratingCounts[star-1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Review form */}
          {showReviewForm && (
            <CommentForm 
              productId={productId} 
              onCommentAdded={handleCommentAdded} 
            />
          )}
          
          <div className="divider"></div>
          
          {commentsLoading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10 bg-base-200 rounded-lg">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {comments.map((comment) => (
                <li key={comment._id} className="card bg-base-200">
                  <div className="card-body">
                    {editingCommentId === comment._id ? (
                      <div>
                        <div className="rating rating-md mb-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <input 
                              key={star}
                              type="radio" 
                              name={`edit-rating-${comment._id}`}
                              className="mask mask-star-2 bg-orange-400"
                              checked={editRating === star}
                              onChange={() => setEditRating(star)}
                            />
                          ))}
                        </div>
                        
                        <textarea 
                          className="textarea textarea-bordered w-full mb-4"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        ></textarea>
                        
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={cancelEditing}
                            className="btn btn-outline btn-sm"
                            disabled={isEditing}
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => submitEdit(comment._id)}
                            className="btn btn-primary btn-sm"
                            disabled={isEditing || !editText.trim()}
                          >
                            {isEditing ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              'Save'
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold">
                              {comment.user || 'Anonymous User'}
                            </h3>
                            <div className="text-sm text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                              {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
                            </div>
                          </div>
                          <div className="rating mb-2">
                            {[...Array(5)].map((_, i) => (
                              <input 
                                key={i} 
                                type="radio" 
                                name={`rating-${comment._id}`} 
                                className="mask mask-star-2 bg-orange-400"
                                checked={i + 1 === comment.rating}
                                readOnly
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-lg mt-2">{comment.text}</p>
                        
                        {comment._ownerId === currentUserId && (
                          <div className="flex justify-end space-x-2 mt-4">
                            <button 
                              onClick={() => startEditing(comment)}
                              className="btn btn-ghost btn-sm"
                              disabled={isDeleting}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(comment._id)}
                              className="btn btn-ghost btn-sm text-error"
                              disabled={isDeleting}
                            >
                              {isDeleting ? (
                                <span className="loading loading-spinner loading-xs"></span>
                              ) : (
                                'Delete'
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 