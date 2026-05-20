import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useStore';
import type { User } from '@/types';

type EmailVerificationState = {
  isVerified: boolean | null;
  user: User | null;
};

export function useEmailVerification(requireVerification: boolean = true): EmailVerificationState {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!requireVerification) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && (user.email_verified_at == null || user.email_verified_at === '')) {
      router.push('/verify-email');
    }
  }, [user, isAuthenticated, _hasHydrated, requireVerification, router]);

  if (!_hasHydrated) {
    return { isVerified: null, user };
  }

  if (!isAuthenticated) {
    return { isVerified: false, user };
  }

  const verified = user?.email_verified_at != null && user.email_verified_at !== '';
  return { isVerified: verified, user };
}
