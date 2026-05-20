'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  ClipboardList, 
  Clock, 
  Users, 
  CheckCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Award
} from 'lucide-react';

export default function SurveysPage() {
  const { data: session } = useSession();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // Active survey flow state
  const [activeSurvey, setActiveSurvey] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submittingSurvey, setSubmittingSurvey] = useState(false);
  
  // Celebration state
  const [earnedAmount, setEarnedAmount] = useState(null);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        setSurveys(data.surveys);
      }
    } catch (err) {
      console.error('Error fetching surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchSurveys();
    }
  }, [session]);

  const startSurveyFlow = (survey) => {
    setActiveSurvey(survey);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setEarnedAmount(null);
  };

  const selectOption = (questionId, optionText) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionText
    }));
  };

  const handleTextAnswer = (questionId, text) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < activeSurvey.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      submitSurvey();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const submitSurvey = async () => {
    setSubmittingSurvey(true);
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId: activeSurvey.id,
          answers,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEarnedAmount(data.earned);
        
        // Dispatch balance update
        window.dispatchEvent(new Event('balanceUpdated'));
      } else {
        alert(data.error || 'Failed to submit survey');
        setActiveSurvey(null);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('An error occurred during submission.');
      setActiveSurvey(null);
    } finally {
      setSubmittingSurvey(false);
    }
  };

  const closeCelebration = () => {
    setEarnedAmount(null);
    setActiveSurvey(null);
    fetchSurveys(); // Reload surveys list to mark completed
  };

  // Get list of unique categories
  const categories = ['All', 'Real Paid Surveys', ...new Set(surveys.map(s => s.category))];

  const filteredSurveys = activeTab === 'All' 
    ? surveys 
    : surveys.filter(s => s.category === activeTab);

  const getQuestionProgressPercent = () => {
    if (!activeSurvey) return 0;
    return ((currentQuestionIdx + 1) / activeSurvey.questions.length) * 100;
  };

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Market Research Surveys</h1>
        <p className="page-subtitle">Participate in brand research studies and earn cash rewards instantly.</p>
      </div>

      {/* Tabs / Filters */}
      <div className="tabs">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveTab(cat)}
            className={`tab ${activeTab === cat ? 'tab-active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {activeTab === 'Real Paid Surveys' ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '750px', gap: '1rem' }}>
          {(!process.env.NEXT_PUBLIC_CPX_APP_ID) && (
            <div className="alert alert-warning gap-2" style={{ marginBottom: '0.5rem' }}>
              <span>💡</span>
              <span style={{ fontSize: '13px' }}><strong>CPX Research Sandbox Mode:</strong> Add your real <code>NEXT_PUBLIC_CPX_APP_ID</code> in production to display your real paid survey wall. Currently using a demo App ID.</span>
            </div>
          )}
          <div className="card" style={{ flex: 1, padding: '0', overflow: 'hidden', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)' }}>
            <iframe
              src={`https://offers.cpx-research.com/index.php?app_id=${process.env.NEXT_PUBLIC_CPX_APP_ID || '24566'}&ext_user_id=${session?.user?.id || 'guest'}&email=${encodeURIComponent(session?.user?.email || '')}&username=${encodeURIComponent(session?.user?.name || '')}`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="CPX Research Real Surveys"
            />
          </div>
        </div>
      ) : loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton skeleton-card" style={{ height: '260px', borderRadius: 'var(--radius-xl)' }}></div>
          ))}
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No Surveys Available</div>
          <div className="empty-state-text">Check back soon for new research tasks or invite your friends.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredSurveys.map((s) => (
            <div 
              key={s.id} 
              className={`survey-card ${s.completed ? 'survey-card-completed' : ''}`}
            >
              <div className="survey-card-header">
                <span className="badge badge-primary">{s.category}</span>
                <span className="survey-card-reward">${s.reward.toFixed(2)}</span>
              </div>
              <h3 className="survey-card-title">{s.title}</h3>
              <p className="survey-card-desc">{s.description}</p>
              
              <div className="survey-card-meta">
                <span className="survey-card-meta-item">
                  <Clock size={14} /> {s.timeMinutes} min
                </span>
                <span className="survey-card-meta-item">
                  <Users size={14} /> {s.filledSlots} / {s.totalSlots} Slots
                </span>
              </div>

              {/* Progress bar */}
              <div className="survey-card-slots">
                <div className="survey-card-slots-text">
                  <span>Quota filled</span>
                  <span>{Math.round((s.filledSlots / s.totalSlots) * 100)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${(s.filledSlots / s.totalSlots) * 100}%` }}
                  ></div>
                </div>
              </div>

              {s.completed ? (
                <button className="btn btn-secondary" style={{ width: '100%' }} disabled>
                  <CheckCircle size={16} /> Completed
                </button>
              ) : (
                <button 
                  onClick={() => startSurveyFlow(s)}
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                >
                  Start Survey
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SURVEY FLOW MODAL */}
      {activeSurvey && !earnedAmount && (
        <div className="modal-overlay">
          <div className="modal survey-modal animate-scale-in">
            <div className="modal-header">
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.25rem' }}>{activeSurvey.category}</span>
                <h2 className="modal-title">{activeSurvey.title}</h2>
              </div>
              <button className="modal-close" onClick={() => setActiveSurvey(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Progress */}
            <div className="survey-progress">
              <div className="survey-progress-text">
                <span>Question {currentQuestionIdx + 1} of {activeSurvey.questions.length}</span>
                <span>{Math.round(getQuestionProgressPercent())}% Completed</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${getQuestionProgressPercent()}%` }}
                ></div>
              </div>
            </div>

            {/* Current Question */}
            {(() => {
              const q = activeSurvey.questions[currentQuestionIdx];
              return (
                <div className="survey-question">
                  <h3 className="survey-question-title">{q.title}</h3>
                  
                  {/* Choices / Ratings */}
                  {(q.type === 'choice' || q.type === 'rating') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {q.options.map((opt) => {
                        const isSelected = answers[q.id] === opt;
                        return (
                          <div 
                            key={opt}
                            onClick={() => selectOption(q.id, opt)}
                            className={`survey-option ${isSelected ? 'survey-option-selected' : ''}`}
                          >
                            <div className="survey-option-radio"></div>
                            <span style={{ fontSize: '14px', fontWeight: '500', color: isSelected ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Input */}
                  {q.type === 'text' && (
                    <div className="input-group">
                      <textarea
                        className="input"
                        placeholder="Write your answer here..."
                        value={answers[q.id] || ''}
                        onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                        rows={4}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Actions */}
            <div className="survey-actions">
              <button 
                onClick={handlePrev}
                disabled={currentQuestionIdx === 0 || submittingSurvey}
                className="btn btn-secondary"
              >
                <ChevronLeft size={16} /> Back
              </button>
              
              <button
                onClick={handleNext}
                disabled={submittingSurvey || !answers[activeSurvey.questions[currentQuestionIdx].id]}
                className="btn btn-primary"
              >
                {currentQuestionIdx === activeSurvey.questions.length - 1 
                  ? (submittingSurvey ? 'Submitting...' : 'Submit Survey') 
                  : <>Next <ChevronRight size={16} /></>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CELEBRATION OVERLAY */}
      {earnedAmount && (
        <div className="celebration-overlay">
          <div className="celebration-card animate-scale-in">
            <div className="celebration-icon">🎉</div>
            <h2 className="celebration-title">Survey Completed!</h2>
            <div className="celebration-amount">+${earnedAmount.toFixed(2)} USD</div>
            <p className="celebration-text">
              Your research contribution has been logged in the platform ledger. Payout credited instantly to your wallet.
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
