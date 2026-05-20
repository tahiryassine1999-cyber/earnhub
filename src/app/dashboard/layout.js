'use client';

import { useState, useEffect, useRef } from 'react';
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
  Bell,
  Flame,
  MessageSquare,
  Send
} from 'lucide-react';

const SIMULATED_CHATTERS = [
  { username: 'cpx_guru', badge: 'MODERATOR', badgeClass: 'chat-badge-moderator' },
  { username: 'neon_earner', badge: 'USER', badgeClass: '' },
  { username: 'loot_ninja', badge: 'USER', badgeClass: '' },
  { username: 'spin_champ', badge: 'USER', badgeClass: '' },
  { username: 'ltc_whale', badge: 'USER', badgeClass: '' },
  { username: 'survey_queen', badge: 'USER', badgeClass: '' },
  { username: 'moderator_sam', badge: 'MODERATOR', badgeClass: 'chat-badge-moderator' }
];

const SIMULATED_CHAT_ITEMS = [
  'Wow, Lootably paid me $12.50 for the Monopoly install in under 1 hour!',
  'I qualified for 3 CPX studies in a row today. Super high match rate!',
  'Just cashed out $8.40 in Litecoin! Fast as usual.',
  'Welcome to EarnHub chat! Please follow the rules and happy earning.',
  'Is the daily streak wheel giving double points today?',
  'Yeah, Day 7 rewards are massive!',
  'CPX surveys are popping off right now!',
  'Remember, do not use VPNs or your accounts will get automatically flag-locked.',
  'OMGG! Just landed on the $5.00 sector on the Daily Spin Wheel! Let\'s go!',
  'Try the Raid Shadow Legends task. Hard difficulty but pays $45.50!',
  'Cashed out $15 in LTC, cleared in 15 mins. Fast admins!',
  'Anyone else doing the market survey about gaming headsets? It was so easy.',
  'Check out the Monthly Leaderboard! Top earner gets $250.00 cash.',
  'What is the best offerwall for Android right now?',
  'Lootably for sure, gaming offers pay the highest.',
  'CPX if you want quick opinion surveys.',
  'EarnHub is easily the highest paying GPT right now.'
];

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balance, setBalance] = useState(0.00);

  // Collapsible Live Chat Sidebar states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  
  const chatMessagesEndRef = useRef(null);

  // Seed chat messages on client mount
  useEffect(() => {
    // Generate 6 initial chat items
    const seeded = [];
    for (let i = 0; i < 6; i++) {
      const chatter = SIMULATED_CHATTERS[Math.floor(Math.random() * SIMULATED_CHATTERS.length)];
      const msg = SIMULATED_CHAT_ITEMS[Math.floor(Math.random() * SIMULATED_CHAT_ITEMS.length)];
      seeded.push({
        id: `seed-${i}-${Date.now()}`,
        username: chatter.username,
        badge: chatter.badge,
        badgeClass: chatter.badgeClass,
        text: msg,
        time: `${10 - i}m ago`,
        self: false
      });
    }
    setChatMessages(seeded);

    // Expand chat automatically on wider screens after mount
    if (window.innerWidth > 1200) {
      setChatOpen(true);
    }
  }, []);

  // Ticker for simulated live chat messages
  useEffect(() => {
    if (status !== 'authenticated') return;

    const interval = setInterval(() => {
      const chatter = SIMULATED_CHATTERS[Math.floor(Math.random() * SIMULATED_CHATTERS.length)];
      const msg = SIMULATED_CHAT_ITEMS[Math.floor(Math.random() * SIMULATED_CHAT_ITEMS.length)];
      
      const newMsg = {
        id: `ticker-${Date.now()}`,
        username: chatter.username,
        badge: chatter.badge,
        badgeClass: chatter.badgeClass,
        text: msg,
        time: 'Just now',
        self: false
      };

      setChatMessages(prev => [...prev.slice(-30), newMsg]); // Keep last 30
    }, 12000); // every 12 seconds

    return () => clearInterval(interval);
  }, [status]);

  // Scroll to bottom of chat whenever messages list updates
  useEffect(() => {
    if (chatOpen) {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

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

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      username: session?.user?.name?.split(' ')[0] || 'You',
      badge: 'YOU',
      badgeClass: 'chat-badge-you',
      text: chatInput,
      time: 'Just now',
      self: true
    };

    setChatMessages(prev => [...prev, userMessage]);
    const inputMsg = chatInput.toLowerCase();
    setChatInput('');

    // Trigger context-aware automated reply bot arpeggio after a brief delay
    setTimeout(() => {
      let replyText = "Nice! Let's keep cashing out those rewards.";
      
      if (inputMsg.includes('hello') || inputMsg.includes('hi') || inputMsg.includes('hey') || inputMsg.includes('sup')) {
        replyText = "Sup! Welcome to the EarnHub group chat. What offers are you working on?";
      } else if (inputMsg.includes('spin') || inputMsg.includes('reward') || inputMsg.includes('wheel') || inputMsg.includes('streak')) {
        replyText = "The Daily Spin Wheel is amazing. Make sure to claim it every 24 hours to keep your streak multiplier active!";
      } else if (inputMsg.includes('cpx') || inputMsg.includes('survey') || inputMsg.includes('opinion')) {
        replyText = "CPX is easily the best for quick pocket change. I do them on my phone while watching TV.";
      } else if (inputMsg.includes('lootably') || inputMsg.includes('offer') || inputMsg.includes('game')) {
        replyText = "Make sure you disable adblockers and complete the app install tasks exactly as instructed so they credit properly!";
      } else if (inputMsg.includes('cashout') || inputMsg.includes('withdraw') || inputMsg.includes('ltc') || inputMsg.includes('btc') || inputMsg.includes('paypal')) {
        replyText = "Yeah LTC cashouts are processed super fast. Clear fee-free transactions instantly.";
      } else {
        const standardReplies = [
          "EarnHub is easily the highest paying GPT portal right now.",
          "Check out the Leaderboard section! Competitions are getting highly active.",
          "Is anyone cashing out to Litecoin today? The network fees are practically zero.",
          "Yeah, Lootably is credit matching Android game benchmarks perfectly right now."
        ];
        replyText = standardReplies[Math.floor(Math.random() * standardReplies.length)];
      }

      const botChatter = SIMULATED_CHATTERS[Math.floor(Math.random() * SIMULATED_CHATTERS.length)];

      const botReply = {
        id: `bot-${Date.now()}`,
        username: botChatter.username,
        badge: botChatter.badge,
        badgeClass: botChatter.badgeClass,
        text: replyText,
        time: 'Just now',
        self: false
      };

      setChatMessages(prev => [...prev, botReply]);
    }, 1800);
  };

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
    { name: 'Daily Rewards', href: '/dashboard/rewards', icon: Flame },
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
            <div className="landing-logo-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '8px', color: 'white' }}>💎</div>
            <span style={{ fontWeight: '900', letterSpacing: '-0.5px' }}>EarnHub</span>
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

      {/* Main Content Area (Compresses dynamically when chat sidebar is active) */}
      <div className={`main-content ${chatOpen ? 'main-content-chat-open' : ''}`}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
            <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: '600' }}>
              Welcome back, <span style={{ color: 'var(--color-primary)' }}>{user.name.split(' ')[0]}</span>!
            </h2>
          </div>

          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="topbar-balance" style={{ fontWeight: '800' }}>
              <span>💰</span>
              <span>${balance.toFixed(2)}</span>
            </div>
            
            {/* Live Chat Toggle Button in Header */}
            <button 
              onClick={() => setChatOpen(prev => !prev)}
              className="btn btn-ghost btn-icon"
              style={{ padding: '8px', color: chatOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)', position: 'relative' }}
              title="Toggle Live Chat Sidebar"
            >
              <MessageSquare size={18} />
              <span className="topbar-notification-dot" style={{ background: 'var(--color-success)', width: '6px', height: '6px', top: '4px', right: '4px' }}></span>
            </button>

            <div className="topbar-notification">
              <Bell size={18} />
              <span className="topbar-notification-dot"></span>
            </div>
          </div>
        </header>

        <main className="content-area" style={{ paddingBottom: '4rem' }}>
          {children}
        </main>
      </div>

      {/* Live Chat Collapsible Pinned Sidebar (Inspired by FreeCash.com) */}
      <aside className={`chat-sidebar ${!chatOpen ? 'chat-sidebar-collapsed' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-title">
            <span className="chat-online-indicator"></span>
            <span>GLOBAL COMMUNITY CHAT</span>
          </div>
          <button 
            className="btn btn-ghost btn-icon" 
            style={{ padding: '4px' }}
            onClick={() => setChatOpen(false)}
            title="Minimize Chat"
          >
            <X size={16} />
          </button>
        </div>

        <div className="chat-messages">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`chat-msg-item ${msg.self ? 'chat-msg-item-self' : ''}`}>
              <div className="chat-avatar">
                {msg.username.substring(0, 2).toUpperCase()}
              </div>
              <div className="chat-msg-content">
                <div className="chat-msg-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="chat-username">{msg.username}</span>
                    {msg.badge && (
                      <span className={`chat-badge ${msg.badgeClass}`}>
                        {msg.badge}
                      </span>
                    )}
                  </div>
                  <span className="chat-time">{msg.time}</span>
                </div>
                <p className="chat-msg-text">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={chatMessagesEndRef} />
        </div>

        <div className="chat-input-panel">
          <form onSubmit={handleSendChatMessage} className="chat-input-form">
            <input
              type="text"
              className="chat-input"
              placeholder="Type message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              maxLength={150}
            />
            <button 
              type="submit" 
              className="chat-send-btn"
              disabled={!chatInput.trim()}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </aside>

      {/* Floating Chat Trigger Button when minimized */}
      {!chatOpen && (
        <button 
          className="chat-toggle-floating animate-scale-in"
          onClick={() => setChatOpen(true)}
          title="Open Global Chat"
        >
          <MessageSquare size={22} />
        </button>
      )}

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
            margin-right: 0 !important;
          }
          .mobile-menu-btn {
            display: flex;
          }
          .chat-sidebar {
            width: 100%;
            height: calc(100vh - 60px);
            top: 60px;
          }
          .chat-toggle-floating {
            bottom: 16px;
            right: 16px;
            width: 48px;
            height: 48px;
          }
        }
      `}</style>
    </div>
  );
}
