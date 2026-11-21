import { Category, DiningTable, Order, Product } from '@/types/pos';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const posApi = {
  // Mesas
  getTables: async (): Promise<DiningTable[]> => {
    const res = await fetch(`${API_URL}/tables`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar mesas');
    return res.json();
  },

  // Catálogo
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch(`${API_URL}/catalog/categories`);
    if (!res.ok) throw new Error('Error al cargar categorías');
    return res.json();
  },

  getProducts: async (categoryId?: number): Promise<Product[]> => {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    const res = await fetch(`${API_URL}/catalog/products${query}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar productos');
    return res.json();
  },

  // Órdenes
  openTableOrder: async (tableId: number, userId = 2): Promise<Order> => {
    const res = await fetch(`${API_URL}/orders/open?tableId=${tableId}&userId=${userId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('No se pudo abrir la mesa');
    return res.json();
  },

  getOpenOrderByTable: async (tableId: number): Promise<Order> => {
    const res = await fetch(`${API_URL}/orders/table/${tableId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se encontró orden activa');
    return res.json();
  },

  addItemToOrder: async (orderId: number, productId: number, quantity: number, notes = ''): Promise<Order> => {
    const res = await fetch(`${API_URL}/orders/${orderId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity, notes }),
    });
    if (!res.ok) throw new Error('Error al agregar producto (revisa el stock)');
    return res.json();
  },

  closeAndPayOrder: async (orderId: number): Promise<Order> => {
    const res = await fetch(`${API_URL}/orders/${orderId}/pay`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al cerrar y cobrar la cuenta');
    return res.json();
  },
};