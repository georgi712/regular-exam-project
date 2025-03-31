import React, { useState } from 'react';
import { useCreateComment } from '../../../api/commentsApi';

const CommentForm = ({ productId, onCommentAdded }) => {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const { createComment, isCreating, error } = useCreateComment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    const result = await createComment(productId, text, rating);
    
    if (result.success) {
      setText('');
      setRating(5);
      if (onCommentAdded) {
        onCommentAdded(result.data);
      }
    }
  };

  return (
    <div className="card bg-base-100 shadow-md mb-6">
      <div className="card-body">
        <h3 className="text-lg font-bold mb-4">Leave a Review</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="flex mb-4">
            <div className="rating rating-lg">
              {[1, 2, 3, 4, 5].map((star) => (
                <input 
                  key={star}
                  type="radio" 
                  name="rating" 
                  className={`mask mask-star-2 ${star <= 3 ? 'bg-orange-400' : 'bg-orange-400'}`}
                  checked={rating === star}
                  onChange={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          
          <div className="form-control mb-4">
            <textarea 
              className="textarea textarea-bordered h-24 w-full"
              placeholder="Write your review here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            ></textarea>
          </div>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isCreating || !text.trim()}
          >
            {isCreating ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentForm; 