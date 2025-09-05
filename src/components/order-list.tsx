'use client';

import { useState } from 'react';
import { useApp } from '@/context/app-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Package, PlusCircle, Minus, Plus } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Checkbox } from './ui/checkbox';
import { cn, formatDateTime } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function OrderList() {
    const { orderItems, users, addOrderItem, updateOrderItemStatus, currentUser } = useApp();
    const [newItemText, setNewItemText] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState('1');

    if (!currentUser) return null;

    const handleAddItem = () => {
        if (newItemText.trim()) {
            addOrderItem(newItemText.trim(), newItemQuantity.trim());
            setNewItemText('');
            setNewItemQuantity('1');
        }
    };

    const handleQuantityChange = (direction: 'increment' | 'decrement') => {
        const currentQuantity = parseInt(newItemQuantity, 10) || 1;
        if (direction === 'increment') {
            setNewItemQuantity((currentQuantity + 1).toString());
        } else if (currentQuantity > 1) {
            setNewItemQuantity((currentQuantity - 1).toString());
        }
    }

    const neededItems = orderItems.filter(item => item.status === 'needed');
    const orderedItems = orderItems.filter(item => item.status === 'ordered');

    const renderItem = (item: typeof orderItems[number]) => {
        const requester = users.find(u => u.id === item.requesterId);
        const orderer = item.orderedById ? users.find(u => u.id === item.orderedById) : null;
        return (
            <div key={item.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors">
                <Checkbox
                    id={`order-${item.id}`}
                    checked={item.status === 'ordered'}
                    onCheckedChange={(checked) => updateOrderItemStatus(item.id, checked ? 'ordered' : 'needed')}
                    className="mt-1"
                />
                <div className='flex-1'>
                    <label
                        htmlFor={`order-${item.id}`}
                        className={cn("text-sm font-medium", item.status === 'ordered' && "line-through text-muted-foreground")}
                    >
                        {item.quantity && <span className='font-bold'>{item.quantity}x </span>}
                        {item.text}
                    </label>
                    <div className='text-xs text-muted-foreground mt-1 space-y-1'>
                        {requester && (
                           <div className='flex items-center gap-1.5'>
                             <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[10px]">{requester.initials}</AvatarFallback>
                             </Avatar>
                             <span>
                                Angefordert von <strong>{requester.name === currentUser?.name ? "Ihnen" : requester.name}</strong> am {formatDateTime(item.createdAt)}
                             </span>
                           </div>
                        )}
                         {orderer && item.orderedAt && (
                           <div className='flex items-center gap-1.5'>
                             <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[10px]">{orderer.initials}</AvatarFallback>
                             </Avatar>
                             <span>
                                Bestellt von <strong>{orderer.name === currentUser?.name ? "Ihnen" : orderer.name}</strong> am {formatDateTime(item.orderedAt)}
                             </span>
                           </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='h-full flex flex-col bg-card'>
             <CardHeader className="hidden xl:block">
                <CardTitle className='flex items-center gap-2 font-headline'>
                    <Package className="h-6 w-6" />
                    Materialbestellung
                </CardTitle>
                <CardDescription>
                    Artikel, die vom Lageristen bestellt werden müssen.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow min-h-0 p-4">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-4">
                        <div>
                            <h4 className='text-sm font-semibold mb-2'>Benötigt ({neededItems.length})</h4>
                            <div className='space-y-1 divide-y'>
                                {neededItems.length > 0 ? neededItems.map(renderItem) : <p className='text-xs text-muted-foreground p-2'>Keine Artikel benötigt.</p>}
                            </div>
                        </div>
                         <div className="mt-4">
                            <h4 className='text-sm font-semibold mb-2'>Bestellt ({orderedItems.length})</h4>
                            <div className='space-y-1 divide-y'>
                                {orderedItems.length > 0 ? orderedItems.map(renderItem) : <p className='text-xs text-muted-foreground p-2'>Keine Artikel bestellt.</p>}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className='border-t pt-4 p-4'>
                <div className='w-full space-y-2'>
                    <div className="flex w-full items-center space-x-2">
                        <div className="flex items-center border rounded-md">
                             <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-8 rounded-r-none"
                                onClick={() => handleQuantityChange('decrement')}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                placeholder="Menge"
                                value={newItemQuantity}
                                onChange={(e) => setNewItemQuantity(e.target.value.replace(/[^0-9]/g, ''))}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                className="w-12 text-center border-y-0 border-x focus-visible:ring-0 rounded-none"
                                min="1"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-10 w-8 rounded-l-none"
                                onClick={() => handleQuantityChange('increment')}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                        <Input
                            placeholder="Neuer Artikel..."
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                            className="flex-grow"
                        />
                        <Button onClick={handleAddItem} disabled={!newItemText.trim() || !newItemQuantity.trim() || parseInt(newItemQuantity, 10) <= 0}>
                            <PlusCircle className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className='text-xs text-muted-foreground'>Fügen Sie einen Artikel zur "Benötigt"-Liste hinzu.</p>
                </div>
            </CardFooter>
        </div>
    )
}
