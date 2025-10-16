
// src/app/cart/page.tsx
'use client';

import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, placeOrder, taxRate, isCartLoading } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient && !user) {
      router.push('/login?redirect=/cart');
    }
  }, [user, router, isClient]);
  
  const subtotal = getTotalPrice();
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handlePlaceOrder = () => {
    if (!user) {
        router.push('/login?redirect=/cart');
        return;
    }
    placeOrder(total, user);
    router.push('/orders');
  };
  
  if (!isClient || !user || isCartLoading) {
    return <div className="flex items-center justify-center h-screen bg-background"><p>Loading...</p></div>;
  }

  return (
    <div className="bg-background min-h-screen pb-24">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 border-b">
        <h1 className="text-2xl font-bold text-center">My Cart</h1>
      </header>

      <main className="p-4">
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Button asChild>
              <Link href="/">Go to Menu</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <Image
                    src={item.image.url}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover aspect-square"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                         <Minus className="h-4 w-4" />
                       </Button>
                       <span className="font-bold w-4 text-center">{item.quantity}</span>
                       <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                         <Plus className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div>
                <h2 className="text-lg font-semibold mb-4">Bill Details</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <Button size="lg" className="w-full" onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
