import Cookies from 'js-cookie';
import { Link, useNavigate } from 'react-router-dom';

// navbar only shows up on pages that need login (dashboard + referral detail)
// so we dont really need to check if logged in, log out button just always shows
export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    Cookies.remove('jwt_token');
    navigate('/login');
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="Go to dashboard home">
          Go Business
        </Link>

        <nav aria-label="Primary" className="navbar__nav">
          <Link to="/" className="navbar__link">
            Home
          </Link>
        </nav>

        <div className="navbar__actions">
          <Link to="/" className="navbar__trial">
            Try for free
          </Link>
          <button type="button" className="navbar__logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
