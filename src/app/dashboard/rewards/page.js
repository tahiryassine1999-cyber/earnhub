'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Flame, 
  Award, 
  HelpCircle, 
  Play, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';

const SECTORS = [
  { index: 0, label: '$0.05', color: '#1e293b', text: '#cbd5e1' },
  { index: 1, label: '$0.10', color: '#312e81', text: '#a5b4fc' },
  { index: 2, label: '$0.25', color: '#064e3b', text: '#6ee7b7' },
  { index: 3, label: '$0.50', color: '#1e1b4b', text: '#c7d2fe' },
  { index: 4, label: '$1.00', color: '#111827', text: '#cbd5e1' },
  { index: 5, label: '$2.50', color: '#581c87', text: '#e9d5ff' },
  { index: 6, label: '$5.00', color: '#3b0764', text: '#f3e8ff' },
  { index: 7, label: 'JACKPOT', color: '#78350f', text: '#fde047' }
];

export default function RewardsPage() {
  const { data: session } = useSession();
  
  // UI states
  const [canSpin, setCanSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Animation states
  const [wheelRotation, setWheelRotation] = useState(0);
  const [claimedReward, setClaimedReward] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Ticking audio sync tracking
  const currentAngleRef = useRef(0);
  const animationFrameId = useRef(null);

  // Synthesize short retro audio ticking clicks
  const playTick = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (e) {}
  };

  // Synthesize beautiful golden chord celebration chime
  const playWinChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      // Beautiful major tri-tone arpeggio in C
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.6);
      });
    } catch (e) {}
  };

  const fetchSpinStatus = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/rewards/spin');
      if (res.ok) {
        const data = await res.json();
        setCanSpin(data.canSpin);
        setRemainingMs(data.remainingMs || 0);

        // Fetch wallet details to approximate streak days from transactions
        const walletRes = await fetch('/api/wallet');
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          // Streak length based on continuous DAILY_SPIN / DAILY_BONUS count in past 7 days
          const dailySpins = walletData.transactions.filter(t => t.type === 'DAILY_SPIN' || t.type === 'DAILY_BONUS');
          setStreakDays(Math.min(dailySpins.length % 7 || 1, 7));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchSpinStatus();
    }
  }, [session]);

  // Countdown timer for next daily spin
  useEffect(() => {
    if (remainingMs <= 0) return;

    const timer = setInterval(() => {
      setRemainingMs(prev => {
        if (prev <= 1000) {
          clearInterval(timer);
          setCanSpin(true);
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingMs]);

  const handleSpin = async () => {
    if (!canSpin || spinning) return;
    setSpinning(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/rewards/spin', {
        method: 'POST'
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to claim daily reward.');
        setSpinning(false);
        return;
      }

      // Start dynamic rotation tracking for ticking audio sounds
      const startAngle = wheelRotation % 360;
      const targetAngle = data.angle;
      const startTime = performance.now();
      const duration = 6000; // 6 seconds duration matching CSS

      setWheelRotation(targetAngle);

      let lastTickAngle = 0;

      const trackTicks = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Custom easeOutCubic deceleration easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentTotalAngle = startAngle + (targetAngle - startAngle) * easeProgress;
        
        // Play click every 45 degrees boundary
        if (Math.floor(currentTotalAngle / 45) > Math.floor(lastTickAngle / 45)) {
          playTick();
          lastTickAngle = currentTotalAngle;
        }

        if (progress < 1) {
          animationFrameId.current = requestAnimationFrame(trackTicks);
        } else {
          // Finished Spin!
          setTimeout(() => {
            playWinChime();
            setClaimedReward({
              amount: data.amount,
              label: data.label
            });
            setSpinning(false);
            setCanSpin(false);
            setRemainingMs(24 * 60 * 60 * 1000); // 24 hours
            
            // Dispatch dynamic balance update to the headers
            window.dispatchEvent(new Event('balanceUpdated'));
          }, 400);
        }
      };

      animationFrameId.current = requestAnimationFrame(trackTicks);

    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected communication error occurred.');
      setSpinning(false);
    }
  };

  const closeCelebration = () => {
    setClaimedReward(null);
    fetchSpinStatus();
  };

  // Convert milliseconds into readable hh:mm:ss format
  const formatTime = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="empty-state">
        <div className="animate-spin empty-state-icon">🔥</div>
        <div className="empty-state-title">Loading Daily Rewards</div>
        <div className="empty-state-text">Syncing your login streaks and spin multipliers...</div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header flex-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Daily Rewards &amp; Streaks</h1>
          <p className="page-subtitle">Spin our lucky wheel every 24 hours to win free crypto and dollar rewards instantly.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '6px 14px' }}>
            <Flame size={14} style={{ fill: 'currentColor' }} /> STREAK: {streakDays} DAYS ACTIVE
          </span>
        </div>
      </div>

      {/* 7-Day Streak Panel */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px' }}>
          🎁 7-Day Streak Rewards Calendar
        </h3>
        <p className="card-description" style={{ marginBottom: '1.5rem' }}>
          Keep earning daily to complete your streak grid! Reaching Day 7 unlocks a guaranteed premium bonus spin.
        </p>

        <div className="rewards-streak-grid">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isClaimed = day < streakDays;
            const isActive = day === streakDays;
            const isJackpot = day === 7;

            let cardClass = 'streak-day-card';
            if (isClaimed) cardClass += ' streak-day-claimed';
            if (isActive) cardClass += ' streak-day-active';

            return (
              <div key={day} className={cardClass}>
                <div className="streak-day-num">Day {day}</div>
                <div className="streak-day-reward" style={{ fontSize: isJackpot ? '16px' : '15px', color: isJackpot ? '#f59e0b' : 'white' }}>
                  {isJackpot ? '👑 SPIN' : `+$${(day * 0.05).toFixed(2)}`}
                </div>
                <div className="streak-day-status">
                  {isClaimed ? (
                    <span style={{ color: 'var(--color-success)' }}><CheckCircle2 size={12} /> Claimed</span>
                  ) : isActive ? (
                    <span style={{ color: 'var(--color-primary)' }}><TrendingUp size={12} /> Spin Now</span>
                  ) : (
                    <span style={{ color: 'var(--color-text-muted)' }}>Muted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', alignItems: 'center' }}>
        {/* Left Side - Interactive SVG spinning wheel */}
        <div className="card flex-center" style={{ padding: '2rem' }}>
          <div className="wheel-wrapper">
            <div className="wheel-pointer"></div>
            
            <div className="wheel-outer">
              <svg 
                className="wheel-inner" 
                style={{ 
                  transform: `rotate(${wheelRotation}deg)`,
                  transition: spinning ? 'transform 6000ms cubic-bezier(0.15, 0.85, 0.15, 1)' : 'none'
                }} 
                viewBox="0 0 300 300"
              >
                {SECTORS.map((sector) => {
                  const angle = 45; // 360 / 8 sectors
                  const startAngle = sector.index * angle;
                  
                  // Compute SVG pie slice coordinates
                  const radStart = (startAngle - 90) * Math.PI / 180;
                  const radEnd = (startAngle + angle - 90) * Math.PI / 180;
                  
                  const x1 = 150 + 150 * Math.cos(radStart);
                  const y1 = 150 + 150 * Math.sin(radStart);
                  const x2 = 150 + 150 * Math.cos(radEnd);
                  const y2 = 150 + 150 * Math.sin(radEnd);
                  
                  const d = `M 150 150 L ${x1} ${y1} A 150 150 0 0 1 ${x2} ${y2} Z`;
                  
                  // Text coordinates rotation
                  const textAngle = startAngle + angle / 2;
                  
                  return (
                    <g key={sector.index}>
                      <path d={d} fill={sector.color} stroke="#111726" strokeWidth="1.5" />
                      <text
                        x="150"
                        y="40"
                        transform={`rotate(${textAngle}, 150, 150)`}
                        fill={sector.text}
                        fontSize="11"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {sector.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="wheel-center">🎡</div>
            </div>

            <div className="spin-claim-box">
              {errorMsg && (
                <div className="alert alert-error gap-2" style={{ marginBottom: '1rem', padding: '10px 14px', borderRadius: '10px' }}>
                  <AlertCircle size={14} />
                  <span style={{ fontSize: '12px' }}>{errorMsg}</span>
                </div>
              )}

              {canSpin ? (
                <button
                  onClick={handleSpin}
                  disabled={spinning}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px 28px', fontSize: '15px', fontWeight: '800', borderRadius: '12px', boxShadow: 'var(--shadow-glow)' }}
                >
                  {spinning ? 'SPINNING WHEEL...' : <><Play size={16} style={{ fill: 'currentColor' }} /> SPIN THE WHEEL NOW</>}
                </button>
              ) : (
                <button
                  disabled
                  className="btn btn-secondary"
                  style={{ width: '100%', padding: '14px 28px', fontSize: '15px', fontWeight: '800', borderRadius: '12px', opacity: 0.8, color: 'var(--color-text-muted)' }}
                >
                  <Clock size={16} /> NEXT SPIN IN: {formatTime(remainingMs)}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Features / Faq panel */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px', color: 'white' }}>🔒 Secure Payout Ledger</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              All spin results are calculated cryptographically on our cloud database prior to animating on your screen. This ensures absolute fairness, transparency, and prevents click exploits.
            </p>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px', color: 'white' }}>🌟 Dynamic Multiplier Brackets</h4>
            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Win amounts scale upwards as you complete surveys! Active users who submit at least $1.00 in survey completions get a permanent **2x multiplier** added to their daily spin wheels.
            </p>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '14px', fontWeight: '800', marginBottom: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <HelpCircle size={16} className="text-primary" /> Daily Rewards FAQ
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', display: 'block' }}>When does my timer reset?</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4', display: 'block', marginTop: '2px' }}>
                  Exactly 24 hours after your last successful spin. A countdown ticker is displayed directly on the spin button.
                </span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'white', display: 'block' }}>How are rewards credited?</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4', display: 'block', marginTop: '2px' }}>
                  Completions are registered under the transaction ledger instantly. You can immediately withdraw them on the wallet page once you hit $5.00.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN CELEBRATION MODAL */}
      {claimedReward && (
        <div className="celebration-overlay">
          <div className="celebration-card animate-scale-in">
            <div className="celebration-icon">🎁</div>
            <h2 className="celebration-title">CONGRATULATIONS!</h2>
            <div className="celebration-amount">+{claimedReward.label} CREDITED</div>
            <p className="celebration-text">
              Excellent! Your daily spin cleared successfully. We have instantly updated your ledger balance by **{claimedReward.label} USD**. Keep your streak active to earn premium prizes!
            </p>
            <button 
              onClick={closeCelebration}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px 28px', fontSize: '15px', fontWeight: '800', borderRadius: '12px' }}
            >
              AWESOME, COLLECT REWARD!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
