
// src/hooks/use-cart.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { CartItem, MenuItem, PastOrder, KitchenOrder, SalesData, TableStatus, AnalyticsPeriod } from '@/lib/types';
import { useToast } from './use-toast';
import { mockPastOrders, mockKitchenOrders, mockMenu, mockTableStatuses } from '@/lib/data';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  format,
  eachDayOfInterval,
  startOfToday,
  endOfToday,
} from 'date-fns';
import { nanoid } from 'nanoid';

type KitchenStatus = 'new' | 'in-progress' | 'completed';

interface AnalyticsData {
    totalRevenue: number;
    revenueChangeText: string;
    newOrders: number;
    ordersChangeText: string;
    avgOrderValue: number;
    avgValueChangeText: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  placeOrder: (total: number, customer: { name: string; phone: string; }) => void;
  pastOrders: PastOrder[];
  kitchenOrders: { new: KitchenOrder[], 'in-progress': KitchenOrder[], completed: KitchenOrder[] };
  updateKitchenOrderStatus: (orderId: string, from: KitchenStatus, to: KitchenStatus) => void;
  approvePayment: (orderId: string) => void;
  deleteOrder: (orderId: string) => void;
  taxRate: number;
  setTaxRate: (rate: number) => void;
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  analytics: AnalyticsData;
  salesData: SalesData[];
  isCartLoading: boolean;
  tableNumber: string | null;
  setTable: (table: string) => void;
  tableStatuses: TableStatus[];
  addTable: (tableId: number) => boolean;
  analyticsPeriod: AnalyticsPeriod;
  setAnalyticsPeriod: (period: AnalyticsPeriod) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const safeJsonParse = <T>(jsonString: string | null): T | null => {
  if (typeof window === 'undefined' || !jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON from localStorage", error);
    return null;
  }
};

const writeToStorage = <T>(key: string, data: T) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to write to localStorage: ${key}`, error);
    }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [kitchenOrders, setKitchenOrders] = useState<{ new: KitchenOrder[], 'in-progress': KitchenOrder[], completed: KitchenOrder[] }>({ new: [], 'in-progress': [], completed: [] });
  const [taxRate, setTaxRateState] = useState(0.08);
  const [menuItems, setMenuItemsState] = useState<MenuItem[]>([]);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>('weekly');
  const [isCartLoading, setIsCartLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState<string | null>(null);
  const [tableStatusesState, setTableStatusesState] = useState<TableStatus[]>([]);


  useEffect(() => {
    setIsCartLoading(true);
    const storedCart = safeJsonParse<CartItem[]>(localStorage.getItem('cart')) ?? [];
    const storedMenuItems = safeJsonParse<MenuItem[]>(localStorage.getItem('menuItems')) ?? mockMenu;
    const storedOrders = safeJsonParse<PastOrder[]>(localStorage.getItem('pastOrders')) ?? mockPastOrders;
    const storedKitchenOrders = safeJsonParse<typeof kitchenOrders>(localStorage.getItem('kitchenOrders')) ?? mockKitchenOrders;
    const storedTaxRate = safeJsonParse<number>(localStorage.getItem('taxRate')) ?? 0.08;
    const storedTableNumber = safeJsonParse<string>(localStorage.getItem('tableNumber'));
    const storedTableStatuses = safeJsonParse<TableStatus[]>(localStorage.getItem('tableStatuses')) ?? mockTableStatuses;

    setCart(storedCart);
    setMenuItemsState(storedMenuItems);
    setPastOrders(storedOrders);
    setKitchenOrders(storedKitchenOrders);
    setTaxRateState(storedTaxRate);
    setTableStatusesState(storedTableStatuses);
    if (storedTableNumber) setTableNumber(storedTableNumber);
    
    setIsCartLoading(false);
  }, []);

  const addTable = (tableId: number): boolean => {
    if (tableStatusesState.some(table => table.id === tableId)) {
        return false;
    }
    const newTable: TableStatus = { id: tableId, status: 'Empty' };
    setTableStatusesState(current => {
        const updated = [...current, newTable];
        writeToStorage('tableStatuses', updated);
        return updated;
    });
    return true;
  }

  const tableStatuses = useMemo(() => {
      return tableStatusesState.map(t => {
        const hasPendingOrder = pastOrders.some(order => 
            order.tableNumber === t.id.toString() && 
            order.paymentStatus === 'Pending'
        );
        return {
            ...t,
            status: hasPendingOrder ? 'Occupied' : 'Empty'
        };
      });
  }, [pastOrders, tableStatusesState]);


  const setTable = useCallback((table: string) => {
    setTableNumber(table);
    writeToStorage('tableNumber', table);
  }, []);

  const setTaxRate = useCallback((rate: number) => {
    setTaxRateState(rate);
    writeToStorage('taxRate', rate);
  }, []);

  const setMenuItems = useCallback((items: MenuItem[]) => {
      setMenuItemsState(items);
      writeToStorage('menuItems', items);
  }, []);

  const addToCart = useCallback((item: MenuItem) => {
    if(!item.isAvailable){
      toast({
        variant: "destructive",
        title: "Item Unavailable",
        description: `${item.name} is currently out of stock.`,
      })
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      let updatedCart;
      if (existingItem) {
        updatedCart = prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        updatedCart = [...prevCart, { ...item, quantity: 1 }];
      }
      writeToStorage('cart', updatedCart);
      return updatedCart;
    });
    toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart.`,
    })
  }, [toast]);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prevCart) => {
        const updatedCart = prevCart.filter((item) => item.id !== itemId);
        writeToStorage('cart', updatedCart);
        return updatedCart;
    });
     toast({
        title: "Removed from cart",
        variant: "destructive",
    })
  }, [toast]);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) => {
        const updatedCart = prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item));
        writeToStorage('cart', updatedCart);
        return updatedCart;
      });
    }
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    writeToStorage('cart', []);
  }, []);
  
  const placeOrder = useCallback((total: number, customer: { name: string; phone: string; }) => {
    if (!tableNumber) {
        toast({ variant: "destructive", title: "No Table Number", description: "Please scan a table QR code to start an order." });
        return;
    }

    let newOrderId = nanoid(6);
    while (pastOrders.some(order => order.id === newOrderId)) {
        newOrderId = nanoid(6);
    }
    
    const newOrder: PastOrder = {
      id: newOrderId,
      userId: `guest-${nanoid(8)}`,
      userName: customer.name,
      userPhone: customer.phone,
      tableNumber: tableNumber,
      date: new Date().toISOString(),
      status: 'Pending',
      paymentStatus: 'Pending',
      total: total,
      items: cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price }))
    };

    setPastOrders(currentPastOrders => {
        const updatedPastOrders = [newOrder, ...currentPastOrders];
        writeToStorage('pastOrders', updatedPastOrders);
        return updatedPastOrders;
    });
    
    const newKitchenOrder: KitchenOrder = {
      id: newOrderId,
      table: tableNumber,
      time: 'Just now',
      items: cart.map(item => ({ name: item.name, quantity: item.quantity }))
    };
    setKitchenOrders(currentKitchen => {
        const updatedKitchen = { ...currentKitchen, new: [newKitchenOrder, ...currentKitchen.new] };
        writeToStorage('kitchenOrders', updatedKitchen);
        return updatedKitchen;
    });

    clearCart();
    toast({ title: "Order Placed!", description: "Your order has been sent to the kitchen." });
  }, [tableNumber, cart, clearCart, toast, pastOrders]);


  const updateKitchenOrderStatus = useCallback((orderId: string, from: KitchenStatus, to: KitchenStatus) => {
    setKitchenOrders(currentKitchenOrders => {
      const orderToMove = currentKitchenOrders[from].find((o) => o.id === orderId);
      if (!orderToMove) return currentKitchenOrders;
  
      const newTime = to === 'completed' ? `${Math.floor(Math.random() * 10) + 5} min ago` : 'In Progress';
      const updatedOrder = { ...orderToMove, time: newTime };
  
      const updatedKitchenState = {
        ...currentKitchenOrders,
        [from]: currentKitchenOrders[from].filter((o) => o.id !== orderId),
        [to]: [updatedOrder, ...currentKitchenOrders[to]],
      };
      writeToStorage('kitchenOrders', updatedKitchenState);
      
      setPastOrders(currentPastOrders => {
        const newStatus = to === 'in-progress' ? 'Cooking' : 'Completed';
        const updatedPastOrders = currentPastOrders.map(po => 
          po.id === orderId ? { ...po, status: newStatus } : po
        );
        writeToStorage('pastOrders', updatedPastOrders);
        return updatedPastOrders;
      });
  
      return updatedKitchenState;
    });
  }, []);

  const approvePayment = useCallback((orderId: string) => {
    setPastOrders(currentPastOrders => {
        const updatedPastOrders = currentPastOrders.map(po => 
          po.id === orderId ? { ...po, paymentStatus: 'Approved' as const } : po
        );
        writeToStorage('pastOrders', updatedPastOrders);
        toast({ title: "Payment Approved", description: `Payment for order #${orderId.slice(-4)} has been approved.` });
        return updatedPastOrders;
    });
  }, [toast]);
  
  const deleteOrder = useCallback((orderId: string) => {
    setPastOrders(currentPastOrders => {
      const updatedPastOrders = currentPastOrders.filter(o => o.id !== orderId);
      writeToStorage('pastOrders', updatedPastOrders);

      setKitchenOrders(currentKitchenOrders => {
        const updatedKitchen = {
            new: currentKitchenOrders.new.filter(o => o.id !== orderId),
            'in-progress': currentKitchenOrders['in-progress'].filter(o => o.id !== orderId),
            completed: currentKitchenOrders.completed.filter(o => o.id !== orderId)
        };
        writeToStorage('kitchenOrders', updatedKitchen);
        return updatedKitchen;
      });

      toast({ title: "Order Deleted", description: `Order #${orderId.slice(-6)} has been removed.` });
      return updatedPastOrders;
    });
  }, [toast]);

  const analytics = useMemo(() => {
    const now = new Date();
    const approvedOrders = pastOrders.filter(o => o.paymentStatus === 'Approved');

    const getPeriodInterval = (period: AnalyticsPeriod) => {
        if (period === 'daily') return { start: startOfToday(), end: endOfToday() };
        if (period === 'weekly') return { start: startOfWeek(now), end: endOfWeek(now) };
        if (period === 'monthly') return { start: startOfMonth(now), end: endOfMonth(now) };
        return { start: new Date(0), end: now };
    };

    const interval = getPeriodInterval(analyticsPeriod);
    const periodOrders = approvedOrders.filter(o => isWithinInterval(new Date(o.date), interval));
    
    const totalRevenue = periodOrders.reduce((sum, order) => sum + order.total, 0);
    const newOrders = periodOrders.length;
    const avgOrderValue = newOrders > 0 ? totalRevenue / newOrders : 0;

    const revenueChangeText = `based on ${analyticsPeriod} data`;
    const ordersChangeText = `for the ${analyticsPeriod} period`;
    const avgValueChangeText = `over the ${analyticsPeriod} period`;

    return { totalRevenue, newOrders, avgOrderValue, revenueChangeText, ordersChangeText, avgValueChangeText };
  }, [pastOrders, analyticsPeriod]);
  
  const salesData = useMemo(() => {
    const now = new Date();
    const approvedOrders = pastOrders.filter(o => o.paymentStatus === 'Approved');
    const interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    
    const weekOrders = approvedOrders.filter(o => isWithinInterval(new Date(o.date), interval));

    const dailySales = eachDayOfInterval(interval).reduce((acc, day) => {
        const dayKey = format(day, 'E');
        acc[dayKey] = 0;
        return acc;
    }, {} as Record<string, number>);

    weekOrders.forEach(order => {
        const dayKey = format(new Date(order.date), 'E');
        if (dailySales.hasOwnProperty(dayKey)) {
            dailySales[dayKey] += order.total;
        }
    });
    
    return Object.entries(dailySales).map(([name, sales]) => ({ name, sales }));

  }, [pastOrders]);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, placeOrder, pastOrders, kitchenOrders, updateKitchenOrderStatus, approvePayment, deleteOrder, taxRate, setTaxRate, menuItems, setMenuItems, analytics, salesData, isCartLoading, tableNumber, setTable, tableStatuses, addTable, analyticsPeriod, setAnalyticsPeriod }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
