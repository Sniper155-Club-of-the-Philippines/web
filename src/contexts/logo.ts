import { createContext, useContext } from 'react';

export const LogoContext = createContext<string | null>(null);

export const useLogo = () => {
    return useContext(LogoContext);
};
