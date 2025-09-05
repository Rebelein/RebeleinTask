
'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { OrderList } from './order-list';
import { Package } from 'lucide-react';

interface OrderListSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderListSheet({ open, onOpenChange }: OrderListSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
            <SheetTitle className='flex items-center gap-2 font-headline'>
                <Package className="h-6 w-6" />
                Materialbestellung
            </SheetTitle>
            <SheetDescription>
                Artikel, die vom Lageristen bestellt werden müssen.
            </SheetDescription>
        </SheetHeader>
        <div className="flex-grow min-h-0">
          <OrderList />
        </div>
      </SheetContent>
    </Sheet>
  );
}
