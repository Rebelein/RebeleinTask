'use client';

import { useState, useEffect } from 'react';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusCircle, Trash2, Users, SignalHigh, SignalMedium, SignalLow, LinkIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import type { Task } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';

const taskFormSchema = z.object({
  title: z.string().min(3, 'Der Titel muss mindestens 3 Zeichen lang sein.'),
  description: z.string().optional(),
  collaboratorIds: z.array(z.string()).min(1, 'Es muss mindestens ein Mitwirkender ausgewählt werden.'),
  priority: z.enum(['low', 'medium', 'high']),
  hasDueDate: z.boolean().default(false),
  dueDate: z.date().optional(),
  subtasks: z.array(z.object({ text: z.string().min(1, 'Teilaufgabe darf nicht leer sein.') })).optional(),
  dependsOn: z.array(z.string()).optional(),
}).refine(data => {
    if (data.hasDueDate) {
      return !!data.dueDate;
    }
    return true;
}, {
    message: 'Ein Fälligkeitsdatum ist erforderlich.',
    path: ['dueDate'],
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface EditTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task;
}

export function EditTaskDialog({ open, onOpenChange, task }: EditTaskDialogProps) {
  const { users, currentUser, updateTask, tasks } = useApp();
  const [dependencySearch, setDependencySearch] = useState('');

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        description: task.description,
        collaboratorIds: task.collaboratorIds,
        priority: task.priority || 'medium',
        hasDueDate: !!task.dueDate,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        subtasks: task.subtasks ? Object.values(task.subtasks).map(s => ({ text: s.text })) : [],
        dependsOn: task.dependsOn || [],
      });
    }
  }, [task, form, open]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "subtasks",
  });
  
  const hasDueDate = form.watch('hasDueDate');
  const watchedDependencies = form.watch('dependsOn') || [];

  function onSubmit(data: TaskFormValues) {
    if (!currentUser) return;

    updateTask(task.id, {
      title: data.title,
      description: data.description || '',
      collaboratorIds: data.collaboratorIds,
      priority: data.priority,
      dueDate: data.hasDueDate && data.dueDate ? data.dueDate.toISOString() : null,
      subtasks: data.subtasks,
      dependsOn: data.dependsOn,
    });
    
    onOpenChange(false);
  }

  const selectedCollaborators = users.filter(user => {
    const watchedIds = form.watch('collaboratorIds');
    return watchedIds && watchedIds.includes(user.id);
  });

  const availableTasksForDependency = tasks.filter(t => 
    t.id !== task.id && // Cannot depend on itself
    !watchedDependencies.includes(t.id) && // Not already a dependency
    !(task.blocks || []).includes(t.id) && // Cannot depend on a task it blocks
    (t.title.toLowerCase().includes(dependencySearch.toLowerCase()) || dependencySearch === '')
  );


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>Aufgabe bearbeiten</DialogTitle>
          <DialogDescription>
            Aktualisieren Sie die Details der Aufgabe unten.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className='space-y-4 p-1'>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titel</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Gestalten Sie die neue Homepage" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Teilaufgaben</FormLabel>
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

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beschreibung</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Fügen Sie weitere Details zur Aufgabe hinzu..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dependsOn"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel>Abhängigkeiten</FormLabel>
                       <FormDescription>Diese Aufgabe kann erst gestartet werden, wenn die folgenden Aufgaben abgeschlossen sind.</FormDescription>
                       <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="outline" className='w-full justify-start font-normal'>
                              <LinkIcon className='mr-2 h-4 w-4' />
                              {watchedDependencies.length > 0 ? `${watchedDependencies.length} Aufgabe(n) ausgewählt` : "Aufgaben auswählen"}
                           </Button>
                        </PopoverTrigger>
                         <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                           <Command>
                             <CommandInput 
                                placeholder="Aufgaben suchen..." 
                                value={dependencySearch} 
                                onValueChange={setDependencySearch}
                              />
                             <CommandList>
                               <CommandEmpty>Keine Aufgaben gefunden.</CommandEmpty>
                               <CommandGroup>
                                 {availableTasksForDependency.map(depTask => (
                                    <CommandItem
                                      key={depTask.id}
                                      value={depTask.title}
                                      onSelect={() => {
                                         field.onChange([...watchedDependencies, depTask.id]);
                                      }}
                                    >
                                     {depTask.title}
                                    </CommandItem>
                                 ))}
                               </CommandGroup>
                             </CommandList>
                           </Command>
                         </PopoverContent>
                       </Popover>
                       {watchedDependencies.length > 0 && (
                          <div className='mt-2 space-y-2'>
                             {watchedDependencies.map(depId => {
                                const depTask = tasks.find(t => t.id === depId);
                                if (!depTask) return null;
                                return (
                                   <div key={depId} className='flex items-center justify-between p-2 text-sm bg-secondary rounded-md'>
                                      <span>{depTask.title}</span>
                                      <Button variant="ghost" size="icon" className='h-6 w-6' onClick={() => {
                                         field.onChange(watchedDependencies.filter(id => id !== depId));
                                      }}>
                                         <X className='h-4 w-4' />
                                      </Button>
                                   </div>
                                )
                             })}
                          </div>
                       )}
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="collaboratorIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mitwirkende</FormLabel>
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
                                      "Wählen Sie Mitwirkende"
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
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priorität</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  <div>
                      <FormField
                        control={form.control}
                        name="hasDueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg py-2">
                            <FormLabel className="font-normal">Fälligkeitsdatum festlegen?</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      {hasDueDate && (
                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={'outline'}
                                      className={cn(
                                        'w-full pl-3 text-left font-normal',
                                        !field.value && 'text-muted-foreground'
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, 'PPP', { locale: de })
                                      ) : (
                                        <span>Wählen Sie ein Datum</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                    initialFocus
                                    locale={de}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage className="pt-1"/>
                            </FormItem>
                          )}
                        />
                      )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button type="submit">Änderungen speichern</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
