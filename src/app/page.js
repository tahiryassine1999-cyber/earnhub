'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  CheckCircle, 
  Wallet, 
  ChevronRight, 
  Award, 
  Users, 
  ShieldCheck, 
  Layers, 
  Zap,
  Star,
  ExternalLink,
  DollarSign,
  Gamepad2,
  Smartphone,
  Laptop,
  Check,
  TrendingDown,
  Gift,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  // Live Activity Feed Mock Data inspired by FreeCash ticker
  const [activities, setActivities] = useState([
    { id: 1, user: 'yass***', amount: 8.50, provider: 'CPX Research', type: 'Survey', platform: 'Android', time: 'Just now' },
    { id: 2, user: 'alex92', amount: 24.00, provider: 'Lootably', type: 'Play Game', platform: 'iOS', time: '1 min ago' },
    { id: 3, user: 'mira_k', amount: 1.20, provider: 'BitLabs', type: 'Opinion Poll', platform: 'All', time: '3 min ago' },
    { id: 4, user: 'john_d', amount: 42.50, provider: 'OfferToro', type: 'Game Task', platform: 'Android', time: '5 min ago' },
    { id: 5, user: 'sam***', amount: 5.00, provider: 'AdGate Media', type: 'Easy Sign Up', platform: 'Desktop', time: '9 min ago' },
  ]);

  // Simulate real-time cashout updates to hook new users
  useEffect(() => {
    const providers = ['CPX Research', 'Lootably', 'BitLabs', 'OfferToro', 'AdGate Media'];
    const types = ['Survey Study', 'Game Task', 'Instant Opinion', 'App Install', 'Easy Sign Up', 'Video Payout'];
    const platforms = ['Android', 'iOS', 'Desktop', 'All'];
    const users = ['tah***', 'gamerX', 'crypto_queen', 'richard_h', 'lisa99', 'mike_s', 'sara***', 'neon_rider', 'alpha_btc'];

    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        user: users[Math.floor(Math.random() * users.length)],
        amount: parseFloat((Math.random() * 45 + 0.50).toFixed(2)),
        provider: providers[Math.floor(Math.random() * providers.length)],
        type: types[Math.floor(Math.random() * types.length)],
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        time: 'Just now'
      };

      setActivities(prev => {
        const updated = [newActivity, ...prev.slice(0, 4)];
        return updated.map((act, idx) => ({
          ...act,
          time: idx === 0 ? 'Just now' : `${idx * 2 + Math.floor(Math.random() * 2)} min ago`
        }));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const featuredOffers = [
    {
      title: 'Monopoly Go! Board Rush',
      category: 'Game Task',
      reward: 32.80,
      icon: '🎲',
      difficulty: 'Medium',
      devices: ['Android', 'iOS'],
      popular: true,
      color: '#f43f5e'
    },
    {
      title: 'Raid: Shadow Legends',
      category: 'RPG Install',
      reward: 45.50,
      icon: '🛡️',
      difficulty: 'Hard',
      devices: ['Android', 'iOS', 'Desktop'],
      popular: true,
      color: '#a855f7'
    },
    {
      title: 'CPX High-Match Survey',
      category: 'Market Research',
      reward: 3.80,
      icon: '📊',
      difficulty: 'Easy',
      devices: ['All'],
      popular: false,
      color: '#3b82f6'
    },
    {
      title: 'ExpressVPN Fast Sign-Up',
      category: 'Easy Trial',
      reward: 18.20,
      icon: '🔒',
      difficulty: 'Easy',
      devices: ['Desktop', 'Android', 'iOS'],
      popular: false,
      color: '#10b981'
    }
  ];

  const partners = [
    { name: 'CPX Research', logo: '📊', desc: 'Real-time consumer surveys & polls' },
    { name: 'Lootably', logo: '🎁', desc: 'Premium app installs & gaming challenges' },
    { name: 'BitLabs', logo: '📈', desc: 'Short targeted market opinion studies' },
    { name: 'OfferToro', logo: '🐂', desc: 'Multi-stage mobile game progression tasks' },
    { name: 'AdGate Media', logo: '⚡', desc: 'Exclusive sign-ups, trials & cashbacks' }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '6rem', background: '#070a13' }}>
      
      {/* Navigation */}
      <nav className="landing-nav" style={{ background: 'rgba(7, 10, 19, 0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="landing-logo">
          <div className="landing-logo-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '8px' }}>💎</div>
          <span style={{ fontWeight: '900', letterSpacing: '-0.5px' }}>EarnHub</span>
        </div>
        <div className="landing-nav-links">
          <Link href="/login" className="landing-nav-link" style={{ fontWeight: '600' }}>Login</Link>
          <Link href="/register" className="btn btn-primary btn-sm" style={{ padding: '8px 20px', borderRadius: '8px', fontWeight: '700' }}>Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section styled like FreeCash */}
      <header className="landing-hero" style={{ paddingTop: '140px', paddingBottom: '40px', background: 'radial-gradient(circle at top, rgba(59, 130, 246, 0.08) 0%, transparent 60%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '48px', alignItems: 'center' }}>
          
          {/* Hero Left Content */}
          <div>
            <div style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--color-primary)', display: 'inline-flex', padding: '8px 16px', borderRadius: '30px', border: '1px solid rgba(59, 130, 246, 0.2)', gap: '8px', fontSize: '13px', fontWeight: '700', marginBottom: '24px' }}>
              <Flame size={14} style={{ fill: 'currentColor' }} />
              <span>FreeCash Inspired High Payouts Active!</span>
            </div>
            
            <h1 style={{ fontSize: '3.75rem', fontWeight: '900', lineHeight: '1.1', letterSpacing: '-1.5px', marginBottom: '24px' }}>
              Make Money Online.<br />
              Get Paid <span style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Instantly.</span>
            </h1>
            
            <p style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', marginBottom: '32px', lineHeight: '1.6', maxWidth: '580px' }}>
              Earn up to **$150.00** per game install or **$5.00** per survey completion. Direct integrations with premium advertisers ensure the absolute highest profit margins in the market.
            </p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
              <Link href="/register" className="btn btn-primary btn-lg" style={{ padding: '16px 36px', borderRadius: '12px', fontSize: '16px', fontWeight: '800', boxShadow: 'var(--shadow-glow)' }}>
                Start Earning Now <ChevronRight size={20} />
              </Link>
              <Link href="/login" className="btn btn-secondary btn-lg" style={{ padding: '16px 28px', borderRadius: '12px', fontSize: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                Explore Dashboard
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div style={{ display: 'flex', gap: '40px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Average User Daily Profit</span>
                <span style={{ fontSize: '22px', fontWeight: '800', color: '#22c55e', marginTop: '4px', display: 'block' }}>$18.42 USD</span>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: '40px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Cashed Out Today</span>
                <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text)', marginTop: '4px', display: 'block' }}>$4,892.40</span>
              </div>
            </div>
          </div>

          {/* Hero Right - Live FreeCash Ticker Widget */}
          <div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #111726, #090e1a)', border: '1px solid rgba(59, 130, 246, 0.25)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #22c55e' }}></span>
                  <h3 style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px' }}>LIVE REWARDS TICKER</h3>
                </div>
                <span className="badge" style={{ background: 'rgba(59,130,246,0.12)', color: 'var(--color-primary)', fontSize: '10px', fontWeight: '700' }}>ONLINE</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activities.map((act) => (
                  <div 
                    key={act.id} 
                    className="flex-between animate-slide-up"
                    style={{ background: 'rgba(255,255,255,0.02)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '11px', color: 'white' }}>
                        {act.user[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700' }}>{act.user}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                          {act.type} via <span style={{ color: 'var(--color-primary)' }}>{act.provider}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '14px', fontWeight: '900', color: '#22c55e' }}>+${act.amount.toFixed(2)}</span>
                      <span style={{ display: 'block', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* CHOOSE YOUR EARNING METHOD (Inspired by FreeCash Category Row) */}
      <section style={{ maxWidth: '1200px', margin: '40px auto 80px auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(7, 10, 19, 0.4) 100%)', border: '1px solid rgba(244, 63, 94, 0.15)', display: 'flex', gap: '20px', alignItems: 'center', padding: '24px' }}>
            <div style={{ fontSize: '2.5rem', background: 'rgba(244, 63, 94, 0.15)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#f43f5e' }}>PLAY PREMIUM GAMES</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>Download top RPG, puzzle or strategy games. Complete benchmarks and earn up to **$120.00** per game install.</p>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(7, 10, 19, 0.4) 100%)', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', gap: '20px', alignItems: 'center', padding: '24px' }}>
            <div style={{ fontSize: '2.5rem', background: 'rgba(59, 130, 246, 0.15)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📊</div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary)' }}>ANSWER PAID SURVEYS</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>Share your feedback on consumer products and hot market trends. Earn up to **$6.50** per 10-minute session.</p>
            </div>
          </div>

          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(7, 10, 19, 0.4) 100%)', border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', gap: '20px', alignItems: 'center', padding: '24px' }}>
            <div style={{ fontSize: '2.5rem', background: 'rgba(16, 185, 129, 0.15)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⚡</div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#10b981' }}>COMPLIMENTARY TASKS</h3>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>Register on leading cryptocurrency portals, watch streaming videos, or complete quick website sign-ups.</p>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED OFFERS ROW (Directly inspired by FreeCash dashboard) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>⚡ Highly Recommended Tasks Today</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginTop: '4px' }}>High-converting actions with verified payout logs. Click to sign up and start immediately!</p>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all offers <ArrowRight size={14} />
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="grid-4">
          {featuredOffers.map((offer) => (
            <div 
              key={offer.title}
              className="card"
              style={{ 
                background: 'rgba(17, 23, 41, 0.7)', 
                border: `1px solid rgba(255, 255, 255, 0.05)`, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                position: 'relative',
                transition: 'all 0.25s ease'
              }}
            >
              {offer.popular && (
                <span style={{ position: 'absolute', top: '12px', right: '12px', background: offer.color, color: 'white', fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                  POPULAR
                </span>
              )}
              
              {/* Card visual head */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                  {offer.icon}
                </div>
                <div>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', letterSpacing: '0.5px' }}>{offer.category}</span>
                  <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'white', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{offer.title}</h4>
                </div>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '24px' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-secondary)', fontSize: '9px', fontWeight: '600' }}>
                  Difficulty: {offer.difficulty}
                </span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-secondary)', fontSize: '9px', fontWeight: '600' }}>
                  {offer.devices.join(', ')}
                </span>
              </div>

              {/* Bottom value panel */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', display: 'block' }}>Earn Reward</span>
                  <span style={{ fontSize: '20px', fontWeight: '900', color: '#22c55e' }}>+${offer.reward.toFixed(2)}</span>
                </div>
                <Link href="/register" className="btn btn-primary btn-sm" style={{ padding: '6px 12px', borderRadius: '6px', background: offer.color, borderColor: offer.color, fontSize: '11px', fontWeight: '700' }}>
                  Start
                </Link>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* LEADERBOARD & REWARDS PROMOTION BAR (FreeCash style conversion element) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '40px 48px', display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '32px', alignItems: 'center', borderRadius: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '4px 12px', borderRadius: '30px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              🏁 EarnHub Competitions Active
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px', marginBottom: '12px' }}>$500.00 Monthly Leaderboard Sprint</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.6', maxWidth: '600px' }}>
              We reward our most active earners. Win up to **$250.00** as the 1st place champion in our monthly leaderboard race. All completions on our partner offerwalls count dynamically.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: '14px 28px', borderRadius: '10px', fontWeight: '800', background: 'linear-gradient(135deg, #a855f7, #8b5cf6)', border: 'none', boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>
              Join the Race <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* BRAND PARTNER GRID (Showcasing CPX, Lootably, etc.) */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <h3 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '800', letterSpacing: '1.5px', textAlign: 'center', marginBottom: '32px' }}>
          INTEGRATED ADVERTISING AND MARKET RESEARCH PARTNERS
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px', opacity: 0.8 }}>
          {partners.map((pt) => (
            <div 
              key={pt.name} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', padding: '12px 24px', borderRadius: '12px', minWidth: '180px' }}
            >
              <span style={{ fontSize: '1.25rem' }}>{pt.logo}</span>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'white', display: 'block' }}>{pt.name}</span>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Partner Verified ✔</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST SAFETY BANNER */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛡️</div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>100% Secure Webhooks</h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>All ad transactions are fully audited and processed over encrypted server connections.</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💸</div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>Instant Cash Transfers</h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>Reach just $5.00 to request payout. Payments hit your bank or wallet automatically in seconds.</p>
          </div>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📞</div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px' }}>Dedicated Support</h4>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>Our account managers are available 24/7 to resolve disputes and verify payouts.</p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section style={{ maxWidth: '1200px', margin: '0 auto 40px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(9, 14, 26, 0.4) 100%)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '80px 40px', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
          <h2 style={{ fontSize: '2.75rem', fontWeight: '900', letterSpacing: '-1px', marginBottom: '16px' }}>Ready to Start Your Earning Streak?</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 36px auto', fontSize: '16px', lineHeight: '1.6' }}>
            Earn money in your free time. Get paid for doing simple surveys, trying out apps, and playing game tasks.
          </p>
          <div>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ padding: '16px 40px', borderRadius: '12px', fontSize: '16px', fontWeight: '800' }}>
              Create Your Free Account <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
        <p>&copy; {new Date().getFullYear()} EarnHub Inc. All rights reserved. Partnered directly with CPX Research &amp; Lootably.</p>
      </footer>

    </div>
  );
}
