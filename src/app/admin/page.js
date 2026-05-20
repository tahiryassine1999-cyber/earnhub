'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  ShieldAlert, 
  Users, 
  ClipboardList, 
  Wallet,
  CheckCircle,
  XCircle,
  PlusCircle,
  Coins,
  Ban,
  UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [adminData, setAdminData] = useState({
    stats: {
      totalUsers: 0,
      totalEarned: 0,
      activeSurveys: 0,
      pendingWithdrawalsCount: 0,
      pendingWithdrawalsSum: 0,
    },
    users: [],
    withdrawals: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('withdrawals');

  // Adjust Balance modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  // Reject Withdrawal state
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

  // New Survey Form State
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDesc, setSurveyDesc] = useState('');
  const [surveyReward, setSurveyReward] = useState('');
  const [surveyTime, setSurveyTime] = useState('');
  const [surveyCategory, setSurveyCategory] = useState('Technology');
  const [surveySlots, setSurveySlots] = useState('500');
  const [surveyQuestions, setSurveyQuestions] = useState(
    JSON.stringify([
      { id: 'q1', type: 'choice', title: 'Sample Multiple Choice Question?', options: ['Option A', 'Option B', 'Option C'] },
      { id: 'q2', type: 'text', title: 'Sample Free Response Question?' }
    ], null, 2)
  );
  const [surveyLoading, setSurveyLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin');
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAdminData();
    }
  }, [session]);

  const handleWithdrawalAction = async (withdrawalId, action, adminNote = '') => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          withdrawalId,
          adminNote,
        })
      });

      if (res.ok) {
        alert(`Withdrawal request successfully ${action === 'approve_withdrawal' ? 'completed' : 'rejected'}!`);
        fetchAdminData();
        
        // Notify dynamic balance updates in layout
        window.dispatchEvent(new Event('balanceUpdated'));
      } else {
        const d = await res.json();
        alert('Action failed: ' + d.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBanToggle = async (userId, isBanned) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isBanned ? 'unban_user' : 'ban_user',
          userId,
        })
      });

      if (res.ok) {
        alert(`User successfully ${isBanned ? 'unbanned' : 'suspended'}!`);
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    if (!selectedUser || !adjustAmount) return;
    setAdjustLoading(true);

    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'adjust_balance',
          userId: selectedUser.id,
          amount: parseFloat(adjustAmount),
          description: adjustReason || 'Platform administrative balance adjustment',
        })
      });

      if (res.ok) {
        alert('User balance adjusted successfully!');
        setSelectedUser(null);
        setAdjustAmount('');
        setAdjustReason('');
        fetchAdminData();
        
        // Update balance dynamic display
        window.dispatchEvent(new Event('balanceUpdated'));
      } else {
        const d = await res.json();
        alert('Failed to adjust: ' + d.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleCreateSurvey = async (e) => {
    e.preventDefault();
    if (!surveyTitle || !surveyDesc || !surveyReward || !surveyTime) return;
    setSurveyLoading(true);

    try {
      let parsedQuestions;
      try {
        parsedQuestions = JSON.parse(surveyQuestions);
      } catch (err) {
        alert('Invalid JSON formatting in survey questions!');
        setSurveyLoading(false);
        return;
      }

      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_survey',
          title: surveyTitle,
          description: surveyDesc,
          reward: parseFloat(surveyReward),
          timeMinutes: parseInt(surveyTime),
          category: surveyCategory,
          totalSlots: parseInt(surveySlots),
          questions: parsedQuestions,
        })
      });

      if (res.ok) {
        alert('New Market Research Survey created successfully!');
        setSurveyTitle('');
        setSurveyDesc('');
        setSurveyReward('');
        setSurveyTime('');
        setSurveySlots('500');
        fetchAdminData();
      } else {
        const d = await res.json();
        alert('Failed to create: ' + d.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSurveyLoading(false);
    }
  };

  const submitRejection = (e) => {
    e.preventDefault();
    handleWithdrawalAction(rejectId, 'reject_withdrawal', rejectReason);
    setRejectId(null);
    setRejectReason('');
  };

  if (loading && adminData.users.length === 0) {
    return (
      <div className="empty-state">
        <div className="animate-spin empty-state-icon">🛡️</div>
        <div className="empty-state-title">Loading Administrative Settings</div>
        <div className="empty-state-text">Fetching platform logs from SQLite database...</div>
      </div>
    );
  }

  const pendingWithdrawals = adminData.withdrawals.filter(w => w.status === 'PENDING');
  const processedWithdrawals = adminData.withdrawals.filter(w => w.status !== 'PENDING');

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={28} className="text-primary" /> Admin Control Center
        </h1>
        <p className="page-subtitle">Platform oversight: approve transactions, suspend accounts, and publish surveys.</p>
      </div>

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><Users size={20} /></div>
          <div className="stat-value">{adminData.stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-info"><Coins size={20} /></div>
          <div className="stat-value">${adminData.stats.totalEarned.toFixed(2)}</div>
          <div className="stat-label">Platform Paid Out</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-warning"><ClipboardList size={20} /></div>
          <div className="stat-value">{adminData.stats.activeSurveys}</div>
          <div className="stat-label">Active Surveys</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon-purple"><Wallet size={20} /></div>
          <div className="stat-value">${adminData.stats.pendingWithdrawalsSum.toFixed(2)}</div>
          <div className="stat-label">Pending Payouts ({adminData.stats.pendingWithdrawalsCount})</div>
        </div>
      </div>

      {/* Tab Panel */}
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('withdrawals')}
          className={`tab ${activeTab === 'withdrawals' ? 'tab-active' : ''}`}
        >
          Withdrawal Requests ({pendingWithdrawals.length})
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
        >
          User Accounts
        </button>
        <button 
          onClick={() => setActiveTab('surveys')}
          className={`tab ${activeTab === 'surveys' ? 'tab-active' : ''}`}
        >
          Survey Publisher
        </button>
      </div>

      {/* TABS INNER */}
      {activeTab === 'withdrawals' && (
        <div className="grid-2" style={{ gridTemplateColumns: '1.6fr 1.4fr', alignItems: 'start' }}>
          {/* Pending table */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Pending Cashouts</h3>
            {pendingWithdrawals.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p className="empty-state-text">No pending withdrawals requests to review.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Method</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWithdrawals.map(w => (
                      <tr key={w.id}>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>{w.user.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{w.paymentDetails}</div>
                        </td>
                        <td>{w.method}</td>
                        <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>${w.amount.toFixed(2)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button 
                              onClick={() => handleWithdrawalAction(w.id, 'approve_withdrawal')}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '4px 8px' }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => setRejectId(w.id)}
                              className="btn btn-danger btn-sm"
                              style={{ padding: '4px 8px' }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Processed table */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Processed History</h3>
            {processedWithdrawals.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <p className="empty-state-text">No completed payouts recorded.</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedWithdrawals.slice(0, 10).map(w => (
                      <tr key={w.id}>
                        <td>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>{w.user.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{w.method}</div>
                        </td>
                        <td style={{ fontWeight: '700' }}>${w.amount.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${w.status === 'COMPLETED' ? 'badge-success' : 'badge-danger'}`}>
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>User Mappings &amp; Adjustments</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Display Name</th>
                  <th>Joined</th>
                  <th>Balance</th>
                  <th>Auditing Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminData.users.map(u => (
                  <tr key={u.id} style={{ opacity: u.banned ? 0.6 : 1 }}>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--color-text)' }}>{u.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{u.email}</div>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>${u.balance.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${u.banned ? 'badge-danger' : u.role === 'ADMIN' ? 'badge-purple' : 'badge-success'}`}>
                        {u.banned ? 'SUSPENDED' : u.role}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => setSelectedUser(u)}
                          className="btn btn-secondary btn-sm"
                          style={{ gap: '0.25rem' }}
                        >
                          <Coins size={12} /> Adjust Cash
                        </button>

                        <button 
                          onClick={() => handleBanToggle(u.id, u.banned)}
                          className={`btn ${u.banned ? 'btn-outline' : 'btn-danger'} btn-sm`}
                          style={{ gap: '0.25rem', borderColor: u.banned ? 'var(--color-primary)' : undefined, color: u.banned ? 'var(--color-primary)' : undefined }}
                        >
                          {u.banned ? <UserCheck size={12} /> : <Ban size={12} />}
                          {u.banned ? 'Unban' : 'Suspend'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'surveys' && (
        <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1.6fr', alignItems: 'start' }}>
          {/* Create survey form */}
          <div className="card">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <PlusCircle size={18} className="text-primary" /> Publish New Study
            </h3>
            
            <form onSubmit={handleCreateSurvey} className="auth-form" style={{ gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Survey Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Consumer Coffee Habits 2026"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  disabled={surveyLoading}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Short Description</label>
                <textarea
                  className="input"
                  placeholder="Summarize instructions and target demographics..."
                  value={surveyDesc}
                  onChange={(e) => setSurveyDesc(e.target.value)}
                  disabled={surveyLoading}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Reward Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input"
                    placeholder="e.g. 1.50"
                    value={surveyReward}
                    onChange={(e) => setSurveyReward(e.target.value)}
                    disabled={surveyLoading}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Estimated Time (Min)</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    placeholder="e.g. 10"
                    value={surveyTime}
                    onChange={(e) => setSurveyTime(e.target.value)}
                    disabled={surveyLoading}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select 
                    className="input" 
                    value={surveyCategory} 
                    onChange={(e) => setSurveyCategory(e.target.value)}
                    disabled={surveyLoading}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Food & Beverage">Food &amp; Beverage</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Business">Business</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Target Slots</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={surveySlots}
                    onChange={(e) => setSurveySlots(e.target.value)}
                    disabled={surveyLoading}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Questions Structure (JSON)</label>
                <textarea
                  className="input"
                  style={{ fontFamily: 'monospace', fontSize: '11px', height: '140px' }}
                  value={surveyQuestions}
                  onChange={(e) => setSurveyQuestions(e.target.value)}
                  disabled={surveyLoading}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={surveyLoading}
              >
                {surveyLoading ? 'Publishing survey...' : 'Publish Survey Study'}
              </button>
            </form>
          </div>

          {/* Platform Activity logs */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Dynamic Transaction Logs</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Detail</th>
                    <th>Amt</th>
                  </tr>
                </thead>
                <tbody>
                  {adminData.recentTransactions.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontSize: '12px', fontWeight: '500' }}>{t.user.name}</td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '9px', padding: '1px 6px' }}>
                          {t.type.split('_')[0]}
                        </span>
                      </td>
                      <td style={{ fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                        {t.description}
                      </td>
                      <td style={{ 
                        fontSize: '12px',
                        fontWeight: '700', 
                        color: t.amount > 0 ? 'var(--color-primary)' : 'var(--color-danger)'
                      }}>
                        {t.amount > 0 ? '+' : ''}${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADJUST BALANCE MODAL */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal animate-scale-in">
            <div className="modal-header">
              <h2 className="modal-title">Adjust Ledger Balance</h2>
              <button className="modal-close" onClick={() => setSelectedUser(null)}>
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustBalance} className="auth-form" style={{ marginTop: '1rem' }}>
              <div style={{ background: 'var(--color-bg-input)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1rem', border: '1px solid var(--color-border)', fontSize: '13px' }}>
                User: <strong style={{ color: 'var(--color-primary)' }}>{selectedUser.name}</strong> <br />
                Current Balance: <strong>${selectedUser.balance.toFixed(2)}</strong>
              </div>

              <div className="input-group">
                <label className="input-label">Adjustment Amount (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="e.g. 5.50 (use negative value to deduct)"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  disabled={adjustLoading}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Adjustment Reason / Notes</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Compensated for survey glitch"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  disabled={adjustLoading}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={adjustLoading}
              >
                {adjustLoading ? 'Applying Adjustment...' : 'Apply Ledger Adjustment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REJECT WITHDRAWAL MODAL WITH NOTES */}
      {rejectId && (
        <div className="modal-overlay">
          <div className="modal animate-scale-in">
            <div className="modal-header">
              <h2 className="modal-title">Reject Withdrawal Request</h2>
              <button className="modal-close" onClick={() => setRejectId(null)}>
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={submitRejection} className="auth-form" style={{ marginTop: '1rem' }}>
              <div className="alert alert-warning gap-2" style={{ marginBottom: '1rem', fontSize: '13px' }}>
                <span>⚠️</span>
                <span>Rejecting will instantly refund the user&apos;s requested amount back to their wallet balance.</span>
              </div>

              <div className="input-group">
                <label className="input-label">Reason for Rejection</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Invalid payment email or address provided"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  disabled={rejectLoading}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-danger"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={rejectLoading}
              >
                {rejectLoading ? 'Rejecting request...' : 'Reject &amp; Refund User'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 1024px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          .grid-4 {
            grid-template-columns: repeat(2, 1fr) !important;
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
