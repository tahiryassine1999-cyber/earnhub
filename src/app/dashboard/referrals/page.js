'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Copy, 
  Check, 
  HelpCircle, 
  Share2, 
  Gift, 
  DollarSign 
} from 'lucide-react';

export default function ReferralsPage() {
  const { data: session } = useSession();
  const [refData, setRefData] = useState({
    referralCode: '',
    totalInvited: 0,
    totalReferralEarnings: 0,
    referredUsers: [],
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReferralDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/referrals');
      if (res.ok) {
        const data = await res.json();
        setRefData(data);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchReferralDetails();
    }
  }, [session]);

  const getReferralUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/register?ref=${refData.referralCode}`;
    }
    return `https://earnhub.com/register?ref=${refData.referralCode}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getReferralUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="animate-spin empty-state-icon">🟢</div>
        <div className="empty-state-title">Loading Referrals</div>
        <div className="empty-state-text">Fetching your inviter details...</div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Referral Program</h1>
        <p className="page-subtitle">Invite friends to EarnHub and receive a $1.00 welcome bonus for both you and your referee.</p>
      </div>

      {/* Grid: referral link generator & rules */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Referral Link Copy Box */}
        <div className="card referral-link-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={18} className="text-primary" /> Share Referral Link
            </h3>
            <p className="card-description" style={{ marginTop: '0.5rem' }}>
              Copy the unique referral URL below and share it with your friends via Twitter, Discord, WhatsApp, or email.
            </p>

            <div className="referral-link-input" style={{ marginTop: '1.5rem' }}>
              <input
                type="text"
                className="input"
                value={getReferralUrl()}
                readOnly
                style={{ background: 'var(--color-bg-secondary)', borderStyle: 'dashed' }}
              />
              <button onClick={copyToClipboard} className="btn btn-primary">
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="stat-icon stat-icon-primary" style={{ margin: 0, width: '40px', height: '40px' }}>
                <Users size={16} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800' }}>{refData.totalInvited}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Friends Invited</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="stat-icon stat-icon-purple" style={{ margin: 0, width: '40px', height: '40px' }}>
                <DollarSign size={16} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: '800' }}>${refData.totalReferralEarnings.toFixed(2)}</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Referral Commissions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Earning Commission Rules */}
        <div className="card">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gift size={18} className="text-warning" /> Earning Rules
          </h3>
          <p className="card-description" style={{ marginBottom: '1rem' }}>Earn commissions from every invited friend.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '13px' }}>
              <strong style={{ color: 'var(--color-primary)' }}>+$1.00 Payout</strong>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                You get $1.00 immediately for every friend who signs up with your link.
              </p>
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '13px' }}>
              <strong style={{ color: 'var(--color-info)' }}>+$1.00 Welcome Gift</strong>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Your friend gets $1.00 in their balance right away as a signup bonus!
              </p>
            </div>

            <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(139, 92, 246, 0.2)', fontSize: '13px' }}>
              <strong style={{ color: 'var(--color-purple)' }}>Unlimited Friends</strong>
              <p style={{ color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                There is no limit to the number of friends you can refer. Share with everyone!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referred Users List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Invited Friends</h3>
        </div>

        {refData.referredUsers.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p className="empty-state-text">You haven&apos;t invited anyone yet. Copy your referral link to get started!</p>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: '1rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Friend Name</th>
                  <th>Joined Date</th>
                  <th>Inviter Bonus</th>
                  <th>Referee Total Earned</th>
                </tr>
              </thead>
              <tbody>
                {refData.referredUsers.map((ref) => (
                  <tr key={ref.id}>
                    <td style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                      {ref.name}
                    </td>
                    <td>
                      {formatDate(ref.joinedAt)}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--color-primary)' }}>
                      +${ref.bonusAmount.toFixed(2)}
                    </td>
                    <td>
                      ${ref.refereeTotalEarned.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
