import { use, useEffect, useState } from "react"
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

export const useAdvancedProductFiltering = (initialFilters = {}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minPrice: '',
        maxPrice: '',
        origin: '',
        featured: '',
        sortBy: 'name',
        sortDirection: 'asc',
        ...initialFilters
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        setError(null);
        setLoading(true);
        
        request.get(baseUrl)
            .then(data => {
                if (!data || !Array.isArray(data)) {
                    console.warn("Server returned non-array result:", data);
                    setProducts([]);
                    setFilteredProducts([]);
                } else {
                    setProducts(data);
                }
                setError(null);
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    setError('Server request timed out. The server might be unavailable.');
                } else if (err.status === 404) {
                    setError('The product collection was not found. It may have been reset.');
                    setProducts([]);
                    setFilteredProducts([]);
                } else if (!navigator.onLine) {
                    setError('No internet connection. Please check your network.');
                } else {
                    setError(`Error: ${err.message || 'Server unavailable'}`);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [refreshTrigger]);

    useEffect(() => {
        if (!products || products.length === 0) return;

        let result = [...products];

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(product => 
                product.name?.toLowerCase().includes(searchTerm) ||
                product.description?.toLowerCase().includes(searchTerm) ||
                product.origin?.toLowerCase().includes(searchTerm) ||
                product.category?.toLowerCase().includes(searchTerm)
            );
        }

        if (filters.category && filters.category !== 'all') {
            result = result.filter(product => product.category === filters.category);
        }

        if (filters.minPrice !== '') {
            const minPrice = parseFloat(filters.minPrice);
            result = result.filter(product => product.price >= minPrice);
        }

        if (filters.maxPrice !== '') {
            const maxPrice = parseFloat(filters.maxPrice);
            result = result.filter(product => product.price <= maxPrice);
        }

        if (filters.origin) {
            result = result.filter(product => product.origin === filters.origin);
        }

        if (filters.featured !== '') {
            const isFeatured = filters.featured === 'true';
            result = result.filter(product => product.featured === isFeatured);
        }

        if (filters.sortBy) {
            result.sort((a, b) => {
                let valueA = a[filters.sortBy];
                let valueB = b[filters.sortBy];
                
                if (typeof valueA === 'string') {
                    valueA = valueA.toLowerCase();
                    valueB = valueB.toLowerCase();
                }
                
                if (valueA === undefined) return 1;
                if (valueB === undefined) return -1;
                
                if (valueA < valueB) return filters.sortDirection === 'asc' ? -1 : 1;
                if (valueA > valueB) return filters.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        setFilteredProducts(result);
        setTotalCount(result.length);
    }, [products, filters]);

    const updateFilters = (newFilters) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters
        }));
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            category: '',
            minPrice: '',
            maxPrice: '',
            origin: '',
            featured: '',
            sortBy: 'name',
            sortDirection: 'asc'
        });
    };

    const refreshProducts = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    const getFilterOptions = () => {
        if (!products || products.length === 0) return {};

        const categories = [...new Set(products.map(p => p.category))];
        const origins = [...new Set(products.map(p => p.origin).filter(Boolean))];
        
        let minPrice = Math.min(...products.map(p => p.price));
        let maxPrice = Math.max(...products.map(p => p.price));

        return {
            categories,
            origins,
            priceRange: { min: minPrice, max: maxPrice }
        };
    };

    return {
        products: filteredProducts,
        allProducts: products,
        setProducts,
        totalCount,
        error,
        loading,
        filters,
        updateFilters,
        resetFilters,
        refreshProducts,
        filterOptions: getFilterOptions()
    };
}

export const useFeaturedProducts = () => {
    const [featuredProducts, setFeaturedProducts] = useState([])
    const query = encodeURIComponent('featured=true');

    useEffect(() => {
        request.get(`${baseUrl}?where=${query}&pageSize=8`)
            .then(setFeaturedProducts)
    }, [])

    return {
        featuredProducts,
    }
}