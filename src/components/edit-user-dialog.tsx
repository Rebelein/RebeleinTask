'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { User } from '@/lib/types';

const userFormSchema = z.object({
  name: z.string().min(2, 'Der Name muss mindestens 2 Zeichen lang sein.'),
  initials: z.string().length(2, 'Initialen müssen genau 2 Zeichen lang sein.'),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface EditUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const { updateUser } = useApp();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
        name: user.name,
        initials: user.initials,
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: user.name,
        initials: user.initials,
      });
    }
  }, [user, form, open]);
  
  function onSubmit(data: UserFormValues) {
    updateUser(user.id, {
        name: data.name,
        initials: data.initials.toUpperCase(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Benutzer bearbeiten</DialogTitle>
          <DialogDescription>
            Ändern Sie den Namen und die Initialen des Benutzers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benutzername</FormLabel>
                  <FormControl>
                    <Input placeholder="Vollständiger Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="initials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initialen</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ZB" 
                      maxLength={2} 
                      {...field} 
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                   <FormDescription>
                    Genau 2 Zeichen.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button type="submit">Änderungen speichern</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
