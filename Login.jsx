import { useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

// login api url, this is given in the assessment doc
const LOGIN_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/auth/signin';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // this runs every time sign in is clicked
  // even if email/password are empty we still hit the api and let it
  // tell us if something is wrong
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // api sends back a message field when something is wrong
        setError(data.message || 'Invalid email or password');
        return;
      }

      // token is nested in data.data, a little weird but thats the api for you
      const token = data.data.token;
      Cookies.set('jwt_token', token);
      navigate('/');
    } catch (err) {
      console.log(err);
      setError('Something went wrong, please try again');
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1 className="auth-card__brand">Go Business</h1>
        <p className="auth-card__tagline">Sign in to open your referral dashboard.</p>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? (
            <p className="auth-form__error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" className="auth-form__submit">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
