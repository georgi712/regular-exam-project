const request = async (method, url, data, options = {}) => {
    if (method !== 'GET') {
        options.method = method;
        
    }

    if (data) {
        options = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
    }

    const response = await fetch(url, options);
    const result = await response.json();

    return result;
}

export default {
    request,
    get: request.bind(null, 'GET'),
    post: request.bind(null, 'POST'),
    put: request.bind(null, 'PUT'),
    delete: request.bind(null, 'DELETE'),
    patch: request.bind(null, 'PATCH'),
}