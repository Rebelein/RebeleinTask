
import { UserManagementClient } from '@/components/user-management-client';
import { AppHeader } from '@/components/header';

export default function UserManagementPage() {
  return (
    <div className="w-full">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <UserManagementClient />
      </main>
    </div>
  );
}
