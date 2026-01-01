import {createContext, type ReactNode, useContext, useEffect, useState} from 'react';
import api from "../apiConfig.ts";

type User = {
    id: number;
    username: string;
    is_staff: boolean;
    is_superuser: boolean;
} | null;

type AuthContextType = {
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    user?: User;

};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
        // Check localStorage immediately (synchronously) to avoid race condition on refresh
        const [isAuthenticated, setIsAuthenticated] = useState(() => {
            return !!localStorage.getItem("access_token");
        });

        const [user, setUser] = useState<User>(null);

        const fetchUserInfo = async (): Promise<User | null> => {
            try {
                const response = await api.get('/user-info/');
                const userData = response.data;

                const userInfo: User = {
                    id: userData.id,
                    username: userData.username,
                    is_staff: userData.is_staff,
                    is_superuser: userData.is_superuser,
                };

                setUser(userInfo);
                setIsAuthenticated(true);
                return userInfo;
            } catch (error: any) {
                console.error("Failed to fetch user info", error);

                // Token is invalid or expired
                if (error.response?.status === 401) {
                    // Try to refresh token
                    try {
                        const refreshToken = localStorage.getItem("refresh_token");
                        if (refreshToken) {
                            const refreshResponse = await api.post('/token/refresh/', {
                                refresh: refreshToken
                            });

                            localStorage.setItem('access_token', refreshResponse.data.access);
                            // Retry fetching user info
                            return await fetchUserInfo();
                        }
                    } catch (refreshError) {
                        console.error("Token refresh failed", refreshError);
                    }

                    // If refresh fails, logout
                    logout();
                }

                return null;
            }
        };


        // Fetch user info on app load if token exists
        useEffect(() => {
            const initAuth = async () => {
                const token = localStorage.getItem("access_token");
                if (token) {
                    await fetchUserInfo();
                }
            };
            initAuth();
        }, []);


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
            <AuthContext.Provider value={{isAuthenticated, login, logout, user}}>
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