import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';

// wraps pages that need login. checks for the jwt_token cookie,
// and if its not there it just sends you to the login page
export default function ProtectedRoute({ children }) {
  const token = Cookies.get('jwt_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
