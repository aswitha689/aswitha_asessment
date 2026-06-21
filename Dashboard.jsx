import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const REFERRALS_URL = 'https://v9fes04dwf.execute-api.eu-north-1.amazonaws.com/api/referrals';
const PAGE_SIZE = 10;

// turns something like 2024-01-05 into 2024/01/05
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

// turns a plain number into a dollar amount with no cents
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

export default function Dashboard() {
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // can be loading, ready, or error
  const [errorMsg, setErrorMsg] = useState('');

  const [metrics, setMetrics] = useState([]);
  const [serviceSummary, setServiceSummary] = useState(null);
  const [referral, setReferral] = useState(null);
  const [referrals, setReferrals] = useState([]);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [page, setPage] = useState(1);
  const [copiedField, setCopiedField] = useState('');

  const timerRef = useRef(null);

  // grabs the referrals list (and the overview/summary stuff that comes
  // with it) from the api. search and sort get added as query params
  function loadData(searchValue, sortValue) {
    const token = Cookies.get('jwt_token');

    let url = REFERRALS_URL + '?sort=' + sortValue;
    if (searchValue) {
      url = url + '&search=' + searchValue;
    }

    fetch(url, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    })
      .then((res) => {
        if (!res.ok) {
          // try to grab the error message from the response body
          return res.json().then((body) => {
            const err = new Error(body.message || 'Something went wrong. Please try again.');
            err.status = res.status;
            throw err;
          });
        }
        return res.json();
      })
      .then((json) => {
        // the actual data is nested inside a "data" key
        const data = json.data || json;
        setMetrics(data.metrics || []);
        setServiceSummary(data.serviceSummary || null);
        setReferral(data.referral || null);
        setReferrals(data.referrals || []);
        setStatus('ready');
      })
      .catch((err) => {
        let msg = err.message;
        if (err.status) {
          msg = msg + ' (' + err.status + ')';
        }
        setErrorMsg(msg);
        setStatus('error');
      });
  }

  // load everything once when the page first opens
  useEffect(() => {
    loadData('', 'desc');
  }, []);

  // when the search box changes, wait a bit before calling the api so we
  // are not sending a request on literally every keystroke
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setPage(1);
      loadData(search, sort);
    }, 300);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function handleSortChange(e) {
    const newSort = e.target.value;
    setSort(newSort);
    setPage(1);
    loadData(search, newSort);
  }

  function handleCopy(field, value) {
    navigator.clipboard.writeText(value || '').then(() => {
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField('');
      }, 1500);
    });
  }

  // pagination math, 10 rows per page
  const totalEntries = referrals.length;
  let totalPages = Math.ceil(totalEntries / PAGE_SIZE);
  if (totalPages < 1) {
    totalPages = 1;
  }
  let currentPage = page;
  if (currentPage > totalPages) {
    currentPage = totalPages;
  }
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageRows = referrals.slice(startIndex, startIndex + PAGE_SIZE);
  const rangeFrom = totalEntries === 0 ? 0 : startIndex + 1;
  const rangeTo = Math.min(startIndex + PAGE_SIZE, totalEntries);

  function goToPage(num) {
    if (num < 1) {
      num = 1;
    }
    if (num > totalPages) {
      num = totalPages;
    }
    setPage(num);
  }

  return (
    <div className="page">
      <Navbar />

      <main className="dashboard">
        <header className="dashboard__header">
          <h1>Referral Dashboard</h1>
          <p className="dashboard__subtitle">
            Track your referrals, earnings, and partner activity in one place.
          </p>
        </header>

        {status === 'loading' ? (
          <p className="state state--loading">Loading your dashboard…</p>
        ) : null}

        {status === 'error' ? (
          <p className="state state--error" role="alert">
            {errorMsg}
          </p>
        ) : null}

        {status === 'ready' ? (
          <>
            <section className="card" role="region" aria-label="Overview metrics">
              <h2 className="section-title">Overview</h2>
              <div className="metric-grid">
                {metrics.map((metric, index) => (
                  <div className="metric-cell" key={metric.id ?? index}>
                    <span className="metric-cell__icon">↗</span>
                    <span className="metric-cell__value">{metric.value}</span>
                    <span className="metric-cell__label">{metric.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card" aria-label="Service summary">
              <h2 className="section-title">Service summary</h2>
              <div className="summary-grid">
                <div className="summary-cell">
                  <span className="summary-cell__label">Service</span>
                  <span className="summary-cell__value summary-cell__value--accent">
                    {serviceSummary?.service ?? '—'}
                  </span>
                </div>
                <div className="summary-cell">
                  <span className="summary-cell__label">Your Referrals</span>
                  <span className="summary-cell__value">{serviceSummary?.yourReferrals ?? '—'}</span>
                </div>
                <div className="summary-cell">
                  <span className="summary-cell__label">Active Referrals</span>
                  <span className="summary-cell__value">{serviceSummary?.activeReferrals ?? '—'}</span>
                </div>
                <div className="summary-cell">
                  <span className="summary-cell__label">Total Ref. Earnings</span>
                  <span className="summary-cell__value">{serviceSummary?.totalRefEarnings ?? '—'}</span>
                </div>
              </div>
            </section>

            <section className="card" aria-label="Share referral">
              <h2 className="panel__title">Refer friends and earn more</h2>

              <div className="share-grid">
                <div className="share-field">
                  <label htmlFor="referral-link">Your Referral Link</label>
                  <div className="share-field__row">
                    <input id="referral-link" type="text" readOnly value={referral?.link ?? ''} />
                    <button type="button" onClick={() => handleCopy('link', referral?.link)}>
                      {copiedField === 'link' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="share-field">
                  <label htmlFor="referral-code">Your Referral Code</label>
                  <div className="share-field__row">
                    <input id="referral-code" type="text" readOnly value={referral?.code ?? ''} />
                    <button type="button" onClick={() => handleCopy('code', referral?.code)}>
                      {copiedField === 'code' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="card">
              <div className="table-panel__header">
                <h2 className="section-title">All referrals</h2>

                <div className="table-panel__controls">
                  <div className="control">
                    <label htmlFor="referral-search">Search</label>
                    <input
                      id="referral-search"
                      type="text"
                      placeholder="Name or service…"
                      aria-label="Search referrals"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="control">
                    <label htmlFor="referral-sort">Sort by date</label>
                    <select id="referral-sort" value={sort} onChange={handleSortChange}>
                      <option value="desc">Newest first</option>
                      <option value="asc">Oldest first</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Service</th>
                      <th scope="col">Date</th>
                      <th scope="col">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="empty-state">
                          No matching entries
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((row) => (
                        <tr
                          key={row.id}
                          tabIndex={0}
                          role="button"
                          className="table-row"
                          onClick={() => navigate(`/referral/${row.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(`/referral/${row.id}`);
                            }
                          }}
                        >
                          <td>{row.name}</td>
                          <td>{row.serviceName}</td>
                          <td>{formatDate(row.date)}</td>
                          <td className="profit-cell">{formatCurrency(row.profit)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-panel__footer">
                <p className="table-panel__summary">
                  Showing {rangeFrom}–{rangeTo} of {totalEntries} entries
                </p>

                {totalPages > 1 ? (
                  <nav className="pagination" aria-label="Referrals pagination">
                    <button
                      type="button"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        className={
                          pageNumber === currentPage ? 'pagination__page is-active' : 'pagination__page'
                        }
                        aria-current={pageNumber === currentPage ? 'page' : undefined}
                        onClick={() => goToPage(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </nav>
                ) : null}
              </div>
            </section>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
