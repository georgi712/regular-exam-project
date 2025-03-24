import { useContext, useEffect, useState } from "react"
import request from "../utils/request.js"
import { UserContext } from "../contexts/userContext.js"

const baseUrl = 'http://localhost:3030/data/products'

export const useProducts = () => {
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