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
