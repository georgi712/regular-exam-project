import { useState } from "react";
import request from "../utils/request.js";
import useAuth from "../hooks/useAuth.js";

const baseUrl = 'http://localhost:3030/data/contacts';

export const useCreateContact = () => {
    const { request } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const submitContactForm = async (contactData) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await request.post(baseUrl, contactData);
            
            setIsSubmitting(false);
            setSuccess(true);
            return { success: true, data: result };
        } catch (err) {
            setError(err.message || 'Failed to submit contact form');
            setIsSubmitting(false);
            return { success: false, error: err.message || 'Failed to submit contact form' };
        }
    };

    return {
        submitContactForm,
        isSubmitting,
        error,
        success,
        clearSuccess: () => setSuccess(false)
    };
}; 