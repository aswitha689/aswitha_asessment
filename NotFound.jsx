import { Link } from 'react-router-dom';

// this page does not need navbar/footer, its shown for any bad url
export default function NotFound() {
  return (
    <div className="not-found-screen">
      <p className="not-found-screen__code">404</p>
      <h1>Page not found</h1>
      <Link to="/" className="not-found-screen__link">
        Back to dashboard
      </Link>
    </div>
  );
}
