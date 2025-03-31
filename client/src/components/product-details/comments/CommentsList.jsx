import React, { useState, useEffect } from 'react';
import { useGetComments, useDeleteComment, useEditComment, useGetAverageRating } from '../../api/commentsApi';
import useAuth from '../../hooks/useAuth';
import CommentForm from './CommentForm';

const CommentsList = ({ productId }) => {
  const { comments, loading, error, fetchComments } = useGetComments();
  const { averageRating, ratingCount, fetchAverageRating } = useGetAverageRating();
  const { deleteComment, isDeleting } = useDeleteComment();
  const { editComment, isEditing } = useEditComment();
  const { _id: currentUserId } = useAuth();
  
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editRating, setEditRating] = useState(5);
  
  useEffect(() => {
    fetchComments(productId);
    fetchAverageRating(productId);
  }, [productId]);
  
  const handleCommentAdded = () => {
    fetchComments(productId);
    fetchAverageRating(productId);
  };
  
  const handleDelete = async (commentId) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      const result = await deleteComment(commentId);
      if (result.success) {
        fetchComments(productId);
        fetchAverageRating(productId);
      }
    }
  };
  
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
    
    const result = await editComment(commentId, editText, editRating);
    
    if (result.success) {
      setEditingCommentId(null);
      fetchComments(productId);
      fetchAverageRating(productId);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  if (loading && comments.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }
  
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Customer Reviews</h2>
        <div className="flex items-center">
          <div className="rating rating-md">
            {[1, 2, 3, 4, 5].map((star) => (
              <input 
                key={star}
                type="radio" 
                className={`mask mask-star-2 bg-orange-400`}
                checked={Math.round(averageRating) === star}
                readOnly
              />
            ))}
          </div>
          <span className="ml-2 text-sm">
            ({averageRating.toFixed(1)}) {ratingCount} {ratingCount === 1 ? 'review' : 'reviews'}
          </span>
        </div>
      </div>
      
      <CommentForm productId={productId} onCommentAdded={handleCommentAdded} />
      
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}
      
      {comments.length === 0 ? (
        <div className="text-center py-10 bg-base-100 rounded-lg shadow-sm">
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <div className="flex justify-between">
                  <div>
                    <div className="rating rating-sm mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <input 
                          key={star}
                          type="radio" 
                          className={`mask mask-star-2 bg-orange-400`}
                          checked={comment.rating === star}
                          readOnly
                        />
                      ))}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {comment._ownerId === currentUserId ? 'You' : 'Anonymous'} • {formatDate(comment.createdAt)}
                      {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
                    </p>
                  </div>
                  
                  {comment._ownerId === currentUserId && (
                    <div className="flex space-x-2">
                      {editingCommentId !== comment._id && (
                        <>
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
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {editingCommentId === comment._id ? (
                  <div>
                    <div className="rating rating-md mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <input 
                          key={star}
                          type="radio" 
                          name={`edit-rating-${comment._id}`}
                          className={`mask mask-star-2 bg-orange-400`}
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
                  <p className="whitespace-pre-line">{comment.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsList; 