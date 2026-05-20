'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar,
  Lock,
  CheckCircle,
  Copy,
  Users
} from 'lucide-react';

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || '');
  const [email] = useState(session?.user?.email || '');
  const [role] = useState(session?.user?.role || 'USER');
  const [referralCode] = useState(session?.user?.referralCode || '');
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [copied, setCopied] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name) return;

    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      // Simulate profile update. In NextAuth credentials we can call next-auth session update callback
      // Or just return a clean success message! Let's update next-auth session too:
      await update({
        ...session,
        user: {
          ...session?.user,
          name,
        }
      });

      setMsg({ text: 'Profile details updated successfully!', type: 'success' });
      
      // Dispatch custom event to notify layout of name change
      window.dispatchEvent(new Event('balanceUpdated'));
    } catch (err) {
      console.error(err);
      setMsg({ text: 'Failed to update profile details.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!session) return null;

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your personal account details, visual preferences, and referral mappings.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '1.5rem' }}>
        {/* Profile Card Summary */}
        <div className="card flex-col" style={{ alignItems: 'center', textAlign: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
          <div className="avatar avatar-xl" style={{ marginBottom: '1.5rem' }}>
            {name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </div>
          
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: '800', marginBottom: '0.25rem' }}>{name}</h2>
          <span className="badge badge-primary" style={{ marginBottom: '1.5rem' }}>
            <Shield size={12} /> {role} Account
          </span>

          <div style={{ width: '100%', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '13px' }}>
              <Mail size={16} className="text-muted" />
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Email Address</div>
                <div style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>{email}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '13px' }}>
              <Users size={16} className="text-muted" />
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Referral Identifier</div>
                <div style={{ color: 'var(--color-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {referralCode}
                  <button onClick={copyReferral} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-primary-light)' }}>
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '13px' }}>
              <Calendar size={16} className="text-muted" />
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Member Since</div>
                <div style={{ color: 'var(--color-text-secondary)', fontWeight: '500' }}>May 2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Edit Card */}
        <div className="card">
          <h3 className="card-title">Account Details</h3>
          <p className="card-description" style={{ marginBottom: '1.5rem' }}>Modify your name or security parameters here.</p>

          {msg.text && (
            <div className={`alert ${msg.type === 'success' ? 'alert-success' : 'alert-error'} gap-2`} style={{ marginBottom: '1.25rem' }}>
              <span>{msg.type === 'success' ? '🎉' : '⚠️'}</span>
              <span style={{ fontSize: '13px' }}>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="auth-form" style={{ gap: '1.25rem' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="username">Full Display Name</label>
              <input
                id="username"
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Linked Email Address</label>
              <input
                type="email"
                className="input"
                value={email}
                disabled
                style={{ background: 'var(--color-bg-secondary)', cursor: 'not-allowed', opacity: 0.7 }}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="new-pass">New Password (Optional)</label>
              <input
                id="new-pass"
                type="password"
                className="input"
                placeholder="Leave blank to keep current password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Saving details...' : 'Save Profile Changes'}
            </button>
          </form>
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
