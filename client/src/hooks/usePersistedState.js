import { useState } from "react";

export default function usePersistedState(intialState) {
    const [state, setState] = useState(() => {
        const persistedStateJSON = localStorage.getItem('auth')
        if (!persistedStateJSON) {
            return typeof intialState === 'function' ? intialState() : intialState;
        }

        const persistedState = JSON.parse(persistedStateJSON);

        return persistedState;
    });

    const setPersistedState = (input) => {
        const data = typeof input === 'function' ? input(state) : input;
        const persistedData = JSON.stringify(data);

        localStorage.setItem('auth', persistedData);
        
        setState(data);
    }

    return[
        state, 
        setPersistedState,
    ]
}