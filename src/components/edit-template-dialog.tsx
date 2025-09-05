'use client';

import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, SignalHigh, SignalMedium, SignalLow, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { TaskTemplate } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from './ui/command';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const templateFormSchema = z.object({
  name: z.string().min(3, 'Der Name muss mindestens 3 Zeichen lang sein.'),
  title: z.string().min(3, 'Der Titel muss mindestens 3 Zeichen lang sein.'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  subtasks: z.array(z.object({ text: z.string().min(1, 'Teilaufgabe darf nicht leer sein.') })).optional(),
  collaboratorIds: z.array(z.string()).optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface EditTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TaskTemplate;
}

export function EditTemplateDialog({ open, onOpenChange, template }: EditTemplateDialogProps) {
  const { updateTemplate, users } = useApp();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
  });

  useEffect(() => {
    if (open && template) {
      form.reset({
        name: template.name,
        title: template.title,
        description: template.description,
        priority: template.priority,
        subtasks: template.subtasks.map(text => ({ text })),
        collaboratorIds: template.collaboratorIds || [],
      });
    }
  }, [open, template, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });

  function onSubmit(data: TemplateFormValues) {
    updateTemplate(template.id, {
        name: data.name,
        title: data.title,
        description: data.description,
        priority: data.priority,
        subtasks: data.subtasks?.map(s => s.text) || [],
        collaboratorIds: data.collaboratorIds || [],
    });
    onOpenChange(false);
  }
  
  const selectedCollaborators = users.filter(user => form.watch('collaboratorIds')?.includes(user.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Vorlage bearbeiten</DialogTitle>
          <DialogDescription>
            Aktualisieren Sie die Details der Vorlage.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vorlagenname</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Neukunden-Onboarding" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aufgabentitel</FormLabel>
                  <FormControl>
                    <Input placeholder="Standardtitel für die Aufgabe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standard-Priorität</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Priorität auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">
                            <div className='flex items-center gap-2'>
                               <SignalLow className='h-4 w-4 text-blue-500' /> Niedrig
                            </div>
                        </SelectItem>
                        <SelectItem value="medium">
                             <div className='flex items-center gap-2'>
                               <SignalMedium className='h-4 w-4 text-yellow-500' /> Mittel
                            </div>
                        </SelectItem>
                        <SelectItem value="high">
                             <div className='flex items-center gap-2'>
                               <SignalHigh className='h-4 w-4 text-red-500' /> Hoch
                            </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="collaboratorIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standard-Mitwirkende</FormLabel>
                     <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                           <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value?.length && "text-muted-foreground"
                            )}
                          >
                             <div className="flex gap-1 items-center">
                                <Users className="h-4 w-4" />
                                {selectedCollaborators.length > 0 ? (
                                   <div className="flex flex-wrap gap-1">
                                    {selectedCollaborators.slice(0, 2).map(user => <Badge key={user.id} variant="secondary">{user.name}</Badge>)}
                                    {selectedCollaborators.length > 2 && <Badge variant="secondary">+{selectedCollaborators.length - 2}</Badge>}
                                   </div>
                                ) : (
                                  "Mitwirkende auswählen"
                                )}
                            </div>
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                       <PopoverContent className="w-[250px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Benutzer suchen..." />
                          <CommandEmpty>Keine Benutzer gefunden.</CommandEmpty>
                          <CommandGroup>
                            {users.map((user) => (
                              <CommandItem
                                key={user.id}
                                onSelect={() => {
                                  const selected = field.value || [];
                                  const newSelected = selected.includes(user.id)
                                    ? selected.filter((id) => id !== user.id)
                                    : [...selected, user.id];
                                  field.onChange(newSelected);
                                }}
                              >
                                <Checkbox
                                  checked={field.value?.includes(user.id)}
                                  className="mr-2"
                                />
                                {user.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Standardbeschreibung für die Aufgabe..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Standard-Teilaufgaben</FormLabel>
                <div className="space-y-2 mt-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <FormField
                            control={form.control}
                            name={`subtasks.${index}.text`}
                            render={({ field }) => (
                                <FormItem className='flex-grow'>
                                <FormControl>
                                    <Input placeholder={`Teilaufgabe ${index + 1}`} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                             <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                     <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => append({ text: "" })}
                        >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Teilaufgabe hinzufügen
                    </Button>
                </div>
            </div>
            
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
