'use client';

import { CheckSquare, Package } from 'lucide-react';
import { UserMenu } from './user-menu';
import { NotificationsPopover } from './notifications-popover';
import { NewTaskDialog } from './new-task-dialog';
import { useApp } from '@/context/app-provider';
import { Button } from './ui/button';
import { OrderListSheet } from './order-list-sheet';
import { useState } from 'react';

export function AppHeader() {
  const { currentUser } = useApp();
  const [isOrderSheetOpen, setOrderSheetOpen] = useState(false);

  // Don't render the header if there is no user selected yet
  if (!currentUser) {
    return null;
  }

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <a href="/" className="flex items-center space-x-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <span className="inline-block font-bold text-lg font-headline">RebeleinTask</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
             <Button variant="ghost" size="icon" className="h-9 w-9 xl:hidden" onClick={() => setOrderSheetOpen(true)}>
              <Package className="h-5 w-5" />
              <span className="sr-only">Bestellliste</span>
            </Button>
            <NewTaskDialog />
            <NotificationsPopover />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
    <OrderListSheet open={isOrderSheetOpen} onOpenChange={setOrderSheetOpen} />
    </>
  );
}
