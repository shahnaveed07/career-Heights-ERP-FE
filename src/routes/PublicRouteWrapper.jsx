import { useLocation, useNavigate } from 'react-router-dom';
import { PublicHomeView } from '../views/PublicHomeView';
import { ROUTES } from './routeConfig';

export const PublicRouteWrapper = ({ section }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Resolve section based on prop or pathname
  const resolveSection = () => {
    if (section) return section;
    const path = location.pathname.replace(/^\//, '').toLowerCase();
    if (!path) return 'home';
    return path;
  };

  const handleNavigate = (pageId) => {
    const targetPath = pageId === 'home' ? ROUTES.HOME : `/${pageId}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const handleOpenLogin = () => {
    navigate(ROUTES.LOGIN);
  };

  return (
    <PublicHomeView
      initialPage={resolveSection()}
      onSelectPublicPage={handleNavigate}
      onOpenLogin={handleOpenLogin}
    />
  );
};
