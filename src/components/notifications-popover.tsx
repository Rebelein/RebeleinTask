'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Bell, Check } from 'lucide-react';
import { useApp } from '@/context/app-provider';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export function NotificationsPopover() {
  const { notifications, currentUser, getUnreadNotificationCount, markNotificationsAsRead } = useApp();
  
  if (!currentUser) return null;

  const unreadCount = getUnreadNotificationCount(currentUser.id);
  const userNotifications = notifications.filter(n => n.userId === currentUser.id);

  const handleOpenChange = (open: boolean) => {
    if(!open && unreadCount > 0) {
      markNotificationsAsRead(currentUser.id);
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-headline">Benachrichtigungen</CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto p-0">
            {userNotifications.length > 0 ? (
               <div className="divide-y">
                {userNotifications.map(notif => (
                    <div key={notif.id} className={cn("p-4 flex items-start gap-3", !notif.read && "bg-secondary")}>
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <div className="space-y-1">
                            <p className="text-sm">{notif.text}</p>
                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: de })}</p>
                        </div>
                    </div>
                ))}
               </div>
            ) : (
                <p className="text-center text-sm text-muted-foreground p-8">Noch keine Benachrichtigungen.</p>
            )}
          </CardContent>
          {unreadCount > 0 && (
            <CardFooter className='p-2'>
                <Button variant="ghost" className='w-full' onClick={() => markNotificationsAsRead(currentUser.id)}>
                    <Check className='mr-2 h-4 w-4' /> Alle als gelesen markieren
                </Button>
            </CardFooter>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}
