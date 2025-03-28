import useAuth from "../hooks/useAuth.js"

const baseUrl = 'http://localhost:3030/data/user_profiles'

export const useCreateUserProfile = () => {
    const {request, addresses, cart} = useAuth();
    
    const createUserProfile = ( accessToken) => {
        
        const userProfileData = {};

        const options = {
            headers: {
                'X-Authorization': accessToken
            }
        }

        if (addresses) {
            userProfileData.addresses = addresses
        }
        if (cart) {
            userProfileData.cart = cart
        }
        request.post(baseUrl, userProfileData, options)
            .then(result => console.log(result))
    }

    return {
        createUserProfile
    }
}