'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { 
  TrendingUp, 
  ClipboardList, 
  Gift, 
  Wallet, 
  Users, 
  Award,
  Zap,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletInfo, setWalletInfo] = useState({
    balance: 0.00,
    totalEarned: 0.00,
    lastDailyBonus: null,
    transactions: [],
  });
  const [stats, setStats] = useState({
    surveysDone: 0,
    offersDone: 0,
    referralsCount: 0,
  });
  const [dailyBonusLoading, setDailyBonusLoading] = useState(false);
  const [dailyBonusMsg, setDailyBonusMsg] = useState({ text: '', type: '' });

  // Safety mount check for Recharts SSR hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch wallet info
      const walletRes = await fetch('/api/wallet');
      if (walletRes.ok) {
        const walletData = await walletRes.json();
        setWalletInfo(walletData);

        // Calculate counts from transactions
        const surveysDone = walletData.transactions.filter(t => t.type === 'SURVEY_REWARD').length;
        const offersDone = walletData.transactions.filter(t => t.type === 'OFFER_REWARD').length;
        
        // Fetch referrals count
        const refRes = await fetch('/api/referrals');
        let referralsCount = 0;
        if (refRes.ok) {
          const refData = await refRes.json();
          referralsCount = refData.totalInvited;
        }

        setStats({
          surveysDone,
          offersDone,
          referralsCount,
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const claimDailyBonus = async () => {
    setDailyBonusLoading(true);
    setDailyBonusMsg({ text: '', type: '' });

    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        setDailyBonusMsg({ text: data.error || 'Failed to claim daily bonus', type: 'error' });
      } else {
        setDailyBonusMsg({ text: `Success! Claimed $${data.earned.toFixed(2)} daily login bonus!`, type: 'success' });
        
        // Refresh dashboard data
        fetchDashboardData();
        
        // Dispatch global balance updated event
        window.dispatchEvent(new Event('balanceUpdated'));
      }
    } catch (err) {
      console.error(err);
      setDailyBonusMsg({ text: 'An error occurred while claiming bonus.', type: 'error' });
    } finally {
      setDailyBonusLoading(false);
    }
  };

  // Generate 7-day trend chart data based on user transactions
  const getChartData = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push({
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rawDate: d.toDateString(),
        amount: 0,
      });
    }

    // Accumulate transactions for each day
    walletInfo.transactions.forEach(t => {
      if (t.amount > 0) {
        const tDate = new Date(t.createdAt).toDateString();
        const found = dates.find(d => d.rawDate === tDate);
        if (found) {
          found.amount += t.amount;
        }
      }
    });

    return dates;
  };

  const chartData = getChartData();

  // Helper to format date
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isDailyBonusClaimable = () => {
    if (!walletInfo.lastDailyBonus) return true;
    const timeDiff = new Date().getTime() - new Date(walletInfo.lastDailyBonus).getTime();
    return timeDiff >= 24 * 60 * 60 * 1000;
  };

  if (loading && walletInfo.transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="animate-spin empty-state-icon">🟢</div>
        <div className="empty-state-title">Loading Account Stats</div>
        <div className="empty-state-text">Fetching details from the secure ledger...</div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Page Header */}
      <div className="page-header flex-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Track your earnings, complete tasks, and manage withdrawals.</p>
        </div>
        <div className="page-actions">
          <Link href="/dashboard/surveys" className="btn btn-primary">
            <ClipboardList size={16} /> Earn with Surveys
          </Link>
          <Link href="/dashboard/offers" className="btn btn-outline">
            <Gift size={16} /> Complete Offers
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {/* Balance Card */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary">💰</div>
          <div className="stat-value">${walletInfo.balance.toFixed(2)}</div>
          <div className="stat-label">Current Balance</div>
          <div className="stat-change stat-change-up">
            <Link href="/dashboard/wallet" style={{ fontSize: '11px', display: 'flex', alignItems: 'center' }}>
              Cashout Panel <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Total Earned Card */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-info">📈</div>
          <div className="stat-value">${walletInfo.totalEarned.toFixed(2)}</div>
          <div className="stat-label">Lifetime Payouts</div>
          <div className="stat-change stat-change-up">
            <TrendingUp size={12} /> Live Ledger Audited
          </div>
        </div>

        {/* Surveys Card */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-warning">📋</div>
          <div className="stat-value">{stats.surveysDone}</div>
          <div className="stat-label">Surveys Completed</div>
          <div className="stat-change stat-change-up">
            <Link href="/dashboard/surveys" style={{ fontSize: '11px', display: 'flex', alignItems: 'center' }}>
              Take more surveys <ChevronRight size={12} />
            </Link>
          </div>
        </div>

        {/* Offers Card */}
        <div className="stat-card">
          <div className="stat-icon stat-icon-purple">🎁</div>
          <div className="stat-value">{stats.offersDone}</div>
          <div className="stat-label">Offers Completed</div>
          <div className="stat-change stat-change-up">
            <Link href="/dashboard/offers" style={{ fontSize: '11px', display: 'flex', alignItems: 'center' }}>
              Explore offerwalls <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Analytics/Trend Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Earnings Trend</h3>
              <p className="card-description">Your earnings summary over the last 7 days</p>
            </div>
            <span className="badge badge-primary">7-Day View</span>
          </div>

          <div style={{ width: '100%', height: '240px', marginTop: '1.5rem' }}>
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="dateStr" stroke="var(--color-text-muted)" fontSize={11} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={11} tickFormatter={(v) => `$${v}`} />
                  <ChartTooltip 
                    contentStyle={{ 
                      background: 'var(--color-bg-card-solid)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-text)'
                    }} 
                    formatter={(v) => [`$${v.toFixed(2)}`, 'Earned']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="skeleton skeleton-card" style={{ height: '100%' }}></div>
            )}
          </div>
        </div>

        {/* Daily Claim Box */}
        <div className="card flex-col" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <h3 className="card-title">Daily Bonus</h3>
              <Calendar size={18} className="text-muted" />
            </div>
            <p className="card-description" style={{ marginTop: '0.5rem' }}>
              Log in daily to claim your free currency reward! Keep your streak active to earn higher bonuses.
            </p>

            {dailyBonusMsg.text && (
              <div className={`alert ${dailyBonusMsg.type === 'success' ? 'alert-success' : 'alert-error'} gap-2`} style={{ marginTop: '1rem' }}>
                <span>{dailyBonusMsg.type === 'success' ? '🎉' : '⚠️'}</span>
                <span style={{ fontSize: '13px' }}>{dailyBonusMsg.text}</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎁</div>
            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '1rem' }}>
              +$0.05 USD / Day
            </div>
            
            <button
              onClick={claimDailyBonus}
              disabled={dailyBonusLoading || !isDailyBonusClaimable()}
              className={`btn ${isDailyBonusClaimable() ? 'btn-primary' : 'btn-secondary'}`}
              style={{ width: '100%' }}
            >
              {dailyBonusLoading ? 'Claiming...' : isDailyBonusClaimable() ? 'Claim Free Reward' : 'Claimed Today'}
            </button>

            {!isDailyBonusClaimable() && (
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Streaks reset if you miss a day. Come back tomorrow!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
          <Link href="/dashboard/wallet" className="landing-nav-link" style={{ fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center' }}>
            View Full History <ChevronRight size={14} />
          </Link>
        </div>

        {walletInfo.transactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p className="empty-state-text">No activity recorded yet. Start taking surveys to earn!</p>
          </div>
        ) : (
          <div className="table-container animate-fade-in" style={{ marginTop: '1rem' }}>
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
                {walletInfo.transactions.slice(0, 5).map((t) => {
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
                      <td>{formatDate(t.createdAt)}</td>
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

      {/* responsive grid fix */}
      <style jsx>{`
        @media (max-width: 1024px) {
          .grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .grid-4 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
