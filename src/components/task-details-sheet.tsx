
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Task } from '@/lib/types';
import { useApp } from '@/context/app-provider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '@/components/ui/sheet';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, MessageSquare, List, Info, Users, CheckCircle2, CircleDot, Trash2, Pencil, Sparkles, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { cn, formatDate, formatTime } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { EditTaskDialog } from './edit-task-dialog';
import { getSummary } from '@/app/actions';
import Link from 'next/link';

interface TaskDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export function TaskDetailsSheet({ open, onOpenChange, task }: TaskDetailsSheetProps) {
  const { users, currentUser, toggleSubtask, addComment, updateTaskStatus, deleteTask, tasks } = useApp();
  const [newComment, setNewComment] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [summary, setSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  if (!currentUser) return null;

  const creator = users.find(u => u.id === task.creatorId);
  const collaborators = users.filter(u => task.collaboratorIds.includes(u.id));

  const subtasksArray = task.subtasks ? Object.values(task.subtasks) : [];
  const commentsArray = task.comments ? Object.values(task.comments) : [];
  const activityLogArray = task.activityLog ? Object.values(task.activityLog) : [];
  
  const completedSubtasks = subtasksArray.filter(s => s.completed).length;
  const allSubtasksCompleted = subtasksArray.length > 0 && completedSubtasks === subtasksArray.length;
  const isCompleted = task.status === 'completed';

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;

  const blockingTasks = (task.dependsOn || [])
    .map(id => tasks.find(t => t.id === id))
    .filter((t): t is Task => !!t && t.status === 'open');
  const isBlocked = blockingTasks.length > 0;

  const blockedByThisTask = (task.blocks || [])
    .map(id => tasks.find(t => t.id === id))
    .filter((t): t is Task => !!t);

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment.trim());
      setNewComment('');
    }
  };
  
  const handleDeleteTask = () => {
    deleteTask(task.id);
    setIsDeleteDialogOpen(false);
    onOpenChange(false);
  }

  const handleGetSummary = async () => {
    setIsSummaryLoading(true);
    setSummary('');
    const summaryText = await getSummary({
        taskTitle: task.title,
        taskDescription: task.description,
        activities: activityLogArray.map(a => a.text)
    });
    setSummary(summaryText);
    setIsSummaryLoading(false);
  }


  return (
    <>
    <Sheet open={open} onOpenChange={(isOpen) => {
        if(!isOpen) {
            setDeleteConfirmation('');
            setSummary('');
        }
        onOpenChange(isOpen)
    }}>
      <SheetContent className="w-full p-0 flex flex-col sm:max-w-2xl">
        <SheetHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
          <div className="flex justify-between items-start">
            <SheetTitle className={cn("text-2xl font-headline pr-4", isCompleted && "line-through")}>{task.title}</SheetTitle>
            {!isCompleted && (
              <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
            )}
          </div>
          <SheetDescription>{task.description}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 pb-4 sm:px-6 border-b">
            <div className="flex items-center text-sm text-muted-foreground" title={`Erstellt von ${creator?.name} am ${formatDate(task.createdAt)}`}>
                <User className="mr-1.5 h-4 w-4" />
                <span>{creator?.name}</span>
            </div>
            {task.dueDate && (
             <div className="flex items-center text-sm text-muted-foreground" title={`Fällig am ${formatDate(task.dueDate)}`}>
                <Calendar className="mr-1.5 h-4 w-4" />
                <span>{formatDate(task.dueDate)}</span>
                {isOverdue && <Badge variant="destructive" className="ml-2">Überfällig</Badge>}
            </div>
            )}
             {isCompleted && (
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
                <span>Erledigt</span>
              </div>
            )}
        </div>
        
        <ScrollArea className="flex-grow">
         <div className="space-y-6 p-4 sm:p-6">
            
            {isBlocked && (
                <div className='p-4 rounded-lg bg-yellow-50 border border-yellow-200'>
                    <h3 className='font-semibold flex items-center text-yellow-800'><AlertTriangle className="mr-2 h-5 w-5"/>Aufgabe blockiert</h3>
                    <p className='text-sm text-yellow-700 mt-1'>Diese Aufgabe kann nicht bearbeitet oder abgeschlossen werden, da sie von den folgenden, noch nicht erledigten Aufgaben abhängt:</p>
                    <ul className='list-disc pl-5 mt-2 text-sm space-y-1'>
                       {blockingTasks.map(t => (
                        <li key={t.id}>
                            <span className="font-medium text-yellow-800">{t.title}</span>
                        </li>
                       ))}
                    </ul>
                </div>
            )}

            {/* Dependencies */}
            {(blockedByThisTask.length > 0 || (task.dependsOn && task.dependsOn.length > 0)) && (
            <div>
                <h3 className="font-semibold mb-2 flex items-center"><LinkIcon className="mr-2 h-5 w-5"/>Abhängigkeiten</h3>
                <div className="space-y-3">
                   {(task.dependsOn && task.dependsOn.length > 0) && (
                       <div>
                            <h4 className='text-sm font-medium text-muted-foreground mb-1'>Hängt ab von:</h4>
                            {task.dependsOn.map(depId => {
                                const depTask = tasks.find(t => t.id === depId);
                                if (!depTask) return null;
                                return (
                                    <div key={depId} className='flex items-center gap-2 p-2 bg-secondary rounded-md text-sm'>
                                        <span className={cn(depTask.status === 'completed' && 'line-through text-muted-foreground')}>{depTask.title}</span>
                                        {depTask.status === 'completed' && <CheckCircle2 className='h-4 w-4 text-green-600' />}
                                    </div>
                                )
                            })}
                       </div>
                   )}
                   {blockedByThisTask.length > 0 && (
                        <div>
                            <h4 className='text-sm font-medium text-muted-foreground mb-1'>Blockiert:</h4>
                             {blockedByThisTask.map(depTask => (
                                <div key={depTask.id} className='flex items-center gap-2 p-2 bg-secondary rounded-md text-sm'>
                                    <span>{depTask.title}</span>
                                </div>
                            ))}
                        </div>
                   )}
                </div>
            </div>
            )}

            {/* Subtasks */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center"><List className="mr-2 h-5 w-5"/>Checkliste</h3>
              <div className="space-y-2">
                {subtasksArray.map(subtask => (
                  <div key={subtask.id} className="flex items-start space-x-3 p-2 rounded-md hover:bg-secondary transition-colors">
                    <Checkbox id={subtask.id} checked={subtask.completed} onCheckedChange={() => toggleSubtask(task.id, subtask.id)} className='mt-1' disabled={isCompleted || isBlocked} />
                    <label htmlFor={subtask.id} className={cn("text-sm flex-1", subtask.completed && "line-through text-muted-foreground", (isCompleted || isBlocked) && "cursor-not-allowed")}>
                      {subtask.text}
                    </label>
                  </div>
                ))}
                 {subtasksArray.length === 0 && <p className='text-sm text-muted-foreground'>Keine Teilaufgaben für diesen Punkt.</p>}
              </div>
            </div>

            {/* Complete / Reopen Task Button */}
             <div className="flex items-center gap-2">
                {isCompleted ? (
                   <Button variant="outline" onClick={() => updateTaskStatus(task.id, 'open')}>
                      <CircleDot className="mr-2 h-4 w-4" />
                      Als &apos;offen&apos; markieren
                   </Button>
                ) : (
                    (allSubtasksCompleted || subtasksArray.length === 0) &&
                       <Button variant="default" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => updateTaskStatus(task.id, 'completed')} disabled={isBlocked}>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Aufgabe als erledigt markieren
                       </Button>
                )}
                {isCompleted && (
                    <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Löschen
                    </Button>
                )}
              </div>

            {/* Comments */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center"><MessageSquare className="mr-2 h-5 w-5" />Kommentare</h3>
              <div className="space-y-4">
                {commentsArray.map(comment => {
                  const author = users.find(u => u.id === comment.authorId);
                  return (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{author?.initials}</AvatarFallback>
                      </Avatar>
                      <div className="w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">{author?.name}</span>
                          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: de })}</span>
                        </div>
                        <p className="text-sm text-muted-foreground bg-secondary p-2 rounded-md mt-1">{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
                {commentsArray.length === 0 && <p className='text-sm text-muted-foreground'>Noch keine Kommentare.</p>}
              </div>
            </div>
            
            {/* AI Summary */}
            <div>
                 <div className='flex justify-between items-center mb-2'>
                    <h3 className="font-semibold flex items-center"><Sparkles className="mr-2 h-5 w-5 text-yellow-500"/>KI-Zusammenfassung</h3>
                    <Button variant="ghost" size="sm" onClick={handleGetSummary} disabled={isSummaryLoading}>
                        {isSummaryLoading ? "Wird geladen..." : "Zusammenfassen"}
                    </Button>
                </div>
                 {summary && (
                    <div className="p-3 rounded-md bg-secondary text-sm text-secondary-foreground prose-p:my-2 prose-ul:my-2">
                       {summary.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                    </div>
                 )}
                 {isSummaryLoading && (
                    <div className='p-3 rounded-md bg-secondary'>
                        <div className="h-4 bg-muted-foreground/20 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-muted-foreground/20 rounded w-1/2 animate-pulse mt-2"></div>
                    </div>
                 )}
            </div>

            {/* Activity Log */}
            <div>
                <div className='flex justify-between items-center mb-2'>
                    <h3 className="font-semibold flex items-center"><Info className="mr-2 h-5 w-5"/>Aktivität</h3>
                </div>
              <div className="space-y-3 text-sm text-muted-foreground">
                {activityLogArray.slice().reverse().map(activity => (
                    <div key={activity.id} className="flex items-start">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-border" />
                        <p className="ml-4">{activity.text} &middot; <span className="text-xs">{formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true, locale: de })}</span></p>
                    </div>
                ))}
              </div>
            </div>

            {/* Collaborators */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center"><Users className="mr-2 h-5 w-5"/>Mitwirkende</h3>
              <div className="flex flex-wrap gap-2">
                {collaborators.map(c => (
                  <div key={c.id} className="flex items-center space-x-2 p-2 rounded-md bg-secondary">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{c.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </ScrollArea>

        <SheetFooter className="p-4 bg-card border-t sm:p-6">
            <div className="flex w-full items-start space-x-3">
            <Avatar className="h-8 w-8 mt-1">
                <AvatarFallback>{currentUser.initials}</AvatarFallback>
            </Avatar>
            <div className="w-full space-y-2">
                <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Schreiben Sie einen Kommentar..." disabled={isCompleted || isBlocked} />
                <Button onClick={handleAddComment} disabled={!newComment.trim() || isCompleted || isBlocked}>Kommentar hinzufügen</Button>
            </div>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
    
    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Aufgabe wirklich löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                   Diese Aktion kann nicht rückgängig gemacht werden. Geben Sie zur Bestätigung &quot;Löschen&quot; ein.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
                <Label htmlFor="delete-confirm" className="sr-only">Bestätigung</Label>
                <Input 
                    id="delete-confirm"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder='Geben Sie "Löschen" ein...'
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>Abbrechen</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={handleDeleteTask} 
                    disabled={deleteConfirmation !== 'Löschen'}
                    className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                    Endgültig löschen
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <EditTaskDialog
      open={isEditDialogOpen}
      onOpenChange={setIsEditDialogOpen}
      task={task}
    />

    </>
  );
}
