'use client';

import { useEffect, useState } from 'react';
import { posApi } from '@/services/api';
import { Category, DiningTable, Order, Product } from '@/types/pos';

export default function PosDashboard() {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos iniciales (mesas, categorías y productos)
  const loadInitialData = async () => {
    try {
      const [tablesData, categoriesData, productsData] = await Promise.all([
        posApi.getTables(),
        posApi.getCategories(),
        posApi.getProducts(),
      ]);
      setTables(tablesData);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (err) {
      setError('No se pudo conectar con el servidor de Spring Boot (puerto 8080).');
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Seleccionar una mesa (abrirla si está libre o cargar su orden si está ocupada)
  const handleSelectTable = async (table: DiningTable) => {
    setError(null);
    setSelectedTable(table);
    setLoading(true);

    try {
      if (table.status === 'AVAILABLE') {
        const newOrder = await posApi.openTableOrder(table.id);
        setActiveOrder(newOrder);
        // Actualizar estado visual de las mesas
        setTables((prev) =>
          prev.map((t) => (t.id === table.id ? { ...t, status: 'OCCUPIED' } : t))
        );
      } else {
        const existingOrder = await posApi.getOpenOrderByTable(table.id);
        setActiveOrder(existingOrder);
      }
    } catch (err: any) {
      setError(err.message || 'Error al gestionar la mesa');
    } finally {
      setLoading(false);
    }
  };

  // Agregar un producto a la orden abierta
  const handleAddProduct = async (product: Product) => {
    if (!activeOrder) {
      setError('Selecciona primero una mesa para agregar productos.');
      return;
    }
    if (product.stock <= 0) {
      setError(`Sin stock disponible para ${product.name}`);
      return;
    }

    setError(null);
    try {
      const updatedOrder = await posApi.addItemToOrder(activeOrder.id, product.id, 1);
      setActiveOrder(updatedOrder);
      // Descontar visualmente el stock en el catálogo
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock - 1 } : p))
      );
    } catch (err: any) {
      setError(err.message || 'Error al agregar producto');
    }
  };

  // Cerrar y cobrar la cuenta
  const handleCloseAndPay = async () => {
    if (!activeOrder || !selectedTable) return;

    setLoading(true);
    setError(null);
    try {
      await posApi.closeAndPayOrder(activeOrder.id);
      setTables((prev) =>
        prev.map((t) => (t.id === selectedTable.id ? { ...t, status: 'AVAILABLE' } : t))
      );
      setActiveOrder(null);
      setSelectedTable(null);
    } catch (err: any) {
      setError(err.message || 'Error al cobrar la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-amber-400">Bar POS System</h1>
          <p className="text-xs text-slate-400">Terminal de Meseros y Caja</p>
        </div>
        {error && (
          <div className="bg-red-950/80 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
      </header>

      {/* Main Grid: 3 Columnas */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Columna 1: Mapa de Mesas (3 cols) */}
        <section className="lg:col-span-3 bg-slate-900 rounded-xl p-4 border border-slate-800">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Mesas y Barra
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {tables.map((table) => {
              const isSelected = selectedTable?.id === table.id;
              const isOccupied = table.status === 'OCCUPIED';

              return (
                <button
                  key={table.id}
                  onClick={() => handleSelectTable(table)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'ring-2 ring-amber-400 border-amber-400'
                      : 'border-slate-700 hover:border-slate-500'
                  } ${
                    isOccupied
                      ? 'bg-amber-950/40 text-amber-100'
                      : 'bg-emerald-950/30 text-emerald-100'
                  }`}
                >
                  <div className="font-bold text-base">{table.name}</div>
                  <div className="text-xs mt-1 font-medium">
                    {isOccupied ? '● Ocupada' : '○ Disponible'}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Columna 2: Menú y Productos (5 cols) */}
        <section className="lg:col-span-5 bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Menú del Bar
          </h2>

          {/* Filtro por Categorías */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-slate-800">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                selectedCategory === null
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleAddProduct(product)}
                disabled={!activeOrder || product.stock <= 0}
                className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-amber-500/60 disabled:opacity-40 disabled:cursor-not-allowed text-left transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-amber-400/80">
                    {product.categoryName}
                  </span>
                  <h3 className="font-semibold text-slate-100 mt-0.5">{product.name}</h3>
                </div>
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-slate-700/60">
                  <span className="font-bold text-emerald-400">
                    ${Number(product.price).toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">Stock: {product.stock}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Columna 3: Comanda / Cuenta Activa (4 cols) */}
        <section className="lg:col-span-4 bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Cuenta Activa
              </h2>
              {selectedTable && (
                <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 text-xs font-bold">
                  {selectedTable.name} • Orden #{activeOrder?.id}
                </span>
              )}
            </div>

            {!activeOrder ? (
              <div className="h-64 flex items-center justify-center text-slate-500 text-sm text-center px-6">
                {loading
                  ? 'Cargando orden...'
                  : 'Selecciona una mesa disponible para abrir cuenta o una ocupada para ver su consumo.'}
              </div>
            ) : (
              <div className="mt-4 space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {activeOrder.items.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Aún no hay productos en esta cuenta. Haz clic en el menú para agregar.
                  </p>
                ) : (
                  activeOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg border border-slate-700/50"
                    >
                      <div>
                        <div className="font-medium text-sm text-slate-100">
                          {item.quantity}x {item.productName}
                        </div>
                        <div className="text-xs text-slate-400">
                          ${Number(item.unitPrice).toFixed(2)} c/u
                        </div>
                      </div>
                      <div className="font-semibold text-slate-100">
                        ${Number(item.subtotal).toFixed(2)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Totales y Botón de Cobro */}
          {activeOrder && (
            <div className="pt-4 border-t border-slate-800 mt-4">
              <div className="flex justify-between items-center text-lg font-bold mb-4">
                <span className="text-slate-300">Total a Pagar</span>
                <span className="text-2xl text-emerald-400">
                  ${Number(activeOrder.total).toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCloseAndPay}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-colors disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Cerrar y Cobrar Cuenta'}
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}