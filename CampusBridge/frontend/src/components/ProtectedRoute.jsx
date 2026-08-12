import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user } = useAuth();

    // Fallback to localStorage in case React Context state hasn't flushed yet during Router navigation
    const localUserStr = localStorage.getItem('campusBridgeUser');
    const localUser = localUserStr ? JSON.parse(localUserStr) : null;
    const activeUser = user || localUser;

    if (!activeUser) return <Navigate to="/login" replace />;
    if (adminOnly && activeUser.role !== 'Admin') return <Navigate to="/feed" replace />;
    return children;
};

export default ProtectedRoute;
