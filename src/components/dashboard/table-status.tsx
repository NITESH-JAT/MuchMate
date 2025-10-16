
// src/components/dashboard/table-status.tsx
'use client';

import { useCart } from '@/hooks/use-cart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Armchair } from 'lucide-react';
import type { TableStatus as TableStatusType } from '@/lib/types';


export function TableStatus() {
    const { tableStatuses } = useCart();

    const getStatusStyles = (status: TableStatusType['status']) => {
        switch (status) {
            case 'Empty':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Occupied':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Needs Cleaning':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Table Status</CardTitle>
                <CardDescription>Live overview of your restaurant tables. Status is updated automatically.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {tableStatuses.map(table => (
                        <Card key={table.id} className={cn(
                            "flex flex-col items-center justify-center p-4 aspect-square transition-all",
                            getStatusStyles(table.status)
                            )}>
                            <div className="flex-1 flex flex-col items-center justify-center gap-2">
                                <Armchair className="w-8 h-8" />
                                <p className="font-bold text-lg">Table {table.id}</p>
                            </div>
                            <Badge variant="outline" className={cn("capitalize mt-2", getStatusStyles(table.status))}>{table.status}</Badge>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

    