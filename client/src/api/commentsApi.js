import { useState, useRef, useEffect } from 'react';
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
  
  // Reference to store the current abort controller
  const abortControllerRef = useRef(null);

  const fetchComments = async (productId) => {
    setLoading(true);
    setError(null);
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const searchQuery = encodeURIComponent(`productId="${productId}"`);
      
      // Pass the abort signal to the request method
      const result = await request.get(`${baseUrl}?where=${searchQuery}`, {
        signal: abortController.signal
      });
      
      // Only proceed if the request wasn't aborted
      if (!abortController.signal.aborted) {
        try {
          const sortedComments = Array.isArray(result) 
            ? result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            : [];
          
          setComments(sortedComments);
          return { success: true, data: sortedComments };
        } catch (sortErr) {
          console.error('Error sorting comments:', sortErr);
          // If sorting fails, still return the unsorted comments
          setComments(Array.isArray(result) ? result : []);
          return { success: true, data: result };
        }
      }
    } catch (err) {
      // Ignore abort errors as they're expected
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch comments');
        return { success: false, error: err.message };
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };
  
  // Cleanup function to abort any pending requests when the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { comments, loading, error, fetchComments };
};

export const useGetAverageRating = () => {
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { request } = useAuth();
  
  // Reference to store the current abort controller
  const abortControllerRef = useRef(null);

  const fetchAverageRating = async (productId) => {
    setLoading(true);
    setError(null);
    
    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create a new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const searchQuery = encodeURIComponent(`productId="${productId}"`);
      
      // Pass the abort signal to the request method
      const result = await request.get(`${baseUrl}?where=${searchQuery}`, {
        signal: abortController.signal
      });
      
      // Only proceed if the request wasn't aborted
      if (!abortController.signal.aborted) {
        if (!Array.isArray(result) || result.length === 0) {
          setAverageRating(0);
          setRatingCount(0);
          return { success: true, averageRating: 0, count: 0 };
        }
        
        const totalRating = result.reduce((sum, comment) => {
          const rating = Number(comment.rating) || 0;
          return sum + rating;
        }, 0);
        
        const average = totalRating / result.length;
        
        setAverageRating(average);
        setRatingCount(result.length);
        
        return { 
          success: true, 
          averageRating: average, 
          count: result.length 
        };
      }
    } catch (err) {
      // Ignore abort errors as they're expected
      if (err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch average rating');
        return { success: false, error: err.message };
      }
    } finally {
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  };
  
  // Cleanup function to abort any pending requests when the component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { averageRating, ratingCount, loading, error, fetchAverageRating };
};
