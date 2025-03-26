import { useContext, useEffect, useState } from "react"
import request from "../utils/request.js"
import { UserContext } from "../contexts/userContext.js"
import { useSearchParams } from "react-router-dom"

const baseUrl = 'http://localhost:3030/data/products'

export const useAllProducts = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {

        request.get(baseUrl)
            .then(setProducts)
    }, [])

    return {
        products,
        setProducts
    }
}

export const useProductUrlParams = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalProductCount, setTotalProductCount] = useState(0);

    useEffect(() => {
        setError(null);
        setLoading(true);
        
        console.log("useProductUrlParams useEffect triggered with searchParams:", 
            Object.fromEntries(searchParams.entries()));
        
        try {
            const queryParams = new URLSearchParams();
            
            // Create a copy of search params for count query
            const countParams = new URLSearchParams();
            
            // Set up the main query parameters
            if (searchParams.has('category')) {
                const categoryValue = searchParams.get('category');
                console.log("Category filter:", categoryValue);
                // Generate the 'where' parameter internally based on category
                queryParams.set('where', `category="${categoryValue}"`);
                countParams.set('where', `category="${categoryValue}"`);
            } else if (searchParams.has('where')) {
                // Support direct 'where' parameter if it exists (for backward compatibility)
                const whereValue = searchParams.get('where');
                queryParams.set('where', whereValue);
                countParams.set('where', whereValue);
            }
            
            if (searchParams.has('sortBy')) {
                const sortValue = searchParams.get('sortBy');
                console.log("Sort value:", sortValue);
                
                // Don't encode to avoid server issues
                queryParams.set('sortBy', sortValue);
            }
            
            // Add pagination only to the main query
            // Force consistent page size of 6 for the products page
            const FIXED_PAGE_SIZE = 6;
            console.log("Enforcing page size:", FIXED_PAGE_SIZE);
            queryParams.set('pageSize', FIXED_PAGE_SIZE.toString());
            
            if (searchParams.has('offset')) {
                const offsetValue = searchParams.get('offset');
                console.log("Offset:", offsetValue);
                queryParams.set('offset', offsetValue);
            }
            
            // Set up count parameter for the count query
            countParams.set('count', 'true');
            
            const queryString = queryParams.toString();
            const countQueryString = countParams.toString();
            
            console.log("Main query parameters:", Object.fromEntries(queryParams.entries()));
            console.log("Count query parameters:", Object.fromEntries(countParams.entries()));
            console.log("Making API request to:", `${baseUrl}?${queryString}`);
            console.log("Making count request to:", `${baseUrl}?${countQueryString}`);
            
            // Make both requests in parallel
            Promise.all([
                // Get the actual products
                request.get(`${baseUrl}?${queryString}`),
                // Get the total count
                request.get(`${baseUrl}?${countQueryString}`)
            ])
            .then(([productsResult, countResult]) => {
                console.log("Products response:", productsResult);
                console.log("Count response:", countResult);
                
                // Ensure products result is always an array
                if (!productsResult || !Array.isArray(productsResult)) {
                    console.warn("Server returned non-array result:", productsResult);
                    setProducts([]);
                } else {
                    setProducts(productsResult);
                }
                
                // Set total count from the count query
                if (typeof countResult === 'number') {
                    setTotalProductCount(countResult);
                } else {
                    // Fallback if server doesn't return a count
                    setTotalProductCount(productsResult?.length || 0);
                }
                
                setError(null);
            })
            .catch(err => {
                console.error("Error fetching products:", err);
                
                if (err.name === 'AbortError') {
                    setError('Server request timed out. The server might be unavailable.');
                } else if (err.status === 404) {
                    setError('The product collection was not found. It may have been reset.');
                    setProducts([]);
                } else if (!navigator.onLine) {
                    setError('No internet connection. Please check your network.');
                } else {
                    setError(`Error: ${err.message || 'Server unavailable'}`);
                }
            })
            .finally(() => {
                setLoading(false);
            });
                
        } catch (err) {
            console.error("Exception in request preparation:", err);
            setError(`Request Error: ${err.message}`);
            setLoading(false);
        }
    }, [searchParams])

    return {
        products: products || [], // Always return an array even if products is undefined
        setProducts,
        totalCount: totalProductCount,
        error,
        loading
    }
}

export const useCreateProduct = () => {
    const { accessToken } = useContext(UserContext);

    const options = {
        headers: {
            'X-Authorization': accessToken,
        }
    }

    const create = (productData) => {
        return request.post(baseUrl, productData, options)
    }

    return {
        create,
    }
}