import Cookies from 'js-cookie';
import { Navigate } from 'react-router-dom';

// for the login page - if you already have a token theres no point
// showing the login form again, just send straight to the dashboard
export default function PublicOnlyRoute({ children }) {
  const token = Cookies.get('jwt_token');

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
}
