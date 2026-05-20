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
  DollarSign
} from 'lucide-react';

export default function Home() {
  // Live Activity Feed Mock Data
  const [activities, setActivities] = useState([
    { id: 1, user: 'yass***', amount: 8.50, provider: 'CPX Research', type: 'Survey', time: 'Just now' },
    { id: 2, user: 'alex92', amount: 24.00, provider: 'Lootably', type: 'App Install', time: '2 min ago' },
    { id: 3, user: 'mira_k', amount: 1.20, provider: 'BitLabs', type: 'Short Survey', time: '4 min ago' },
    { id: 4, user: 'john_d', amount: 15.50, provider: 'OfferToro', type: 'Multi-Task', time: '7 min ago' },
    { id: 5, user: 'sam***', amount: 5.00, provider: 'AdGate Media', type: 'Sign Up', time: '11 min ago' },
  ]);

  // Simulate real-time cashout updates to hook new users
  useEffect(() => {
    const providers = ['CPX Research', 'Lootably', 'BitLabs', 'OfferToro', 'AdGate Media'];
    const types = ['Survey', 'App Install', 'Short Survey', 'Multi-Task', 'Sign Up', 'Video Reward'];
    const users = ['tah***', 'gamerX', 'crypto_queen', 'richard_h', 'lisa99', 'mike_s', 'sara***'];

    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        user: users[Math.floor(Math.random() * users.length)],
        amount: parseFloat((Math.random() * 15 + 0.5).toFixed(2)),
        provider: providers[Math.floor(Math.random() * providers.length)],
        type: types[Math.floor(Math.random() * types.length)],
        time: 'Just now'
      };

      setActivities(prev => {
        const updated = [newActivity, ...prev.slice(0, 4)];
        return updated.map((act, idx) => ({
          ...act,
          time: idx === 0 ? 'Just now' : `${idx * 2 + Math.floor(Math.random() * 2)} min ago`
        }));
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const partners = [
    {
      name: 'CPX Research',
      type: 'Surveys',
      payoutSpeed: 'Instant',
      rating: 5,
      description: 'The industry-leading survey router offering thousands of high-paying market research studies daily.',
      logo: '📊',
      featured: true,
      avgPayout: '$1.80'
    },
    {
      name: 'Lootably',
      type: 'Offerwall & Tasks',
      payoutSpeed: 'Instant',
      rating: 5,
      description: 'High-converting mobile applications, premium desktop trials, and gaming reward tasks.',
      logo: '🎁',
      featured: true,
      avgPayout: '$8.50'
    },
    {
      name: 'BitLabs',
      type: 'Surveys',
      payoutSpeed: 'Instant',
      rating: 4,
      description: 'Highly engaging, short consumer surveys with partial rewards even if you get disqualified.',
      logo: '📈',
      featured: false,
      avgPayout: '$1.20'
    },
    {
      name: 'OfferToro',
      type: 'Multi-Rewards',
      payoutSpeed: 'Instant',
      rating: 4,
      description: 'Massive library of classic multi-stage tasks, video streaming points, and high-value mobile trials.',
      logo: '🐂',
      featured: false,
      avgPayout: '$6.20'
    },
    {
      name: 'AdGate Media',
      type: 'CPA & Cashback',
      payoutSpeed: 'Instant',
      rating: 5,
      description: 'Trusted network featuring premium cashback rewards, free trials, and simple survey completions.',
      logo: '🛡️',
      featured: false,
      avgPayout: '$4.80'
    }
  ];

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo" style={{ color: 'var(--color-primary)' }}>
          <div className="landing-logo-icon" style={{ background: 'var(--gradient-primary)' }}>💎</div>
          <span style={{ color: 'var(--color-text)', fontWeight: '800' }}>EarnHub</span>
        </div>
        <div className="landing-nav-links">
          <Link href="/login" className="landing-nav-link">Login</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <div className="landing-hero-content" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div className="landing-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--color-primary)', display: 'inline-flex', padding: '6px 16px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(59, 130, 246, 0.2)', gap: '8px', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
            <Zap size={14} style={{ fill: 'currentColor' }} />
            <span>Start Earning Instantly — 25% Welcome Bonus Applied!</span>
          </div>
          
          <h1 className="landing-title" style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-0.02em' }}>
            The Premium Platform for <br />
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Surveys &amp; High-Paying Offers</span>
          </h1>
          
          <p className="landing-subtitle" style={{ fontSize: '1.15rem', color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
            Partnered with the world's leading ad networks and market research firms. Voice your opinions, try out trending mobile games, and request instant withdrawals to PayPal or Crypto.
          </p>
          
          <div className="landing-cta" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '60px' }}>
            <Link href="/register" className="btn btn-primary btn-lg" style={{ boxShadow: 'var(--shadow-glow)' }}>
              Get Started Free <ChevronRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          {/* Landing Stats */}
          <div className="landing-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="card" style={{ background: 'rgba(30, 41, 59, 0.3)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-primary)' }}>$248,394.80</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: '500' }}>Total Paid to Users</div>
            </div>
            <div className="card" style={{ background: 'rgba(30, 41, 59, 0.3)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-text)' }}>5.0 Minutes</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: '500' }}>Average Cashout Time</div>
            </div>
            <div className="card" style={{ background: 'rgba(30, 41, 59, 0.3)', backdropFilter: 'blur(10px)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-text)' }}>4.9 / 5.0 Rating</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px', fontWeight: '500' }}>Verified TrustScore</div>
            </div>
          </div>
        </div>
      </header>

      {/* LIVE CASH OUT ACTIVITY FEED */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(59, 130, 246, 0.25)', boxShadow: 'rgba(59, 130, 246, 0.1) 0px 8px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></span>
              Live Platform Earnings Feed
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Real-time updates</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activities.map((act) => (
              <div 
                key={act.id} 
                className="flex-between animate-slide-up" 
                style={{ background: 'rgba(15, 23, 42, 0.4)', padding: '12px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px' }}>
                    {act.user.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text)' }}>{act.user}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '8px' }}>completed a {act.type} via <span style={{ color: 'var(--color-primary)', fontWeight: '500' }}>{act.provider}</span></span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '800', color: '#22c55e' }}>+${act.amount.toFixed(2)}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', minWidth: '70px', textAlign: 'right' }}>{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER NETWORKS SECTION */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '12px' }}>Supported Offerwalls &amp; Survey Partners</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            We host the world's most popular ad networks. Complete tasks on your favorite walls and cash out instantly.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {partners.map((partner) => (
            <div 
              key={partner.name}
              className={`card ${partner.featured ? 'card-glow' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}
            >
              {partner.featured && (
                <span className="badge badge-primary" style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--color-primary)', color: 'white' }}>
                  Top Partner
                </span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-lg)', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {partner.logo}
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{partner.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '10px' }}>{partner.type}</span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Speed: {partner.payoutSpeed}</span>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', flex: 1, marginBottom: '20px' }}>
                {partner.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block' }}>Avg. Payout per Task</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#22c55e' }}>{partner.avgPayout}</span>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(partner.rating)].map((_, i) => (
                    <Star key={i} size={14} style={{ fill: '#fbbf24', stroke: '#fbbf24' }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '12px' }}>How it Works</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>Get started in 3 simple steps in under 2 minutes.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="how-steps">
          <div className="card" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid var(--color-border)', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '18px', fontWeight: '800' }}>1</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Sign Up</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Create a free account using email or social. Get a **$1.00** welcome bonus instantly credited to your wallet.
            </p>
          </div>

          <div className="card" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid var(--color-border)', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '18px', fontWeight: '800' }}>2</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Select Partner &amp; Task</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Choose CPX Research, Lootably, or custom offer walls. Complete surveys or download and test modern applications.
            </p>
          </div>

          <div className="card" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid var(--color-border)', textAlign: 'center', padding: '32px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '18px', fontWeight: '800' }}>3</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Cash Out</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Redeem starting at just **$5.00** via PayPal, Bitcoin, or top-tier digital gift cards. Processed securely within minutes.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section style={{ maxWidth: '1000px', margin: '0 auto 80px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="card" style={{ background: 'var(--gradient-card)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '60px 40px', borderRadius: 'var(--radius-2xl)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1), transparent 60%)', pointerEvents: 'none' }} />
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px', position: 'relative', zIndex: '1' }}>Join 50,000+ Happy Earners Online</h2>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 32px auto', fontSize: '16px', position: 'relative', zIndex: '1' }}>
            Earn money in your free time. Voice your opinions and get paid for testing apps today.
          </p>
          <div style={{ position: 'relative', zIndex: '1' }}>
            <Link href="/register" className="btn btn-primary btn-lg">
              Start Earning Now <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
        <p>&copy; {new Date().getFullYear()} EarnHub Inc. All rights reserved. Partner with CPX Research &amp; Lootably.</p>
      </footer>
    </div>
  );
}
