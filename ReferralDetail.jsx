import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from './Navbar.jsx';
import Footer from '../Footer.jsx';

const REFERRALS_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals';

// same formatting helpers as the dashboard page
// probably should be in a shared file but copy pasting was faster
function formatDate(dateStr) {
  if (!dateStr) {
    return '';
  }
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    return dateStr;
  }
  return parts[0] + '/' + parts[1] + '/' + parts[2];
}

function formatCurrency(num) {
  if (num === null || num === undefined) {
    return '';
  }
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(num);
}

export default function ReferralDetail() {
  const { id } = useParams();
  const [status, setStatus] = useState('loading'); // loading, ready, not-found, or error
  const [errorMsg, setErrorMsg] = useState('');
  const [row, setRow] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus('loading');
    const token = Cookies.get('jwt_token');

    fetch(REFERRALS_URL + '?id=' + id, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            const err = new Error(body.message || 'Something went wrong. Please try again.');
            err.status = res.status;
            throw err;
          });
        }
        return res.json();
      })
      .then((json) => {
        const data = json.data || json;

        // the api is a little inconsistent here - sometimes it gives back
        // the referral row directly, and sometimes it gives back the whole
        // referrals array and we have to find our row in it ourselves
        let found = null;

        if (data && data.name && data.serviceName) {
          // looks like the api just handed us the row itself
          if (data.id === undefined || String(data.id) === String(id)) {
            found = data;
          }
        } else if (data && Array.isArray(data.referrals)) {
          found = data.referrals.find((r) => String(r.id) === String(id));
        }

        if (found) {
          setRow(found);
          setStatus('ready');
        } else {
          setStatus('not-found');
        }
      })
      .catch((err) => {
        let msg = err.message;
        if (err.status) {
          msg = msg + ' (' + err.status + ')';
        }
        setErrorMsg(msg);
        setStatus('error');
      });
  }, [id]);

  return (
    <div className="page">
      <Navbar />

      <main className="detail">
        <Link to="/" className="back-link">
          ← Back to dashboard
        </Link>

        {status === 'loading' ? (
          <p className="state state--loading">Loading referral…</p>
        ) : null}

        {status === 'error' ? (
          <p className="state state--error" role="alert">
            {errorMsg}
          </p>
        ) : null}

        {status === 'not-found' ? (
          <div className="detail__not-found">
            <h1>Referral not found</h1>
          </div>
        ) : null}

        {status === 'ready' && row ? (
          <>
            <h1 className="detail__title">Referral Details</h1>
            <p className="detail__subtitle">Full information for this referral partner.</p>

            <div className="detail-card">
              <div className="detail-card__head">
                <h2 className="detail-card__name">{row.name}</h2>
                <span className="detail-card__badge">{row.serviceName}</span>
              </div>

              <dl className="detail-list">
                <div className="detail-list__row">
                  <dt>Referral ID</dt>
                  <dd>{row.id}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Name</dt>
                  <dd>{row.name}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Service Name</dt>
                  <dd>{row.serviceName}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Date</dt>
                  <dd>{formatDate(row.date)}</dd>
                </div>
                <div className="detail-list__row">
                  <dt>Profit</dt>
                  <dd>{formatCurrency(row.profit)}</dd>
                </div>
              </dl>
            </div>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
