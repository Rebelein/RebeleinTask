'use client';

import { useApp } from '@/context/app-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CheckSquare } from 'lucide-react';

export function ChooseUserScreen() {
  const { users, setCurrentUser } = useApp();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/50 p-4">
       <div className="flex items-center space-x-2 mb-8">
            <CheckSquare className="h-8 w-8 text-primary" />
            <span className="inline-block font-bold text-3xl font-headline">RebeleinTask</span>
        </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Wer sind Sie?</CardTitle>
          <CardDescription>Bitte wählen Sie Ihren Benutzer aus, um fortzufahren.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setCurrentUser(user)}
                className="w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors hover:bg-secondary"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.name}</span>
              </button>
            ))}
          </div>
          {users.length === 0 && (
            <p className="text-center text-sm text-muted-foreground p-4">
              Keine Benutzer gefunden. Erstellen Sie einen auf der {' '}
              <a href="/users" className="underline">Benutzerverwaltungsseite</a>.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
