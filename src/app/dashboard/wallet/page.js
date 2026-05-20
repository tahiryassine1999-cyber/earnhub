'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Send,
  HelpCircle
} from 'lucide-react';

export default function WalletPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [walletInfo, setWalletInfo] = useState({
    balance: 0.00,
    totalEarned: 0.00,
    transactions: [],
  });
  const [withdrawals, setWithdrawals] = useState([]);
  
  // Withdrawal Form State
  const [method, setMethod] = useState('PAYPAL');
  const [amount, setAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState({ text: '', type: '' });
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchWalletDetails = async () => {
    try {
      setLoading(true);
      // Fetch wallet & transactions
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setWalletInfo(data);
      }

      // Fetch withdrawal requests
      const wRes = await fetch('/api/withdraw');
      if (wRes.ok) {
        const wData = await wRes.json();
        setWithdrawals(wData.withdrawals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || !paymentDetails) {
      setWithdrawMsg({ text: 'Please fill in all fields', type: 'error' });
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setWithdrawMsg({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }

    if (val > walletInfo.balance) {
      setWithdrawMsg({ text: 'Insufficient balance available', type: 'error' });
      return;
    }

    setWithdrawLoading(true);
    setWithdrawMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: val,
          method,
          paymentDetails,
        })
      });

      const data = await res.json();

      if (res.ok) {
        setWithdrawMsg({ text: 'Withdrawal request submitted successfully! Pending administrator review.', type: 'success' });
        setAmount('');
        setPaymentDetails('');
        
        // Refresh wallet & balance displays
        fetchWalletDetails();
        
        // Notify sidebar/layout of balance update
        window.dispatchEvent(new Event('balanceUpdated'));
      } else {
        setWithdrawMsg({ text: data.error || 'Failed to submit request', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setWithdrawMsg({ text: 'An unexpected error occurred.', type: 'error' });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Wallet &amp; Payouts</h1>
        <p className="page-subtitle">Manage your funds, submit cashout requests, and monitor your full earning ledger.</p>
      </div>

      {/* Grid: Balance Card & Payout request form */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Balance Display */}
        <div className="wallet-balance-card">
          <div className="wallet-balance-label">Audited Wallet Balance</div>
          <div className="wallet-balance-value">${walletInfo.balance.toFixed(2)}</div>
          <div className="wallet-balance-sub">Lifetime Earned: ${walletInfo.totalEarned.toFixed(2)}</div>
          
          <div style={{ marginTop: '2.5rem', background: 'rgba(0,0,0,0.15)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <HelpCircle size={14} /> Payout Details
            </h4>
            <p style={{ fontSize: '11px', opacity: '0.8', lineHeight: '1.5' }}>
              All withdrawal requests are processed by administrators within 24 hours. Minimum payout is $5.00. No fee applied.
            </p>
          </div>
        </div>

        {/* Withdrawal Form Card */}
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpRight size={18} className="text-primary" /> Request Withdrawal
          </h3>
          <p className="card-description" style={{ marginBottom: '1.5rem' }}>Deduct from your balance to cash out via PayPal, Crypto, or Gift Cards.</p>

          {withdrawMsg.text && (
            <div className={`alert ${withdrawMsg.type === 'success' ? 'alert-success' : 'alert-error'} gap-2`} style={{ marginBottom: '1.25rem' }}>
              <span>{withdrawMsg.type === 'success' ? '🎉' : '⚠️'}</span>
              <span style={{ fontSize: '13px' }}>{withdrawMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="auth-form" style={{ gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Select Method</label>
                <select 
                  className="input" 
                  value={method} 
                  onChange={(e) => setMethod(e.target.value)}
                  disabled={withdrawLoading}
                >
                  <option value="PAYPAL">PayPal Transfer</option>
                  <option value="CRYPTO">Crypto Wallet (BTC/LTC)</option>
                  <option value="GIFTCARD">Gift Card (Amazon/Steam)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="5.00"
                  className="input"
                  placeholder="Min $5.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={withdrawLoading}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">
                {method === 'PAYPAL' ? 'PayPal Email Address' : 
                 method === 'CRYPTO' ? 'Destination Crypto Wallet Address' : 
                 'Amazon/Steam Email Delivery Address'}
              </label>
              <input
                type="text"
                className="input"
                placeholder={
                  method === 'PAYPAL' ? 'paypal-recipient@example.com' : 
                  method === 'CRYPTO' ? 'e.g. 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' : 
                  'giftcards@yourdomain.com'
                }
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                disabled={withdrawLoading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={withdrawLoading}
            >
              {withdrawLoading ? 'Submitting request...' : <><Send size={14} /> Submit Withdrawal Request</>}
            </button>
          </form>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        {/* Withdrawal History */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Withdrawal Requests</h3>
          </div>

          {withdrawals.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p className="empty-state-text">No withdrawals requested yet.</p>
            </div>
          ) : (
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => {
                    let badgeClass = 'badge-warning';
                    let statusIcon = <Clock size={12} />;
                    if (w.status === 'COMPLETED' || w.status === 'APPROVED') {
                      badgeClass = 'badge-success';
                      statusIcon = <CheckCircle2 size={12} />;
                    }
                    if (w.status === 'REJECTED') {
                      badgeClass = 'badge-danger';
                      statusIcon = <XCircle size={12} />;
                    }

                    return (
                      <tr key={w.id}>
                        <td style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                          {w.method}
                        </td>
                        <td style={{ fontWeight: '700' }}>
                          ${w.amount.toFixed(2)}
                        </td>
                        <td>
                          <span className={`badge ${badgeClass}`}>
                            {statusIcon} {w.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Earning Transactions Ledger */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Earning &amp; Ledger History</h3>
          </div>

          {walletInfo.transactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p className="empty-state-text">No transactions logged yet.</p>
            </div>
          ) : (
            <div className="table-container" style={{ marginTop: '1rem' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {walletInfo.transactions.map((t) => {
                    let badgeClass = 'badge-muted';
                    if (t.type === 'SURVEY_REWARD') badgeClass = 'badge-success';
                    if (t.type === 'OFFER_REWARD') badgeClass = 'badge-info';
                    if (t.type === 'REFERRAL_BONUS') badgeClass = 'badge-purple';
                    if (t.type === 'DAILY_BONUS') badgeClass = 'badge-primary';
                    if (t.type === 'WITHDRAWAL') badgeClass = 'badge-danger';
                    if (t.type === 'ADMIN_ADJUSTMENT') badgeClass = 'badge-warning';

                    return (
                      <tr key={t.id}>
                        <td style={{ fontWeight: '500', color: 'var(--color-text)' }}>{t.description}</td>
                        <td>
                          <span className={`badge ${badgeClass}`}>
                            {t.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px' }}>{formatDate(t.createdAt)}</td>
                        <td style={{ 
                          fontWeight: '700', 
                          color: t.amount > 0 ? 'var(--color-primary)' : 'var(--color-danger)'
                        }}>
                          {t.amount > 0 ? '+' : ''}${t.amount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
