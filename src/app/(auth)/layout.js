export default function AuthLayout({ children }) {
  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card">
        {children}
      </div>
    </div>
  );
}
