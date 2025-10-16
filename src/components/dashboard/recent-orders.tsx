
// src/components/dashboard/recent-orders.tsx
'use client';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCart } from '@/hooks/use-cart';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { PastOrder } from '@/lib/types';

export function RecentOrders() {
  const { pastOrders, approvePayment, deleteOrder } = useCart();
  const [orderToDelete, setOrderToDelete] = useState<PastOrder | null>(null);

  const allOrders = [...pastOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const handleDelete = () => {
    if (orderToDelete) {
        deleteOrder(orderToDelete.id);
        setOrderToDelete(null);
    }
  }

  return (
    <AlertDialog open={!!orderToDelete} onOpenChange={(isOpen) => !isOpen && setOrderToDelete(null)}>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allOrders.slice(0, 10).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.userName}</div>
                    <div className="text-sm text-muted-foreground">{order.userPhone}</div>
                  </TableCell>
                  <TableCell className="font-medium">{order.tableNumber}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-[200px] truncate">
                    {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        'capitalize',
                        order.status === 'Completed' && 'bg-green-100 text-green-800 border-green-200',
                        order.status === 'Cooking' && 'bg-blue-100 text-blue-800 border-blue-200',
                        order.status === 'Pending' && 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      )}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={order.paymentStatus === 'Approved' ? 'default' : 'secondary'}
                      className={cn(
                        'capitalize',
                        order.paymentStatus === 'Approved' && 'bg-green-100 text-green-800 border-green-200',
                        order.paymentStatus === 'Pending' && 'bg-orange-100 text-orange-800 border-orange-200'
                      )}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{order.total.toFixed(2)}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    {order.paymentStatus === 'Pending' && (
                      <Button variant="outline" size="sm" onClick={() => approvePayment(order.id)}>
                          Approve
                      </Button>
                    )}
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setOrderToDelete(order)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete order #{orderToDelete?.id.slice(-6)} and remove its data from our servers.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({variant: 'destructive'}))}>Delete</AlertDialogAction>
          </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    