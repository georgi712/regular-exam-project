import { useContext } from "react";
import { UserContext } from "../contexts/userContext.js";
import request from "../utils/request.js";

export default function useAuth() {
    const authData = useContext(UserContext);

    const requestWrapper = (method, url, data, options = {}) => { 
        const optionsWrapper = {
            ...options,
            headers: {
                'X-Authorization': authData.accessToken,
                ...options.headers
            }
        }
        
        return request.baseRequest(method, url, data, optionsWrapper)
    }

    return {
        ...authData,
        isAuthenticated: !!authData.accessToken, 
        request: {
            get: requestWrapper.bind(null, 'GET'),
            post: requestWrapper.bind(null, 'POST'),
            put: requestWrapper.bind(null, 'PUT'),
            delete: requestWrapper.bind(null, 'DELETE'),
            patch: requestWrapper.bind(null, 'PATCH'),
        },
    }
}