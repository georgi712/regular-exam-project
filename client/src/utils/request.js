const request = async (method, url, data, options = {}) => {
    if (method !== 'GET') {
        options.method = method;
        
        if (data) {
            options = {
                ...options,
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            }
        }
    } else {
        if (data && Object.keys(data).length > 0) {
            const queryParams = new URLSearchParams();
            for (const [key, value] of Object.entries(data)) {
                queryParams.append(key, value);
            }
            url = `${url}${url.includes('?') ? '&' : '?'}${queryParams.toString()}`;
        }
    }

    const response = await fetch(url, options);
    const responseContentType = response.headers.get('Content-Type')
    if (!responseContentType) {
        return;
    }

    const result = await response.json();

    return result;
}

export default {
    baseRequest: request,
    get: request.bind(null, 'GET'),
    post: request.bind(null, 'POST'),
    put: request.bind(null, 'PUT'),
    delete: request.bind(null, 'DELETE'),
    patch: request.bind(null, 'PATCH'),
}