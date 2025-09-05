
import { TemplateManagementClient } from '@/components/template-management-client';
import { AppHeader } from '@/components/header';

export default function TemplateManagementPage() {
  return (
    <div className="w-full">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <TemplateManagementClient />
      </main>
    </div>
  );
}
