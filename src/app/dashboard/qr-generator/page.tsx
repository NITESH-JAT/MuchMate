// src/app/dashboard/qr-generator/page.tsx
'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { UtensilsCrossed } from 'lucide-react';

export default function QrGeneratorPage() {
  const [baseUrl, setBaseUrl] = useState('');
  const [restaurantName, setRestaurantName] = useState('MunchMate');
  const [tagline, setTagline] = useState('Scan, Order, Enjoy!');
  const { tableStatuses } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    // This ensures we get the base URL only on the client-side
    if (typeof window !== 'undefined') {
      setBaseUrl(window.location.origin);
      const savedName = localStorage.getItem('qrRestaurantName');
      const savedTagline = localStorage.getItem('qrTagline');
      if (savedName) setRestaurantName(savedName);
      if (savedTagline) setTagline(savedTagline);
    }
  }, []);

  const handleSaveDetails = () => {
    localStorage.setItem('qrRestaurantName', restaurantName);
    localStorage.setItem('qrTagline', tagline);
    toast({
      title: 'Details Saved',
      description: 'Your restaurant name and tagline have been updated for the QR codes.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!baseUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading QR Codes...</p>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 print:gap-4">
      <div className="print:hidden grid gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">QR Code Generator</h1>
          <Button onClick={handlePrint}>Print QR Codes</Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Restaurant Details</CardTitle>
                <CardDescription>Customize the details shown on the QR code cards.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input id="restaurant-name" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                    <Button onClick={handleSaveDetails}>Save Details</Button>
                </div>
            </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4" id="qr-code-grid">
        {tableStatuses.map((table) => (
          <Card key={table.id} className="text-center break-inside-avoid print:border-2 print:shadow-none">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-6">
                <div className='text-center'>
                    <h2 className="text-xl font-bold">{restaurantName}</h2>
                    <p className="text-sm text-muted-foreground">{tagline}</p>
                </div>
                <div className="p-4 bg-white rounded-lg border">
                    <QRCode
                        value={`${baseUrl}/?table=${table.id}`}
                        size={150}
                        level="H"
                        includeMargin={true}
                        renderAs="canvas"
                        className="qr-canvas"
                    />
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold">Table {table.id}</p>
                    <p className="text-xs text-muted-foreground break-all print:hidden">
                        {`${baseUrl}/?table=${table.id}`}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UtensilsCrossed className="h-3 w-3" />
                    <span>Powered by MunchMate</span>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
       <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #qr-code-grid, #qr-code-grid * {
            visibility: visible;
          }
          #qr-code-grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            gap: 1rem;
          }
          .qr-canvas {
            visibility: visible !important;
          }
        }
        @page {
          size: A4;
          margin: 1cm;
        }
      `}</style>
    </div>
  );
}
