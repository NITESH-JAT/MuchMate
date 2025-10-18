
// src/app/orders/page.tsx
'use client';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { Download, UtensilsCrossed } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import type { PastOrder } from '@/lib/types';
import type { UserOptions } from 'jspdf-autotable';
import Link from 'next/link';

// Extend jsPDF with the autoTable method
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: UserOptions) => jsPDF;
}

export default function OrdersPage() {
  const { pastOrders, isCartLoading, tableNumber } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const latestOrderForTable = useMemo(() => {
    if (!tableNumber) return null;
    return pastOrders
      .filter((order) => order.tableNumber === tableNumber)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [pastOrders, tableNumber]);

  const handleDownloadReceipt = (order: PastOrder) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('MunchMate', pageWidth / 2, 22, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #${order.id.slice(-6)} | ${new Date(order.date).toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });

    // Customer Info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Billed To:', 14, 50);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(order.userName, 14, 58);
    doc.text(`Phone: ${order.userPhone}`, 14, 64);
    doc.text(`Table: ${order.tableNumber}`, 14, 70);

    // Order Summary Table
    const tableColumn = ["Item", "Quantity", "Price", "Total"];
    const tableRows = order.items.map(item => [
        item.name,
        item.quantity,
        `₹${item.price.toFixed(2)}`,
        `₹${(item.price * item.quantity).toFixed(2)}`
    ]);

    doc.autoTable({
        startY: 80,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [34, 139, 34] }, // A nice green color
        styles: { font: 'helvetica', cellPadding: 3 },
    });

    // Total and Payment Status
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Amount:', 14, finalY + 15);
    doc.text(`₹${order.total.toFixed(2)}`, pageWidth - 14, finalY + 15, { align: 'right' });

    doc.text('Payment Status:', 14, finalY + 23);
    doc.setTextColor(0, 128, 0); // Green color for 'Approved'
    doc.text(order.paymentStatus, pageWidth - 14, finalY + 23, { align: 'right' });
    doc.setTextColor(0, 0, 0); // Reset color
    doc.setFont('helvetica', 'normal');

    // Thank you note
    doc.setFontSize(14);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for dining with us! We hope to see you again soon.', pageWidth / 2, finalY + 45, { align: 'center' });

    doc.save(`receipt-ORD-${order.id.slice(-6)}.pdf`);
  };

  if (!isClient || isCartLoading) {
    return <div className="flex items-center justify-center h-screen bg-background"><p>Loading...</p></div>;
  }

  return (
    <div className="bg-background min-h-screen pb-24">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 border-b">
        <h1 className="text-2xl font-bold text-center">My Order Status</h1>
      </header>

      <main className="p-4 space-y-4">
        {!tableNumber ? (
           <div className="text-center py-20">
             <p className="text-muted-foreground mb-4">Please scan a table's QR code to see your order status.</p>
             <Button asChild><Link href="/">Go to Menu</Link></Button>
           </div>
        ) : !latestOrderForTable ? (
           <div className="text-center py-20">
             <p className="text-muted-foreground">You haven't placed an order from this table yet.</p>
           </div>
        ) : (
          <Card key={latestOrderForTable.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start text-lg">
                <div>
                    <span>Order #{latestOrderForTable.id.slice(-4)}</span>
                     <div className="text-sm text-muted-foreground mt-1">
                        {new Date(latestOrderForTable.date).toLocaleDateString()} &bull; ₹{latestOrderForTable.total.toFixed(2)}
                     </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <Badge
                        variant="outline"
                        className={cn(
                        'capitalize',
                        latestOrderForTable.status === 'Completed' && 'bg-green-100 text-green-800 border-green-200',
                        latestOrderForTable.status === 'Cooking' && 'bg-blue-100 text-blue-800 border-blue-200',
                        latestOrderForTable.status === 'Pending' && 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        )}
                    >
                        {latestOrderForTable.status}
                    </Badge>
                     <Badge
                        variant={latestOrderForTable.paymentStatus === 'Approved' ? 'default' : 'secondary'}
                        className={cn(
                        'text-xs capitalize',
                        latestOrderForTable.paymentStatus === 'Approved' && 'bg-green-100 text-green-800 border-green-200',
                        latestOrderForTable.paymentStatus === 'Pending' && 'bg-orange-100 text-orange-800 border-orange-200'
                        )}
                    >
                       Payment: {latestOrderForTable.paymentStatus}
                    </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />
              <div className="space-y-2">
                {latestOrderForTable.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name} (x{item.quantity})</span>
                    <span className="text-muted-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {latestOrderForTable.paymentStatus === 'Approved' && (
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(latestOrderForTable)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Receipt
                    </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
