import Login from './Login.jsx';
import Dashboard from './Dashboard.jsx';
import ReferralDetail from './ReferralDetail.jsx';
import NotFound from './NotFound.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicOnlyRoute from './PublicOnlyRoute.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* login page - if already logged in this sends you to the dashboard */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* the dashboard, this is the main page after you log in */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/referral/:id"
          element={
            <ProtectedRoute>
              <ReferralDetail />
            </ProtectedRoute>
          }
        />

        {/* anything else shows the 404 page, no login needed for this one */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
