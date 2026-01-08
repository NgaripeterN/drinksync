import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        const userName = localStorage.getItem('userName');
        if (token && userRole) {
            setUser({ token, role: userRole, name: userName });
        }
        setLoading(false);
    }, []);

    const login = (token, role, name) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', name);
        setUser({ token, role, name });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        setUser(null);
        router.push('/login');
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);