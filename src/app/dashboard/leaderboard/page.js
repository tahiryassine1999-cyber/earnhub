'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Trophy, 
  Award, 
  Crown,
  ChevronUp
} from 'lucide-react';

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [boardData, setBoardData] = useState({
    leaderboard: [],
    currentUserRank: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setBoardData(data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchLeaderboard();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="empty-state">
        <div className="animate-spin empty-state-icon">🏆</div>
        <div className="empty-state-title">Loading Leaderboard</div>
        <div className="empty-state-text">Ranking the top platform earners...</div>
      </div>
    );
  }

  // Extract top 3 for podium
  const topThree = boardData.leaderboard.slice(0, 3);
  
  // Arrange top three in order: 2nd, 1st, 3rd for podium visualization
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push(topThree[1]); // 2nd Place
  if (topThree[0]) podiumOrder.push(topThree[0]); // 1st Place
  if (topThree[2]) podiumOrder.push(topThree[2]); // 3rd Place

  const listEarners = boardData.leaderboard.slice(3);

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Top Earners Leaderboard</h1>
        <p className="page-subtitle">Compete with other users and reach the top spot. Rankings are compiled in real-time.</p>
      </div>

      {/* Current User Rank Bar */}
      <div className="card card-glow" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyHeader: 'space-between', padding: '1rem 1.5rem', background: 'var(--color-primary-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="avatar avatar-sm">
            {session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '700' }}>Your Current Standing</h4>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Keep completing surveys to climb higher!</p>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>
            Rank #{boardData.currentUserRank || 'N/A'}
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>of all active earners</p>
        </div>
      </div>

      {/* Podium Visualization */}
      {topThree.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="leaderboard-podium">
            {podiumOrder.map((user) => {
              const isFirst = user.rank === 1;
              const isSecond = user.rank === 2;
              const isThird = user.rank === 3;
              
              let barClass = 'podium-bar-1';
              let rankClass = 'podium-rank-1';
              let podiumIcon = <Crown size={16} />;
              
              if (isSecond) {
                barClass = 'podium-bar-2';
                rankClass = 'podium-rank-2';
                podiumIcon = <Trophy size={14} />;
              }
              if (isThird) {
                barClass = 'podium-bar-3';
                rankClass = 'podium-rank-3';
                podiumIcon = <Award size={14} />;
              }

              return (
                <div key={user.id} className="podium-item animate-scale-in">
                  <div className="podium-avatar">
                    <div className={`avatar ${isFirst ? 'avatar-lg' : 'avatar-md'}`} style={{ border: isFirst ? '2px solid #fbbf24' : undefined, margin: '0 auto' }}>
                      {user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                    </div>
                    <div className={`podium-rank ${rankClass}`}>
                      {podiumIcon}
                    </div>
                  </div>
                  <div className="podium-name" style={{ marginTop: '0.5rem', fontWeight: user.isCurrentUser ? '700' : undefined, color: user.isCurrentUser ? 'var(--color-primary)' : undefined }}>
                    {user.name} {user.isCurrentUser && '(You)'}
                  </div>
                  <div className="podium-earned">${user.totalEarned.toFixed(2)}</div>
                  <div className={`podium-bar ${barClass}`}></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rest of the Leaderboard Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Ranking Standings</h3>
        </div>

        {listEarners.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p className="empty-state-text">Complete tasks to show up on the rankings board!</p>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: '1rem' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {listEarners.map((user) => (
                  <tr 
                    key={user.id} 
                    style={{ 
                      background: user.isCurrentUser ? 'var(--color-primary-bg)' : undefined,
                      borderLeft: user.isCurrentUser ? '3px solid var(--color-primary)' : undefined
                    }}
                  >
                    <td style={{ fontWeight: '700', color: 'var(--color-text)' }}>
                      #{user.rank}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar avatar-sm" style={{ width: '28px', height: '28px', fontSize: '10px' }}>
                          {user.avatar || user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                        </div>
                        <span style={{ fontWeight: '500', color: user.isCurrentUser ? 'var(--color-primary)' : 'var(--color-text)' }}>
                          {user.name} {user.isCurrentUser && '(You)'}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--color-text)' }}>
                      ${user.totalEarned.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
