import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import api from "../apiConfig.ts";

type AuthContextType = {
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
        // Check localStorage immediately (synchronously) to avoid race condition on refresh
        const [isAuthenticated, setIsAuthenticated] = useState(() => {
            return !!localStorage.getItem("access_token");
        });

        // Login
        const login = async (username: string, password: string): Promise<boolean> => {
            try {
                const response = await api.post('/token/', {
                    username,
                    password,
                });

                const {access, refresh} = response.data;

                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);

                setIsAuthenticated(true);
                return true;
            } catch (error) {
                console.error("Login failed", error)
                return false
            }
        };

        // Logout
        const logout = () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsAuthenticated(false);
        };

        // Verify token is still valid on app load (optional - can validate with API if needed)
        // For now, just checking localStorage is enough since API interceptor handles token refresh

        return (
            <AuthContext.Provider value={{isAuthenticated, login, logout}}>
                {children}
            </AuthContext.Provider>
        );
    }
;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};