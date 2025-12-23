import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import api from "../apiConfig.ts";

type AuthContextType = {
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
        const [isAuthenticated, setIsAuthenticated] = useState(false);

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

        // Check auth on app load
        useEffect(() => {
            const token = localStorage.getItem("access_token")
            if(token) {
                setIsAuthenticated(true);
            }
        }, []);

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