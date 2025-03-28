import { createContext } from "react";

export const UserContext = createContext({
    _id: '',
    email: '',
    accessToken: '',
    username: '',
    addresses: [],
    cart: [],
    userLoginHandler: () => null,
    userLogoutHandler: () => null,
})