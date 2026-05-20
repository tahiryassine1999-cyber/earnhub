'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Gift, 
  Wallet, 
  Users, 
  Award, 
  Settings, 
  ShieldCheck, 
  Menu, 
  X, 
  LogOut, 
  Bell 
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0.00);

  // Fetch real-time balance
  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/wallet');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.balance);
      }
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBalance();
      
      // Event listener for dynamic balance updates
      const handleBalanceUpdate = () => {
        fetchBalance();
      };
      
      window.addEventListener('balanceUpdated', handleBalanceUpdate);
      return () => {
        window.removeEventListener('balanceUpdated', handleBalanceUpdate);
      };
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-spin" style={{ fontSize: '2rem' }}>🟢</div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  if (!session) return null;

  const user = session.user;
  const isAdmin = user.role === 'ADMIN';

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Surveys', href: '/dashboard/surveys', icon: ClipboardList },
    { name: 'Offers & Tasks', href: '/dashboard/offers', icon: Gift },
    { name: 'Wallet & Cashout', href: '/dashboard/wallet', icon: Wallet },
    { name: 'Referrals', href: '/dashboard/referrals', icon: Users },
    { name: 'Leaderboard', href: '/dashboard/leaderboard', icon: Award },
    { name: 'Settings', href: '/dashboard/profile', icon: Settings },
  ];

  return (
    <div className="dashboard-layout animate-fade-in">
      {/* Collapsible Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-sidebar-open' : ''}`} style={{
        transform: mobileMenuOpen ? 'translateX(0)' : undefined
      }}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="landing-logo-icon">🟢</div>
            <span>EarnHub</span>
          </div>
          <button className="mobile-menu-btn" style={{ display: 'flex', marginLeft: 'auto', border: 'none', background: 'none' }} onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">Earning Panel</div>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                >
                  <Icon className="sidebar-link-icon" size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {isAdmin && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">Admin Management</div>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={`sidebar-link ${pathname.startsWith('/admin') ? 'sidebar-link-active' : ''}`}
              >
                <ShieldCheck className="sidebar-link-icon" size={18} />
                <span>Admin Panel</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar avatar-sm">
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-email">{user.email}</div>
            </div>
            <button 
              className="btn btn-ghost btn-icon" 
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Sign Out"
              style={{ padding: '0.25rem' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600' }}>
              Welcome back, <span style={{ color: 'var(--color-primary)' }}>{user.name.split(' ')[0]}</span>!
            </h2>
          </div>

          <div className="topbar-right">
            <div className="topbar-balance">
              <span>💰</span>
              <span>${balance.toFixed(2)}</span>
            </div>
            <div className="topbar-notification">
              <Bell size={18} />
              <span className="topbar-notification-dot"></span>
            </div>
          </div>
        </header>

        <main className="content-area">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay styles */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform var(--transition-base);
          }
          .sidebar.mobile-sidebar-open {
            transform: translateX(0);
          }
          .main-content {
            margin-left: 0;
          }
          .mobile-menu-btn {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
