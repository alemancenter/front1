'use client';

import './dashboard.css';
import Sidebar from '@/components/layout/Sidebar';
import DashboardContentWrapper from '@/components/layout/DashboardContentWrapper';
import { useEmailVerification } from '@/hooks/useEmailVerification';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check email verification and redirect if needed
  const { isVerified } = useEmailVerification(true);

  // null = still hydrating; false = not authenticated or not verified (redirect pending)
  if (isVerified === null || isVerified === false) {
    return (
      <div className="dashboard-scope min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-scope min-h-screen relative">
      <Sidebar />
      <DashboardContentWrapper>
        {children}
      </DashboardContentWrapper>
    </div>
  );
}
