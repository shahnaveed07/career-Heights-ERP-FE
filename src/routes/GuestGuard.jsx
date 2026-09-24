import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDefaultRouteForRole } from './routeConfig';

/**
 * Prevents authenticated users from seeing the login screen.
 * Redirects them to their intended destination or default role dashboard.
 */
export const GuestGuard = ({ children }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  if (isAuthenticated && currentUser) {
    const destination =
      location.state?.from?.pathname && location.state.from.pathname !== '/login'
        ? location.state.from.pathname
        : getDefaultRouteForRole(currentUser.role);

    return <Navigate to={destination} replace />;
  }

  return children ? children : <Outlet />;
};
