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
    const [products, setProducts] = useState([])    
    const [error, setError] = useState(null);

    useEffect(() => {
        setError(null);
        
        try {
            const queryParams = new URLSearchParams();
            
            if (searchParams.has('category')) {
                queryParams.set('where', `category="${searchParams.get('category')}"`);
            }
            
            if (searchParams.has('sortBy')) {
                queryParams.set('sortBy', searchParams.get('sortBy'));
            }
            
            const pageSize = searchParams.get('pageSize') || '10';
            queryParams.set('pageSize', pageSize);
            
            if (searchParams.has('offset')) {
                queryParams.set('offset', searchParams.get('offset'));
            }
            
            const queryString = queryParams.toString();
            console.log("Making API request to:", `${baseUrl}?${queryString}`);
            
            request.get(`${baseUrl}?${queryString}`)
                .then(result => {
                    console.log("API response success:", result);
                    setProducts(result || []);
                })
                .catch(err => {
                    console.error("Error fetching products:", err);
                    console.error("Response status:", err.status);
                    console.error("Response message:", err.message);
                    setError(`API Error: ${err.message || 'Unknown error'}`);
                    setProducts([]);
                });
        } catch (err) {
            console.error("Exception in request preparation:", err);
            setError(`Request Error: ${err.message}`);
            setProducts([]);
        }
    }, [searchParams])

    const totalCount = products.length;
    return {
        products,
        setProducts,
        totalCount,
        error
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