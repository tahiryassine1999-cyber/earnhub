export function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'EH-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getTransactionTypeLabel(type) {
  const labels = {
    SURVEY_REWARD: 'Survey Reward',
    OFFER_REWARD: 'Offer Reward',
    REFERRAL_BONUS: 'Referral Bonus',
    WITHDRAWAL: 'Withdrawal',
    DAILY_BONUS: 'Daily Bonus',
    ADMIN_ADJUSTMENT: 'Admin Adjustment',
  };
  return labels[type] || type;
}

export function getTransactionTypeColor(type) {
  const colors = {
    SURVEY_REWARD: 'var(--color-success)',
    OFFER_REWARD: 'var(--color-info)',
    REFERRAL_BONUS: 'var(--color-warning)',
    WITHDRAWAL: 'var(--color-danger)',
    DAILY_BONUS: 'var(--color-primary)',
    ADMIN_ADJUSTMENT: 'var(--color-muted)',
  };
  return colors[type] || 'var(--color-muted)';
}

export function getDifficultyColor(difficulty) {
  const colors = {
    EASY: 'var(--color-success)',
    MEDIUM: 'var(--color-warning)',
    HARD: 'var(--color-danger)',
  };
  return colors[difficulty] || 'var(--color-muted)';
}

export function getCategoryIcon(category) {
  const icons = {
    APP_INSTALL: '📱',
    SIGNUP: '📝',
    PURCHASE: '🛒',
    VIDEO: '🎬',
    GAME: '🎮',
    'Market Research': '📊',
    'Consumer Habits': '🛍️',
    'Technology': '💻',
    'Lifestyle': '🌟',
    'Health': '❤️',
    'Entertainment': '🎭',
    'Education': '📚',
    'Finance': '💰',
  };
  return icons[category] || '📋';
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
