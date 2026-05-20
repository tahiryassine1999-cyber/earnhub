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
  Zap 
} from 'lucide-react';

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <div className="landing-logo-icon">🟢</div>
          <span>EarnHub</span>
        </div>
        <div className="landing-nav-links">
          <Link href="/login" className="landing-nav-link">Login</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-badge">
            <Zap size={14} />
            <span>Start Earning Today — Sign Up Bonus Active!</span>
          </div>
          <h1 className="landing-title">
            Earn Real Cash with <br />
            <span className="landing-title-gradient">Surveys &amp; Offers</span>
          </h1>
          <p className="landing-subtitle">
            Join the most rewarding platform online. Voice your opinion on hot topics, try out new apps, complete high-paying tasks, and cash out instantly.
          </p>
          <div className="landing-cta">
            <Link href="/register" className="btn btn-primary">
              Create Free Account <ChevronRight size={18} />
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>

          {/* Landing Stats */}
          <div className="landing-stats">
            <div className="landing-stat">
              <div className="landing-stat-value">$248,394</div>
              <div className="landing-stat-label">Total Paid Out</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value">5.00 min</div>
              <div className="landing-stat-label">Avg. Cashout Time</div>
            </div>
            <div className="landing-stat">
              <div className="landing-stat-value">4.8 / 5.0</div>
              <div className="landing-stat-label">TrustScore Rating</div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="landing-features">
        <h2 className="landing-section-title">Why Choose EarnHub?</h2>
        <p className="landing-section-subtitle">
          We work with top-tier advertisers and survey providers to deliver the highest payouts in the industry.
        </p>

        <div className="grid-3">
          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Layers size={28} />
            </div>
            <h3 className="feature-title">Top Offer Walls</h3>
            <p className="feature-text">
              Try premium products, download trending games, and sign up for interesting trials. Earn up to $45.00 per completion.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
              <Award size={28} />
            </div>
            <h3 className="feature-title">High Payout Surveys</h3>
            <p className="feature-text">
              Share your thoughts on products, entertainment, business, and remote work. Get credited immediately upon survey completion.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
              <Wallet size={28} />
            </div>
            <h3 className="feature-title">Instant Withdrawals</h3>
            <p className="feature-text">
              Request cashout starting at just $5.00. We support PayPal, Bitcoin, Ethereum, and hundreds of top brand gift cards.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-how">
        <h2 className="landing-section-title">How It Works</h2>
        <p className="landing-section-subtitle">
          Get started in less than 2 minutes by following three simple steps.
        </p>

        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-number">1</div>
            <h3 className="how-step-title">Create Account</h3>
            <p className="how-step-text">
              Sign up for a free account. Use a referral link to get a $1.00 welcome bonus immediately!
            </p>
          </div>

          <div className="how-step">
            <div className="how-step-number">2</div>
            <h3 className="how-step-title">Complete Tasks</h3>
            <p className="how-step-text">
              Choose from dozens of active surveys, games, app installs, and videos that match your profile.
            </p>
          </div>

          <div className="how-step">
            <div className="how-step-number">3</div>
            <h3 className="how-step-title">Get Paid</h3>
            <p className="how-step-text">
              Select your payment method and withdraw. Payments are processed instantly and hit your wallet within minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>&copy; {new Date().getFullYear()} EarnHub Inc. All rights reserved. Built with Next.js and Prisma.</p>
      </footer>
    </div>
  );
}
