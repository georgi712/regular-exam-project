import { useEffect, useState } from "react"
import request from "../utils/request.js"
import { useSearchParams } from "react-router-dom"
import useAuth from "../hooks/useAuth.js"

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
            
            const countParams = new URLSearchParams();
            
            if (searchParams.has('category')) {
                const categoryValue = searchParams.get('category');
                queryParams.set('where', `category="${categoryValue}"`);
                countParams.set('where', `category="${categoryValue}"`);
            } else if (searchParams.has('where')) {
                const whereValue = searchParams.get('where');
                queryParams.set('where', whereValue);
                countParams.set('where', whereValue);
            }
            
            if (searchParams.has('sortBy')) {
                const sortValue = searchParams.get('sortBy');
                
                queryParams.set('sortBy', sortValue);
            }
            
            const FIXED_PAGE_SIZE = 6;
            queryParams.set('pageSize', FIXED_PAGE_SIZE.toString());
            
            if (searchParams.has('offset')) {
                const offsetValue = searchParams.get('offset');
                queryParams.set('offset', offsetValue);
            }
            
            countParams.set('count', 'true');
            
            const queryString = queryParams.toString();
            const countQueryString = countParams.toString();
            
            Promise.all([
                request.get(`${baseUrl}?${queryString}`),
                request.get(`${baseUrl}?${countQueryString}`)
            ])
            .then(([productsResult, countResult]) => {
                
                if (!productsResult || !Array.isArray(productsResult)) {
                    console.warn("Server returned non-array result:", productsResult);
                    setProducts([]);
                } else {
                    setProducts(productsResult);
                }
                
                if (typeof countResult === 'number') {
                    setTotalProductCount(countResult);
                } else {
                    setTotalProductCount(productsResult?.length || 0);
                }
                
                setError(null);
            })
            .catch(err => {
                
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
        products: products || [], 
        setProducts,
        totalCount: totalProductCount,
        error,
        loading
    }
}

export const useCreateProduct = () => {
    const { request } = useAuth();

    const create = (productData) => {
        return request.post(baseUrl, productData);
    }

    return {
        create,
    }
}

export const useProduct = (productId) => {
    const [product, setProduct] = useState({});

    useEffect(() => {
        request.get(`${baseUrl}/${productId}`)
            .then(setProduct);
    }, [productId])

    return {
        product
    }
}

export const useEditProduct = () => {
    const { request } = useAuth();

    const edit = (productId, productData) => {
        return request.put(`${baseUrl}/${productId}`, {...productData, _id: productId})
    }

    return {
        edit,
    }
}

export const useDeleteProduct = () => {
    const { request } = useAuth();

    const deleteProduct = (productId) => {
        return request.delete(`${baseUrl}/${productId}`)
    }

    return {
        deleteProduct,
    }
}