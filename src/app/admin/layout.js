'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading' || !session || session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div className="animate-spin" style={{ fontSize: '2rem' }}>🟢</div>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Verifying admin credentials...</p>
      </div>
    );
  }

  return <>{children}</>;
}
