'use client';

import { useState } from 'react';
import type { Task } from '@/lib/types';
import { useApp } from '@/context/app-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckSquare, CheckCircle2, SignalHigh, SignalMedium, SignalLow, Lock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { TaskDetailsSheet } from './task-details-sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface TaskCardProps {
  task: Task;
}

const priorityIcons = {
  low: <SignalLow className="h-4 w-4 text-blue-500" />,
  medium: <SignalMedium className="h-4 w-4 text-yellow-500" />,
  high: <SignalHigh className="h-4 w-4 text-red-500" />,
};

export function TaskCard({ task }: TaskCardProps) {
  const { users, tasks } = useApp();
  const [isSheetOpen, setSheetOpen] = useState(false);
  const collaborators = users.filter(u => task.collaboratorIds.includes(u.id));
  
  const subtasksArray = task.subtasks ? Object.values(task.subtasks) : [];
  const commentsArray = task.comments ? Object.values(task.comments) : [];

  const completedSubtasks = subtasksArray.filter(s => s.completed).length;
  const progress = subtasksArray.length > 0 ? (completedSubtasks / subtasksArray.length) * 100 : 0;
  
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status === 'open';
  const isCompleted = task.status === 'completed';

  const blockingTasks = (task.dependsOn || [])
    .map(id => tasks.find(t => t.id === id))
    .filter((t): t is Task => !!t && t.status === 'open');
  const isBlocked = blockingTasks.length > 0;

  return (
    <>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
           <Card 
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col",
              isCompleted && "bg-secondary/50 opacity-70 hover:opacity-100",
              isBlocked && "cursor-not-allowed opacity-60 hover:opacity-60 hover:-translate-y-0"
            )}
            onClick={() => !isBlocked && setSheetOpen(true)}
          >
            <div className='p-4 flex-grow'>
                <div className='flex justify-between items-start mb-2'>
                    <CardTitle className={cn("font-headline text-lg pr-2", isCompleted && "line-through")}>{task.title}</CardTitle>
                    <div className='flex items-center gap-2'>
                        {isBlocked && (
                          <Tooltip>
                            <TooltipTrigger><Lock className="h-4 w-4 text-destructive" /></TooltipTrigger>
                          </Tooltip>
                        )}
                        {task.priority && priorityIcons[task.priority]}
                        {isCompleted && <Badge variant="secondary" className='bg-green-100 text-green-800 border-green-200 text-xs'><CheckCircle2 className='mr-1 h-3 w-3' />Erledigt</Badge>}
                    </div>
                </div>
                {task.dueDate &&
                    <CardDescription className="text-xs">
                    Fällig {formatDate(task.dueDate)}
                    {isOverdue && <Badge variant="destructive" className="ml-2">Überfällig</Badge>}
                    </CardDescription>
                }
                {subtasksArray.length > 0 && (
                    <div className='mt-3'>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-muted-foreground">Fortschritt</span>
                        <span className="text-xs font-semibold">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                    </div>
                )}
            </div>
            <div className="flex justify-between items-center mt-3 p-4 pt-0">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <CheckSquare className="h-4 w-4 mr-1" />
                        <span className="text-xs">{completedSubtasks}/{subtasksArray.length}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span className="text-xs">{commentsArray.length}</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="flex -space-x-2 overflow-hidden">
                        {collaborators.map(collaborator => (
                            <Avatar key={collaborator.id} className="h-7 w-7 border-2 border-card">
                                <AvatarFallback className="text-xs">{collaborator.initials}</AvatarFallback>
                            </Avatar>
                        ))}
                    </div>
                </div>
            </div>
          </Card>
        </TooltipTrigger>
        {isBlocked && (
            <TooltipContent side="top" align="center">
                <p className='text-sm'>Diese Aufgabe ist blockiert durch:</p>
                <ul className='list-disc pl-4 text-xs mt-1'>
                    {blockingTasks.map(t => <li key={t.id}>{t.title}</li>)}
                </ul>
            </TooltipContent>
        )}
      </Tooltip>
      </TooltipProvider>
      <TaskDetailsSheet open={isSheetOpen} onOpenChange={setSheetOpen} task={task} />
    </>
  );
}
