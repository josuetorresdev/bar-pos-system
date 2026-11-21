export type TableStatus = 'AVAILABLE' | 'OCCUPIED';
export type OrderStatus = 'OPEN' | 'PAID' | 'CANCELLED';

export interface DiningTable {
  id: number;
  number: number;
  name: string;
  status: TableStatus;
}

export interface Category {
  id: number;
  name: string;
  active: boolean;
}

export interface Product {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  price: number;
  stock: number;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: number;
  tableId: number;
  tableName: string;
  waiterName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  closedAt?: string;
  items: OrderItem[];
}