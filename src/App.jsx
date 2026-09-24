import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ErpDataProvider } from './context/ErpDataContext';
import { AppRoutes } from './routes/AppRoutes';

/**
 * Root composition component.
 * Provides application-level contexts (Auth, ERP Data) and declarative URL routing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErpDataProvider>
          <AppRoutes />
        </ErpDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
