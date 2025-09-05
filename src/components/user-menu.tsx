'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/context/app-provider';
import Link from 'next/link';
import { Users as UsersIcon, LogOut, FileText } from 'lucide-react';

export function UserMenu() {
  const { users, currentUser, setCurrentUser } = useApp();

  if (!currentUser) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{currentUser.initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              Angemeldet als {currentUser.name}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Benutzer wechseln</DropdownMenuLabel>
        {users.filter(u => u.id !== currentUser.id).map(user => (
          <DropdownMenuItem key={user.id} onSelect={() => setCurrentUser(user)}>
            {user.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
         <Link href="/templates" passHref>
          <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Vorlagen verwalten</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/users" passHref>
          <DropdownMenuItem>
              <UsersIcon className="mr-2 h-4 w-4" />
              <span>Benutzer verwalten</span>
          </DropdownMenuItem>
        </Link>
         <DropdownMenuItem onSelect={() => setCurrentUser(null)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Abmelden</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
