'use client';

import { useState } from 'react';
import { useApp } from '@/context/app-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Pencil, List, FileText, SignalHigh, SignalMedium, SignalLow, Users } from 'lucide-react';
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
import type { TaskTemplate } from '@/lib/types';
import { EditTemplateDialog } from './edit-template-dialog';
import { NewTemplateDialog } from './new-template-dialog';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';

const priorityIcons = {
  low: <SignalLow className="h-4 w-4 text-blue-500" />,
  medium: <SignalMedium className="h-4 w-4 text-yellow-500" />,
  high: <SignalHigh className="h-4 w-4 text-red-500" />,
};

const priorityNames = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch'
}

export function TemplateManagementClient() {
  const { taskTemplates, deleteTemplate, users } = useApp();
  const [templateToDelete, setTemplateToDelete] = useState<TaskTemplate | null>(null);
  const [templateToEdit, setTemplateToEdit] = useState<TaskTemplate | null>(null);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);


  const handleDeleteConfirm = () => {
    if (templateToDelete) {
      deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
    }
  };


  return (
    <>
    <div className="max-w-4xl mx-auto">
       <div className='flex justify-between items-center mb-6'>
        <h1 className="text-3xl font-bold">Vorlagenverwaltung</h1>
         <Button onClick={() => setIsNewDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Neue Vorlage
          </Button>
       </div>
      
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taskTemplates.map((template) => {
            const collaborators = users.filter(u => template.collaboratorIds?.includes(u.id));
            return (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className='flex justify-between items-start'>
                    <CardTitle className='pr-2'>{template.name}</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className='h-7 w-7'
                            onClick={() => setTemplateToEdit(template)}
                            title='Vorlage bearbeiten'>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                             className='h-7 w-7'
                            onClick={() => setTemplateToDelete(template)}
                            title='Vorlage löschen'>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                 <div>
                    <h4 className='font-semibold text-sm mb-1'>Aufgabentitel:</h4>
                    <p className='text-sm text-muted-foreground'>{template.title}</p>
                 </div>
                 <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <h4 className='font-semibold text-sm mb-1'>Priorität:</h4>
                        <Badge variant="outline" className='flex gap-2 w-fit'>
                            {priorityIcons[template.priority]} {priorityNames[template.priority]}
                        </Badge>
                    </div>
                     <div>
                        <h4 className='font-semibold text-sm mb-1'>Mitwirkende:</h4>
                        {collaborators.length > 0 ? (
                           <div className="flex -space-x-2 overflow-hidden">
                                {collaborators.map(collaborator => (
                                    <Avatar key={collaborator.id} className="h-7 w-7 border-2 border-card">
                                        <AvatarFallback className="text-xs">{collaborator.initials}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                        ) : <p className='text-sm text-muted-foreground'>Keine.</p>}
                     </div>
                 </div>
                  <div>
                    <h4 className='font-semibold text-sm mb-1'>Teilaufgaben:</h4>
                    {template.subtasks.length > 0 ? (
                        <ul className='list-disc pl-5 space-y-1 text-sm text-muted-foreground'>
                            {template.subtasks.map((sub, i) => <li key={i}>{sub}</li>)}
                        </ul>
                    ) : (
                        <p className='text-sm text-muted-foreground'>Keine Standard-Teilaufgaben.</p>
                    )}
                 </div>
              </CardContent>
            </Card>
          )})}
           {taskTemplates.length === 0 && (
                <div className="col-span-full text-center p-10 border-2 border-dashed rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">Noch keine Vorlagen</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Erstellen Sie Ihre erste Vorlage, um wiederkehrende Aufgaben zu beschleunigen.
                    </p>
                    <div className="mt-6">
                        <Button onClick={() => setIsNewDialogOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Vorlage erstellen
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>

    <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Sind Sie sicher?</AlertDialogTitle>
                <AlertDialogDescription>
                    Möchten Sie die Vorlage "{templateToDelete?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>Löschen</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    
    {templateToEdit && (
        <EditTemplateDialog
            open={!!templateToEdit}
            onOpenChange={(isOpen) => !isOpen && setTemplateToEdit(null)}
            template={templateToEdit}
        />
    )}

    <NewTemplateDialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen} />

    </>
  );
}
