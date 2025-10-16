// src/app/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Star,
  Coffee,
  Beef,
  Pizza,
  Salad,
  Cake,
  GlassWater,
  ShoppingCart,
  UtensilsCrossed,
  Flame,
  User as UserIcon,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BottomNav } from '@/components/layout/bottom-nav';
import type { MenuItem } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/layout/theme-toggle';


const categories = [
  { name: 'Specials', id: 'specials', icon: Star },
  { name: 'Hot Selling', id: 'hot-selling', icon: Flame },
  { name: 'Coffee', id: 'coffee', icon: Coffee },
  { name: 'Burgers', id: 'burgers', icon: Beef },
  { name: 'Pizza', id: 'pizza', icon: Pizza },
  { name: 'Salads', id: 'salads', icon: Salad },
  { name: 'Desserts', id: 'desserts', icon: Cake },
  { name: 'Drinks', id: 'drinks', icon: GlassWater },
];


function MenuContent() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart, cart, menuItems, tableNumber, setTable } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tableQueryParam = searchParams.get('table');
    if (tableQueryParam) {
      setTable(tableQueryParam);
    }
  }, [searchParams, setTable]);


  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (item: MenuItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) {
      const redirectUrl = `/?${searchParams.toString()}`;
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
      return;
    }
    addToCart(item);
  };
  
  const filteredMenu = menuItems.filter(item => {
      const matchesCategory =
        selectedCategory === 'all'
          ? true
          : selectedCategory === 'specials'
          ? item.isSpecial
          : selectedCategory === 'hot-selling'
          ? item.isHotSelling
          : item.category.toLowerCase() === selectedCategory;

      const matchesSearch =
        searchQuery.trim() === ''
          ? true
          : item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch && item.isAvailable;
    });

  const renderNoTableWarning = () => (
    <div className="p-4">
        <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Table Selected</AlertTitle>
            <AlertDescription>
                Please access this page using the QR code link on your table to start an order.
            </AlertDescription>
        </Alert>
    </div>
  )

  return (
    <div className={cn("bg-background min-h-screen", user && "pb-24")}>
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 space-y-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="font-headline">MunchMate</span>
          </div>
          <div className="flex items-center gap-2">
             {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2">
                           <UserIcon className="h-5 w-5" />
                           <span>{user.name.split(' ')[0]}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        {tableNumber && <DropdownMenuLabel className="font-normal text-muted-foreground">Table: {tableNumber}</DropdownMenuLabel>}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/orders')}>
                           My Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={logout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
             ) : (
                <Button asChild>
                    <Link href={`/login?redirect=${encodeURIComponent(`/?${searchParams.toString()}`)}`}>Login</Link>
                </Button>
             )}
            <ThemeToggle />
            <Link href="/cart" className="relative hidden md:block">
              <ShoppingCart className="h-6 w-6 text-foreground" />
              {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-3 h-5 w-5 flex items-center justify-center p-0">{cartItemCount}</Badge>
              )}
            </Link>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="What are you craving?"
            className="pl-10 h-12 w-full rounded-full bg-muted border-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!tableNumber && !!user}
          />
        </div>
      </header>

      <main className="p-4">
        {user && !tableNumber && renderNoTableWarning()}
        
        {(!user || tableNumber) && (
            <>
                <div className="pb-4">
                <div className="flex space-x-2 overflow-x-auto pb-2 -mx-4 px-4">
                    <Button
                        variant={selectedCategory === 'all' ? 'default' : 'outline'}
                        className={cn(
                        'rounded-full whitespace-nowrap flex items-center gap-2',
                        selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card'
                        )}
                        onClick={() => setSelectedCategory('all')}
                    >
                        All
                    </Button>
                    {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        className={cn(
                        'rounded-full whitespace-nowrap flex items-center gap-2',
                        selectedCategory === category.id ? 'bg-primary text-primary-foreground' : 'bg-card'
                        )}
                        onClick={() => setSelectedCategory(category.id)}
                    >
                        <category.icon className="h-4 w-4" />
                        {category.name}
                    </Button>
                    ))}
                </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredMenu.map((item) => (
                    <Card
                    key={item.id}
                    className={cn(
                        "overflow-hidden rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer",
                        !item.isAvailable && "opacity-50 pointer-events-none"
                        )}
                    onClick={() => item.isAvailable && setSelectedItem(item)}
                    >
                    <CardContent className="p-0">
                        <div className="relative">
                        <Image
                            src={item.image.url}
                            alt={item.name}
                            width={300}
                            height={300}
                            data-ai-hint={item.image.hint}
                            className="aspect-square w-full object-cover"
                        />
                        {!item.isAvailable && (
                            <Badge variant="destructive" className="absolute top-2 left-2">UNAVAILABLE</Badge>
                        )}
                        {item.isSpecial && item.isAvailable && (
                            <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                            SPECIAL
                            </Badge>
                        )}
                        {item.isHotSelling && item.isAvailable && (
                            <Badge className={cn("absolute top-2", item.isSpecial ? "left-20" : "left-2", "bg-orange-500 text-white")}>
                            HOT
                            </Badge>
                        )}
                        </div>
                        <div className="p-3 space-y-2 flex flex-col">
                        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 h-8 flex-grow">
                            {item.description}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                            <span className="font-bold text-sm">₹{item.price.toFixed(2)}</span>
                            <Button size="sm" className="h-8 rounded-full" onClick={(e) => handleAddToCart(item, e)} disabled={!item.isAvailable}>
                            Add
                            </Button>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                ))}
                </div>
            </>
        )}
      </main>

      {selectedItem && (
        <Sheet open={!!selectedItem} onOpenChange={(isOpen) => !isOpen && setSelectedItem(null)}>
          <SheetContent side="bottom" className="rounded-t-2xl max-h-[80svh] overflow-y-auto">
             <SheetHeader className="text-left">
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-4">
                    <Image
                        src={selectedItem.image.url}
                        alt={selectedItem.name}
                        fill
                        className="object-cover"
                    />
                </div>
              <SheetTitle className="text-2xl">{selectedItem.name}</SheetTitle>
              <SheetDescription>{selectedItem.description}</SheetDescription>
            </SheetHeader>
            <div className="py-4">
                 <p className="text-lg font-bold">₹{selectedItem.price.toFixed(2)}</p>
            </div>
            <SheetFooter>
              <Button type="submit" size="lg" className="w-full" onClick={() => {
                handleAddToCart(selectedItem)
                setSelectedItem(null)
              }}>
                Add to Cart
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {user && <BottomNav />}
    </div>
  );
}

export default function MenuPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen bg-background"><p>Loading Menu...</p></div>}>
            <MenuContent />
        </Suspense>
    )
}
