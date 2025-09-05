'use client';

import { useState } from 'react';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { User } from '@/lib/types';
import { EditUserDialog } from './edit-user-dialog';


export function UserManagementClient() {
  const { users, addUser, deleteUser, currentUser } = useApp();
  const [newUserName, setNewUserName] = useState('');
  const [newUserInitials, setNewUserInitials] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);


  const handleAddUser = () => {
    if (newUserName.trim() && newUserInitials.trim().length === 2) {
      addUser(newUserName.trim(), newUserInitials.trim());
      setNewUserName('');
      setNewUserInitials('');
    }
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };


  return (
    <>
    <div className="max-w-2xl mx-auto">
       <h1 className="text-3xl font-bold mb-6">Benutzerverwaltung</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Neuen Benutzer hinzufügen</CardTitle>
          <CardDescription>Erstellen Sie ein neues Benutzerkonto. Ein Passwort ist nicht erforderlich.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Benutzername"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
              className="flex-grow"
            />
            <Input
              type="text"
              placeholder="Initialen (2 Zeichen)"
              value={newUserInitials}
              onChange={(e) => setNewUserInitials(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
              maxLength={2}
              className="w-40"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddUser} disabled={!newUserName.trim() || newUserInitials.trim().length !== 2}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Benutzer hinzufügen
          </Button>
        </CardFooter>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Vorhandene Benutzer</h2>
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{user.name}</p>
                </div>
                 <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setUserToEdit(user)}
                        title='Benutzer bearbeiten'>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setUserToDelete(user)}
                        disabled={user.id === currentUser?.id || users.length <=1}
                        title={user.id === currentUser?.id ? 'Sie können den aktuell angemeldeten Benutzer nicht löschen.' : 'Benutzer löschen'}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>

    <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                <AlertDialogDescription>
                    Möchten Sie den Benutzer &quot;{userToDelete?.name}&quot; wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden. Alle Aufgaben, bei denen dieser Benutzer der einzige Mitwirkende ist, werden ebenfalls gelöscht.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>Löschen</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    
    {userToEdit && (
        <EditUserDialog
            open={!!userToEdit}
            onOpenChange={(isOpen) => !isOpen && setUserToEdit(null)}
            user={userToEdit}
        />
    )}

    </>
  );
}
