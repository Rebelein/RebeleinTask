'use client';

import { DashboardClient } from '@/components/dashboard-client';
import { useApp } from '@/context/app-provider';
import { ChooseUserScreen } from '@/components/choose-user-screen';

export default function Home() {
  const { currentUser, loading } = useApp();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* You can add a more sophisticated loading spinner here */}
        <p>Anwendung wird geladen...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <ChooseUserScreen />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start">
      <DashboardClient />
    </main>
  );
}
