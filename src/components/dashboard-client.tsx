'use client';

import { useApp } from '@/context/app-provider';
import { AppHeader } from '@/components/header';
import { TaskCard } from '@/components/task-card';
import { Task } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowDownUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OrderList } from './order-list';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type SortOption = 'priority-desc' | 'due-date-asc' | 'created-date-desc' | 'created-date-asc';

export function DashboardClient() {
  const { tasks, currentUser, loading } = useApp();
  const [sortBy, setSortBy] = useState<SortOption>('created-date-desc');


  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<Task['priority'], number> = { high: 3, medium: 2, low: 1 };
    
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority-desc':
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'due-date-asc':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'created-date-asc':
           return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'created-date-desc':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [tasks, sortBy]);

  // This should not happen if the logic in page.tsx is correct, but as a safeguard:
  if (loading || !currentUser) {
    return (
       <div className="w-full">
        <AppHeader />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
           <div className="space-y-4">
                <Skeleton className="h-10 w-full max-w-sm mb-4" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
             <Skeleton className="h-12 w-full mt-8" />
        </div>
      </div>
    )
  }
  
  const openTasks = sortedTasks.filter(task => task.status === 'open');
  const completedTasks = sortedTasks.filter(task => task.status === 'completed');

  const createdByMe = openTasks.filter(task => task.creatorId === currentUser.id);
  const collaboratingOn = openTasks.filter(task => task.collaboratorIds.includes(currentUser.id) && task.creatorId !== currentUser.id);
  const otherTasks = openTasks.filter(task => task.creatorId !== currentUser.id && !task.collaboratorIds.includes(currentUser.id));

  return (
    <div className="w-full">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col xl:flex-row gap-8">
          <div className="flex-1">
            <Tabs defaultValue="created-by-me" className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <TabsList className="flex items-center justify-start gap-2">
                  <TabsTrigger value="created-by-me">Meine ({createdByMe.length})</TabsTrigger>
                  <TabsTrigger value="collaborating-on">Mitarbeit ({collaboratingOn.length})</TabsTrigger>
                  <TabsTrigger value="other-tasks">Alle ({otherTasks.length})</TabsTrigger>
                </TabsList>
                 <div className="w-full sm:w-auto">
                   <Select onValueChange={(value: SortOption) => setSortBy(value)} defaultValue={sortBy}>
                      <SelectTrigger className="w-full sm:w-[220px]">
                        <div className='flex items-center gap-2'>
                          <ArrowDownUp className='h-4 w-4' />
                          <SelectValue placeholder="Sortieren nach..." />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created-date-desc">Neueste zuerst</SelectItem>
                        <SelectItem value="created-date-asc">Älteste zuerst</SelectItem>
                        <SelectItem value="priority-desc">Priorität (Hoch zuerst)</SelectItem>
                        <SelectItem value="due-date-asc">Fälligkeitsdatum</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
              </div>
              <TabsContent value="created-by-me" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {createdByMe.length > 0 ? (
                      createdByMe.map(task => <TaskCard key={task.id} task={task} />)
                    ) : (
                      <div className="col-span-full text-center p-8 bg-secondary rounded-lg">
                        <p className="text-muted-foreground">Sie haben noch keine Aufgaben erstellt.</p>
                      </div>
                    )}
                </div>
              </TabsContent>
              <TabsContent value="collaborating-on" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {collaboratingOn.length > 0 ? (
                    collaboratingOn.map(task => <TaskCard key={task.id} task={task} />)
                  ) : (
                     <div className="col-span-full text-center p-8 bg-secondary rounded-lg">
                        <p className="text-muted-foreground">Sie wirken an keinen Aufgaben mit.</p>
                      </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="other-tasks" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {otherTasks.length > 0 ? (
                    otherTasks.map(task => <TaskCard key={task.id} task={task} />)
                  ) : (
                     <div className="col-span-full text-center p-8 bg-secondary rounded-lg">
                       <p className="text-muted-foreground">Keine weiteren Aufgaben vorhanden.</p>
                     </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {completedTasks.length > 0 && (
              <div className="mt-12">
                <Accordion type="single" collapsible defaultValue="completed-tasks">
                  <AccordionItem value="completed-tasks">
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                        <h2 className="text-2xl font-bold font-headline">Erledigte Aufgaben</h2>
                        <Badge variant="secondary">{completedTasks.length}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-4">
                        {completedTasks.map(task => <TaskCard key={task.id} task={task} />)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>

          <div className="w-full xl:w-96 hidden xl:block">
            <OrderList />
          </div>
        </div>
      </main>
    </div>
  );
}
