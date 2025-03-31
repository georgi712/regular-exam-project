import { UserContext } from "../contexts/userContext.js";
import usePersistedState from "../hooks/usePersistedState.js";

export default function UserProvider({ children }) {
  const [authData, setAuthData] = usePersistedState({});
  const userLoginHandler = (data) => {
    setAuthData(data);
  };
  const userLogoutHandler = () => {
    setAuthData({});
  };

  const updateUserAddress = (addressData) => {
    const newAddress = {
      address: addressData.address,
      isDefault: true,
    };

    setAuthData((currentData) => {
      const existingAddresses = currentData.addresses
        ? currentData.addresses.map((addr) => ({ ...addr, isDefault: false }))
        : [];

      const updatedAddresses = [...existingAddresses, newAddress];

      return {
        ...currentData,
        addresses: updatedAddresses,
      };
    });

    return true;
  };

  return (
    <UserContext.Provider
      value={{
        ...authData,
        userLoginHandler,
        userLogoutHandler,
        updateUserAddress,
      }}
      key={authData._id || "no-user"}
    >
      {children}
    </UserContext.Provider>
  );
}
