import { useState } from 'react';
import useAuth from '../hooks/useAuth.js';

const baseUrl = 'http://localhost:3030/data/comments';

export const useCreateComment = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const { username, _id: userId, request } = useAuth();

  const createComment = async (productId, text, rating) => {
    setIsCreating(true);
    setError(null);

    try {
      const commentData = {
        productId,
        text,
        rating: Number(rating),
        user: username || 'Anonymous User'
      };

      const result = await request.post(baseUrl, commentData);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message || 'Failed to create comment');
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  };

  return { createComment, isCreating, error };
};

export const useEditComment = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const { request } = useAuth();

  const editComment = async (commentId, text, rating) => {
    setIsEditing(true);
    setError(null);

    try {
      const updates = {
        text,
        rating: Number(rating),
        updatedAt: new Date().toISOString()
      };

      const result = await request.patch(`${baseUrl}/${commentId}`, updates);
      return { success: true, data: result };
    } catch (err) {
      setError(err.message || 'Failed to edit comment');
      return { success: false, error: err.message };
    } finally {
      setIsEditing(false);
    }
  };

  return { editComment, isEditing, error };
};

export const useDeleteComment = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const { request } = useAuth();

  const deleteComment = async (commentId) => {
    setIsDeleting(true);
    setError(null);

    try {
      await request.delete(`${baseUrl}/${commentId}`);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
      return { success: false, error: err.message };
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteComment, isDeleting, error };
};

export const useGetComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { request } = useAuth();

  const fetchComments = async (productId) => {
    setLoading(true);
    setError(null);

    try {
      const searchQuery = encodeURIComponent(`productId="${productId}"`);
      const result = await request.get(`${baseUrl}?where=${searchQuery}`);
      
      const sortedComments = result.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setComments(sortedComments);
      return { success: true, data: sortedComments };
    } catch (err) {
      setError(err.message || 'Failed to fetch comments');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { comments, loading, error, fetchComments };
};

export const useGetAverageRating = () => {
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { request } = useAuth();

  const fetchAverageRating = async (productId) => {
    setLoading(true);
    setError(null);

    try {
      const searchQuery = encodeURIComponent(`productId="${productId}"`);
      const result = await request.get(`${baseUrl}?where=${searchQuery}`);
      
      if (result.length === 0) {
        setAverageRating(0);
        setRatingCount(0);
        return { success: true, averageRating: 0, count: 0 };
      }
      
      const totalRating = result.reduce((sum, comment) => sum + comment.rating, 0);
      const average = totalRating / result.length;
      
      setAverageRating(average);
      setRatingCount(result.length);
      
      return { 
        success: true, 
        averageRating: average, 
        count: result.length 
      };
    } catch (err) {
      setError(err.message || 'Failed to fetch average rating');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { averageRating, ratingCount, loading, error, fetchAverageRating };
};
