// src/routes/ProtectedRoute.tsx
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext.tsx';

const ProtectedRoute = () => {
    const {isAuthenticated} = useAuth();

    return isAuthenticated ? <Outlet/> : <Navigate to="/admin-login" replace/>;
};

export default ProtectedRoute;