export interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  image: {
    url: string;
    hint: string;
  };
  imageId: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: {
    url: string;
    hint: string;
  };
  category: string;
  isSpecial: boolean;
  isHotSelling: boolean;
  isAvailable: boolean;
  imageId: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface PastOrder {
    id: string;
    userId: string;
    userName: string;
    userPhone: string;
    tableNumber: string;
    date: string;
    status: 'Pending' | 'Cooking' | 'Completed';
    paymentStatus: 'Pending' | 'Approved';
    total: number;
    items: {
        id: string;
        name: string;
        quantity: number;
        price: number;
    }[];
}

export interface Order {
  id: string;
  table: string;
  items: string[];
  total: number;
  status: 'Completed' | 'Cooking' | 'Pending';
  time: string;
}

export interface KitchenOrder {
  id: string;
  table: string;
  items: {
    name: string;
    quantity: number;
  }[];
  time: string;
}

export interface SalesData {
  name: string;
  sales: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string; // Should not be stored in production db like this
}

export interface TableStatus {
    id: number;
    status: 'Empty' | 'Occupied' | 'Needs Cleaning';
}

export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'all-time';
