import request from "../utils/request.js"

const baseUrl = 'http://localhost:3030/users';

export const useLogin = () => {
    const login = async (email, password) => {
        const result = await request.post(`${baseUrl}/login`, {email, password});
        
        return result;
    }

    return {
        login,
    }
}

export const useRegister = () => {
    const register =  async (email, password, username) => {
        const result = await request.post(`${baseUrl}/register`, {email, password, username, role: 'user'})

        return result;
    }

    return {
        register,
    }
}