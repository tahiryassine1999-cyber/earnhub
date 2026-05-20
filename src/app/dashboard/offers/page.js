'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Gift, 
  ExternalLink, 
  Clock, 
  Info,
  CheckCircle,
  X,
  Play,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function OffersPage() {
  const { data: session } = useSession();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Selected offer modal state
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [startingOffer, setStartingOffer] = useState(false);
  const [completingOffer, setCompletingOffer] = useState(false);
  
  // Celebration state
  const [earnedAmount, setEarnedAmount] = useState(null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/offers');
      if (res.ok) {
        const data = await res.json();
        setOffers(data.offers);
      }
    } catch (err) {
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchOffers();
    }
  }, [session]);

  const handleStartOffer = async () => {
    if (!selectedOffer) return;
    setStartingOffer(true);

    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: selectedOffer.id,
          action: 'start'
        })
      });

      if (res.ok) {
        // Open mock external URL in new tab
        window.open(selectedOffer.url, '_blank');
        
        // Update local offers state to PENDING
        setOffers(prev => prev.map(o => o.id === selectedOffer.id ? { ...o, status: 'PENDING' } : o));
        setSelectedOffer(prev => ({ ...prev, status: 'PENDING' }));
      } else {
        alert('Failed to start offer tracking');
      }
    } catch (err) {
      console.error(err);
      alert('Error starting offer tracking');
    } finally {
      setStartingOffer(false);
    }
  };

  // Simulate CPX/Lootably/Offertoro postback completion callback
  const handleSimulatePostback = async () => {
    if (!selectedOffer) return;
    setCompletingOffer(true);

    try {
      // Simulate real third-party postback call!
      const postbackUrl = `/api/postback?userId=${session.user.id}&offerId=${selectedOffer.externalId || selectedOffer.id}&amount=${selectedOffer.reward}&signature=mock_verified_sig`;
      
      const res = await fetch(postbackUrl, {
        method: 'GET'
      });

      const text = await res.text();

      if (res.ok && (text === '1' || text === 'OK')) {
        setEarnedAmount(selectedOffer.reward);
        
        // Close selection modal
        setSelectedOffer(null);
        
        // Dispatch balance update
        window.dispatchEvent(new Event('balanceUpdated'));
      } else {
        alert('Postback verification rejected: ' + text);
      }
    } catch (err) {
      console.error(err);
      alert('Error verifying postback callback');
    } finally {
      setCompletingOffer(false);
    }
  };

  const closeCelebration = () => {
    setEarnedAmount(null);
    fetchOffers(); // Refresh offers
  };

  // Unique categories
  const categories = ['All', 'Lootably Real Offerwall', 'App Install', 'Sign Up', 'Purchase', 'Watch Video'];

  const filteredOffers = activeCategory === 'All'
    ? offers
    : offers.filter(o => o.category === activeCategory);

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Offerwalls &amp; Tasks</h1>
        <p className="page-subtitle">Try new mobile applications, register on premium sites, watch videos, and get credited instantly.</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`tab ${activeCategory === cat ? 'tab-active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeCategory === 'Lootably Real Offerwall' ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '750px', gap: '1rem' }}>
          {(!process.env.NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID) && (
            <div className="alert alert-warning gap-2" style={{ marginBottom: '0.5rem' }}>
              <span>💡</span>
              <span style={{ fontSize: '13px' }}><strong>Lootably Sandbox Mode:</strong> Add your real <code>NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID</code> in production to display your real Lootably offer wall. Currently using a demo Placement ID.</span>
            </div>
          )}
          <div className="card" style={{ flex: 1, padding: '0', overflow: 'hidden', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
            <iframe
              src={`https://wall.lootably.com/web/widget/iframe?appId=${process.env.NEXT_PUBLIC_LOOTABLY_PLACEMENT_ID || '10255'}&userId=${session?.user?.id || 'guest'}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Lootably Offerwall Widget"
            />
          </div>
        </div>
      ) : loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton skeleton-card" style={{ height: '110px', borderRadius: 'var(--radius-xl)' }}></div>
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">🎁</div>
          <div className="empty-state-title">No Offers Found</div>
          <div className="empty-state-text">All offers completed for now! Check back tomorrow for more tasks.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOffers.map((o) => {
            let badgeDiffClass = 'badge-primary';
            if (o.difficulty === 'MEDIUM') badgeDiffClass = 'badge-warning';
            if (o.difficulty === 'HARD') badgeDiffClass = 'badge-danger';

            return (
              <div 
                key={o.id} 
                className={`offer-card ${o.featured ? 'offer-card-featured' : ''}`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedOffer(o)}
              >
                <div className="offer-card-icon">
                  {o.iconUrl || '🎁'}
                </div>
                <div className="offer-card-content">
                  <div className="offer-card-header">
                    <div>
                      <h3 className="offer-card-title">{o.title}</h3>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Provider: <span style={{ color: 'var(--color-primary)' }}>{o.provider}</span>
                      </p>
                    </div>
                    <span className="offer-card-reward">${o.reward.toFixed(2)}</span>
                  </div>
                  <p className="offer-card-desc">{o.description}</p>
                  
                  <div className="offer-card-footer">
                    <div className="gap-2" style={{ display: 'flex' }}>
                      <span className="badge badge-primary">{o.category}</span>
                      <span className={`badge ${badgeDiffClass}`}>{o.difficulty}</span>
                    </div>

                    {o.status === 'CREDITED' ? (
                      <span className="badge badge-success">
                        <CheckCircle size={12} /> Credited
                      </span>
                    ) : o.status === 'PENDING' ? (
                      <span className="badge badge-warning">
                        <Clock size={12} /> Active / Pending
                      </span>
                    ) : (
                      <button className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                        Start Task
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED INSTRUCTIONS & TRACKING MODAL */}
      {selectedOffer && (
        <div className="modal-overlay">
          <div className="modal animate-scale-in" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="offer-card-icon" style={{ width: '44px', height: '44px', fontSize: '1.25rem' }}>
                  {selectedOffer.iconUrl || '🎁'}
                </div>
                <div>
                  <span className="badge badge-primary" style={{ marginBottom: '0.15rem' }}>{selectedOffer.provider}</span>
                  <h2 className="modal-title" style={{ fontSize: '1.25rem' }}>{selectedOffer.title}</h2>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedOffer(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div className="flex-between" style={{ background: 'var(--color-bg-input)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px solid var(--color-border)' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Earning Payout:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--color-primary)' }}>${selectedOffer.reward.toFixed(2)}</span>
              </div>

              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={16} className="text-primary" /> Instructions Checklist:
              </h4>

              <div style={{ background: 'rgba(26, 35, 50, 0.4)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
                {selectedOffer.instructions.split('\n').map((line, idx) => (
                  <p key={idx} style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                    {line}
                  </p>
                ))}
              </div>

              <div className="alert alert-warning gap-2" style={{ marginBottom: '1.5rem', fontSize: '12px' }}>
                <span>🛡️</span>
                <span>To ensure correct tracking, disable AdBlockers and do not close the browser tab during redirects.</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedOffer.status === 'CREDITED' ? (
                  <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                    <CheckCircle size={16} /> Offer Already Credited
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleStartOffer}
                      disabled={startingOffer}
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                    >
                      {startingOffer ? 'Launching Tracking Link...' : <><Play size={16} /> Open Earning Link <ExternalLink size={14} /></>}
                    </button>

                    {selectedOffer.status === 'PENDING' && (
                      <button 
                        onClick={handleSimulatePostback}
                        disabled={completingOffer}
                        className="btn btn-outline"
                        style={{ width: '100%', borderColor: 'var(--color-info)', color: 'var(--color-info)' }}
                      >
                        {completingOffer ? 'Invoking Postback...' : <><Cpu size={16} /> Simulate Network Postback callback</>}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CELEBRATION OVERLAY */}
      {earnedAmount && (
        <div className="celebration-overlay">
          <div className="celebration-card animate-scale-in">
            <div className="celebration-icon">🎁</div>
            <h2 className="celebration-title">Offer Credited!</h2>
            <div className="celebration-amount">+${earnedAmount.toFixed(2)} USD</div>
            <p className="celebration-text">
              Congratulations! The postback verification has cleared. The task reward has been instantly credited to your wallet balance.
            </p>
            <button onClick={closeCelebration} className="btn btn-primary" style={{ width: '100%' }}>
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
