import React, { useState, useEffect } from 'react';
import { Product, Order, StoreConfig } from '../types';
import { formatRupiah, generateId } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  ShoppingBag,
  Plus,
  Settings,
  History,
  Search,
  PlusCircle,
  MinusCircle,
  Trash2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Edit,
  Save,
  RotateCcw,
  Printer,
  CheckCircle2,
  X,
  CreditCard,
  QrCode,
  FileText
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  storeConfig: StoreConfig;
  onUpdateStoreConfig: (config: StoreConfig) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  onResetProducts: () => void;
}

export default function AdminPanel({
  products,
  orders,
  storeConfig,
  onUpdateStoreConfig,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  onResetProducts,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'products' | 'orders' | 'settings'>('dashboard');

  // --- POS Cashier States ---
  const [posCart, setPosCart] = useState<{
    product: Product;
    quantity: number;
    size: string;
    color: string;
  }[]>([]);
  const [posSearchQuery, setPosSearchQuery] = useState('');
  const [posCategoryFilter, setPosCategoryFilter] = useState('Semua');
  const [posCustomerName, setPosCustomerName] = useState('Pelanggan Umum');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posDiscountType, setPosDiscountType] = useState<'PERCENT' | 'FIXED'>('FIXED');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [posCashReceived, setPosCashReceived] = useState<number>(0);
  const [showReceiptOrder, setShowReceiptOrder] = useState<Order | null>(null);

  // --- Product CRUD States ---
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [selectedProductCategory, setSelectedProductCategory] = useState('Semua');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  // Forms fields
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formCategory, setFormCategory] = useState('');
  const [formStock, setFormStock] = useState<number>(0);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formSizes, setFormSizes] = useState('');
  const [formColors, setFormColors] = useState('');

  // --- Settings States ---
  const [setStoreName, setSetStoreName] = useState(storeConfig.storeName);
  const [setWaNumber, setSetWaNumber] = useState(storeConfig.whatsappNumber);
  const [setAddress, setSetAddress] = useState(storeConfig.address);
  const [setTaxRate, setSetTaxRate] = useState(storeConfig.taxRate);

  // Sync settings inputs when prop updates
  useEffect(() => {
    setSetStoreName(storeConfig.storeName);
    setSetWaNumber(storeConfig.whatsappNumber);
    setSetAddress(storeConfig.address);
    setSetTaxRate(storeConfig.taxRate);
  }, [storeConfig]);

  // CATEGORIES extracted dynamically
  const categoriesList = ['Semua', ...Array.from(new Set(products.map(p => p.category)))];

  // --- Dashboard Logic & Custom Visual Charts ---
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;
  
  // Splits
  const onlineOrders = orders.filter(o => o.type === 'ONLINE');
  const posOrders = orders.filter(o => o.type === 'POS');
  const onlineRevenue = onlineOrders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.total, 0);
  const posRevenue = posOrders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.total, 0);

  // Best Selling Products calculation
  const productSalesMap: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = { name: item.productName, quantity: 0, revenue: 0 };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.price * item.quantity;
    });
  });
  const bestSellers = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Mock Sales Data for past 7 days based on actual orders
  const getSalesHistoryLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      const daysOrders = completedOrders.filter(o => o.date.startsWith(dateString));
      const dailySum = daysOrders.reduce((sum, o) => sum + o.total, 0);
      
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      days.push({
        date: dateString,
        label: dayNames[d.getDay()],
        amount: dailySum,
        count: daysOrders.length
      });
    }
    return days;
  };
  const dailySalesData = getSalesHistoryLast7Days();
  const maxDailyAmount = Math.max(...dailySalesData.map(d => d.amount), 100000); // minimum scale limit

  // --- POS Cashier Functions ---
  const handleAddToPosCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    // Check if product is already in cart with same default size and color
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'All Size';
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Standar';

    const existingIndex = posCart.findIndex(
      item => item.product.id === product.id && item.size === defaultSize && item.color === defaultColor
    );

    if (existingIndex > -1) {
      const updatedCart = [...posCart];
      if (updatedCart[existingIndex].quantity < product.stock) {
        updatedCart[existingIndex].quantity += 1;
        setPosCart(updatedCart);
      }
    } else {
      setPosCart([...posCart, {
        product,
        quantity: 1,
        size: defaultSize,
        color: defaultColor
      }]);
    }
  };

  const handleUpdatePosQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      const updated = posCart.filter((_, i) => i !== index);
      setPosCart(updated);
      return;
    }

    const item = posCart[index];
    if (newQty <= item.product.stock) {
      const updated = [...posCart];
      updated[index].quantity = newQty;
      setPosCart(updated);
    }
  };

  const handleUpdatePosItemOption = (index: number, field: 'size' | 'color', val: string) => {
    const updated = [...posCart];
    updated[index] = {
      ...updated[index],
      [field]: val
    };
    setPosCart(updated);
  };

  const handleRemoveFromPosCart = (index: number) => {
    const updated = posCart.filter((_, i) => i !== index);
    setPosCart(updated);
  };

  const calculatePosSubtotal = () => {
    return posCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const calculatePosDiscountAmount = (sub: number) => {
    if (posDiscountType === 'PERCENT') {
      return (sub * posDiscount) / 100;
    }
    return posDiscount;
  };

  const calculatePosTotal = () => {
    const sub = calculatePosSubtotal();
    const disc = calculatePosDiscountAmount(sub);
    const afterDisc = Math.max(0, sub - disc);
    const tax = (afterDisc * storeConfig.taxRate) / 100;
    return afterDisc + tax;
  };

  const handleCompletePosSale = () => {
    if (posCart.length === 0) return;
    
    const subtotal = calculatePosSubtotal();
    const discountAmt = calculatePosDiscountAmount(subtotal);
    const totalPayable = calculatePosTotal();

    if (posPaymentMethod === 'CASH' && posCashReceived < totalPayable) {
      alert(`Uang tunai yang diterima (${formatRupiah(posCashReceived)}) kurang dari total belanja (${formatRupiah(totalPayable)}).`);
      return;
    }

    // Prepare items for Order
    const orderItems = posCart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color
    }));

    const newOrder: Order = {
      id: generateId('POS'),
      date: new Date().toISOString(),
      items: orderItems,
      total: totalPayable,
      type: 'POS',
      customerName: posCustomerName || 'Pelanggan Umum',
      status: 'COMPLETED',
      cashReceived: posPaymentMethod === 'CASH' ? posCashReceived : totalPayable,
      changeAmount: posPaymentMethod === 'CASH' ? Math.max(0, posCashReceived - totalPayable) : 0
    };

    // 1. Record the order
    onAddOrder(newOrder);

    // 2. Reduce products stock
    posCart.forEach(item => {
      const updatedProduct = { ...item.product };
      updatedProduct.stock = Math.max(0, updatedProduct.stock - item.quantity);
      onUpdateProduct(updatedProduct);
    });

    // 3. Show Receipt Modal
    setShowReceiptOrder(newOrder);

    // 4. Reset POS cash register state
    setPosCart([]);
    setPosCustomerName('Pelanggan Umum');
    setPosDiscount(0);
    setPosCashReceived(0);
  };

  // --- Product CRUD Form Resets ---
  const resetProductForm = () => {
    setEditingProduct(null);
    setIsAddingProduct(false);
    setFormName('');
    setFormPrice(0);
    setFormCategory('');
    setFormStock(0);
    setFormDescription('');
    setFormImage('');
    setFormSizes('S, M, L, XL');
    setFormColors('');
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setIsAddingProduct(false);
    setFormName(prod.name);
    setFormPrice(prod.price);
    setFormCategory(prod.category);
    setFormStock(prod.stock);
    setFormDescription(prod.description);
    setFormImage(prod.image);
    setFormSizes(prod.sizes ? prod.sizes.join(', ') : '');
    setFormColors(prod.colors ? prod.colors.join(', ') : '');
  };

  const handleOpenAddProduct = () => {
    resetProductForm();
    setIsAddingProduct(true);
    setFormCategory(categoriesList[1] || 'Dress');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formPrice <= 0 || formStock < 0) {
      alert('Nama, harga (harus positif), dan stok tidak boleh kosong.');
      return;
    }

    const sizesArray = formSizes ? formSizes.split(',').map(s => s.trim()).filter(Boolean) : [];
    const colorsArray = formColors ? formColors.split(',').map(c => c.trim()).filter(Boolean) : [];

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : generateId('prod'),
      name: formName,
      price: Number(formPrice),
      category: formCategory,
      stock: Number(formStock),
      description: formDescription || 'Tidak ada deskripsi.',
      image: formImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      sizes: sizesArray.length > 0 ? sizesArray : undefined,
      colors: colorsArray.length > 0 ? colorsArray : undefined,
    };

    if (editingProduct) {
      onUpdateProduct(productPayload);
    } else {
      onAddProduct(productPayload);
    }
    resetProductForm();
  };

  // --- Settings Save ---
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreConfig({
      storeName: setStoreName,
      whatsappNumber: setWaNumber,
      address: setAddress,
      currencySymbol: 'Rp',
      taxRate: Number(setTaxRate)
    });
    alert('Pengaturan toko berhasil diperbarui!');
  };

  // Filter products in Admin Manager tab
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(searchProductQuery.toLowerCase());
    const matchCategory = selectedProductCategory === 'Semua' || p.category === selectedProductCategory;
    return matchSearch && matchCategory;
  });

  // Filter products in POS catalog
  const filteredPosProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(posSearchQuery.toLowerCase());
    const matchCategory = posCategoryFilter === 'Semua' || p.category === posCategoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" id="admin-panel-container">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 font-black text-white text-base">
            D
          </div>
          <div>
            <h1 className="font-extrabold text-sm uppercase tracking-wider">{storeConfig.storeName}</h1>
            <span className="text-[10px] text-gray-400 font-medium">Dashboard & POS</span>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'dashboard'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
            id="tab-dashboard"
          >
            <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
            Ringkasan Bisnis
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'pos'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
            id="tab-pos"
          >
            <ShoppingCart className="h-4 w-4 flex-shrink-0" />
            Kasir Point of Sale
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'products'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
            id="tab-products"
          >
            <ShoppingBag className="h-4 w-4 flex-shrink-0" />
            Kelola Produk
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'orders'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
            id="tab-orders"
          >
            <History className="h-4 w-4 flex-shrink-0" />
            Daftar Transaksi
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'settings'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
            id="tab-settings"
          >
            <Settings className="h-4 w-4 flex-shrink-0" />
            Pengaturan Toko
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
          © 2026 {storeConfig.storeName}
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        
        {/* VIEW 1: DASHBOARD / SUMMARY */}
        {activeTab === 'dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8" id="dashboard-tab-content">
            {/* Header */}
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Ringkasan Bisnis</h2>
              <p className="text-xs text-gray-500 mt-1">Laporan penjualan terintegrasi dari toko offline (POS) dan pesanan online WhatsApp.</p>
            </div>

            {/* Indicator Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Pendapatan</span>
                  <h3 className="text-lg font-black text-gray-900 mt-0.5">{formatRupiah(totalRevenue)}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Transaksi</span>
                  <h3 className="text-lg font-black text-gray-900 mt-0.5">{totalOrdersCount} Pesanan</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Rata-rata Transaksi</span>
                  <h3 className="text-lg font-black text-gray-900 mt-0.5">{formatRupiah(averageOrderValue)}</h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Produk Terjual</span>
                  <h3 className="text-lg font-black text-gray-900 mt-0.5">
                    {completedOrders.reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0)} Pcs
                  </h3>
                </div>
              </div>
            </div>

            {/* Graph and Statistics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sales History Line Graph Custom SVG */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Grafik Penjualan (7 Hari Terakhir)</h3>
                    <p className="text-[11px] text-gray-400">Total nilai transaksi sukses harian</p>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-50 text-rose-600 font-bold text-[10px] rounded-lg">LIVE UPDATING</span>
                </div>

                {/* Graph Visualization */}
                <div className="relative h-56 w-full flex items-end pt-6">
                  {/* Grid background lines */}
                  <div className="absolute inset-x-0 bottom-0 top-6 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-gray-100 w-full" />
                    <div className="border-t border-gray-100 w-full" />
                    <div className="border-t border-gray-100 w-full" />
                    <div className="border-t border-gray-100 w-full" />
                  </div>

                  {/* Graph Columns */}
                  <div className="w-full h-full flex justify-between items-end relative z-10 px-2">
                    {dailySalesData.map((data, idx) => {
                      const heightPercent = (data.amount / maxDailyAmount) * 80 + 5; // offset bottom/top
                      return (
                        <div key={idx} className="flex flex-col items-center flex-1 group">
                          {/* Hover Tooltip */}
                          <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded-md -translate-y-12 z-20 shadow-lg pointer-events-none">
                            {formatRupiah(data.amount)} ({data.count} Transaksi)
                          </div>
                          
                          {/* Animated Pillar */}
                          <div className="w-7 sm:w-10 rounded-t-lg bg-gradient-to-t from-rose-500 to-rose-400 relative transition-all duration-500 hover:from-rose-600 hover:to-rose-500 cursor-pointer shadow-xs" style={{ height: `${heightPercent}%` }}>
                            <div className="absolute inset-x-0 top-0 h-1 bg-white/20 rounded-t-lg" />
                          </div>
                          
                          <span className="text-[11px] font-bold text-gray-600 mt-2">{data.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Channel Split and Stock Alerts */}
              <div className="flex flex-col gap-6">
                {/* Channel split card */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
                  <h3 className="text-sm font-bold text-gray-900">Saluran Penjualan</h3>
                  <p className="text-[11px] text-gray-400">Distribusi pendapatan toko</p>
                  
                  <div className="mt-5 space-y-4">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-bold text-gray-700">
                        <span className="flex items-center gap-1.5"><ShoppingCart className="h-3.5 w-3.5 text-indigo-500" /> POS Kasir (Offline)</span>
                        <span>{formatRupiah(posRevenue)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${totalRevenue > 0 ? (posRevenue / totalRevenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-bold text-gray-700">
                        <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp (Online)</span>
                        <span>{formatRupiah(onlineRevenue)}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${totalRevenue > 0 ? (onlineRevenue / totalRevenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Critical Stock Alert Card */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex-1">
                  <h3 className="text-sm font-bold text-gray-900">Peringatan Stok Tipis</h3>
                  <p className="text-[11px] text-gray-400">Segera restok baju wanita berikut</p>
                  
                  <div className="mt-4 divide-y divide-gray-50 max-h-36 overflow-y-auto">
                    {products.filter(p => p.stock <= 5).length === 0 ? (
                      <p className="text-xs text-gray-400 py-3 text-center">Semua stok produk dalam kondisi aman. 👍</p>
                    ) : (
                      products
                        .filter(p => p.stock <= 5)
                        .map(p => (
                          <div key={p.id} className="flex justify-between items-center py-2 text-xs">
                            <span className="font-semibold text-gray-800 line-clamp-1 flex-1 pr-4">{p.name}</span>
                            <span className="font-black px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md">
                              {p.stock} pcs
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Best Sellers & Recent Logs Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Best Sellers */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
                <h3 className="text-sm font-bold text-gray-900">Produk Paling Laris</h3>
                <p className="text-[11px] text-gray-400">Peringkat 5 produk dengan penjualan terbanyak</p>
                
                <div className="mt-4 space-y-4">
                  {bestSellers.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400">Belum ada data penjualan tercatat.</div>
                  ) : (
                    bestSellers.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-rose-500 text-sm w-4">{idx + 1}</span>
                          <span className="font-bold text-gray-800">{item.name}</span>
                        </div>
                        <div className="flex gap-4 font-semibold text-gray-500">
                          <span>{item.quantity} Terjual</span>
                          <span className="text-gray-900 font-extrabold">{formatRupiah(item.revenue)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Orders in Dashboard */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Pesanan Terbaru</h3>
                    <p className="text-[11px] text-gray-400">Aktivitas pesanan masuk terkini</p>
                  </div>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-rose-600 hover:underline">
                    Lihat Semua
                  </button>
                </div>
                
                <div className="mt-4 divide-y divide-gray-50">
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-xs text-gray-400">Belum ada pesanan yang masuk.</div>
                  ) : (
                    orders.slice(0, 4).map(o => (
                      <div key={o.id} className="flex justify-between items-center py-3 text-xs">
                        <div>
                          <p className="font-bold text-gray-800">{o.customerName}</p>
                          <p className="text-[10px] text-gray-400">{new Date(o.date).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-gray-900">{formatRupiah(o.total)}</p>
                          <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            o.type === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {o.type}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: POINT OF SALE (POS) */}
        {activeTab === 'pos' && (
          <div className="flex-1 flex overflow-hidden bg-gray-100" id="pos-tab-content">
            
            {/* Left Column: Product Grid */}
            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
              {/* POS Controls */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari baju di kasir..."
                    value={posSearchQuery}
                    onChange={e => setPosSearchQuery(e.target.value)}
                    className="w-full bg-white pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 focus:outline-hidden focus:border-rose-500"
                    id="pos-search-input"
                  />
                </div>
                {/* Category Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
                  {categoriesList.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setPosCategoryFilter(cat)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        posCategoryFilter === cat
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                      id={`pos-cat-filter-${cat}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                {filteredPosProducts.map(p => {
                  const isInCart = posCart.some(item => item.product.id === p.id);
                  const isOutOfStock = p.stock <= 0;
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && handleAddToPosCart(p)}
                      className={`relative flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer select-none transition-all hover:shadow-md hover:border-rose-300 ${
                        isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      id={`pos-product-${p.id}`}
                    >
                      {/* Image */}
                      <div className="relative aspect-square w-full bg-gray-50">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-cover object-top"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80';
                          }}
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider bg-red-600 px-2 py-1 rounded">Habis</span>
                          </div>
                        )}
                        {p.stock <= 5 && !isOutOfStock && (
                          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md">
                            Sisa {p.stock}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{p.name}</h4>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs font-black text-rose-600">{formatRupiah(p.price)}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">{p.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Active Receipt Cart */}
            <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full shadow-lg">
              {/* Receipt Header */}
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="h-4.5 w-4.5 text-rose-600" /> POS KASIR AKTIF
                </h3>
              </div>

              {/* Cart List */}
              <div className="flex-1 overflow-y-auto px-5 divide-y divide-gray-100">
                {posCart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
                    <ShoppingCart className="h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-xs font-bold">Belanjaan Masih Kosong</p>
                    <p className="text-[10px] text-gray-400 mt-1">Tap baju di sebelah kiri untuk memasukkan ke struk kasir.</p>
                  </div>
                ) : (
                  posCart.map((item, index) => (
                    <div key={`${item.product.id}-${index}`} className="py-3 flex gap-3" id={`pos-cart-item-${index}`}>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{item.product.name}</h4>
                        
                        {/* Options Pill selectors */}
                        <div className="flex gap-1.5 mt-1.5">
                          {/* Size picker */}
                          {item.product.sizes && (
                            <select
                              value={item.size}
                              onChange={(e) => handleUpdatePosItemOption(index, 'size', e.target.value)}
                              className="text-[10px] font-bold border border-gray-200 rounded px-1 py-0.5 bg-gray-50 focus:outline-hidden"
                            >
                              {item.product.sizes.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          )}
                          
                          {/* Color picker */}
                          {item.product.colors && (
                            <select
                              value={item.color}
                              onChange={(e) => handleUpdatePosItemOption(index, 'color', e.target.value)}
                              className="text-[10px] font-bold border border-gray-200 rounded px-1 py-0.5 bg-gray-50 focus:outline-hidden"
                            >
                              {item.product.colors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          )}
                        </div>

                        {/* Adjuster controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                            <button
                              onClick={() => handleUpdatePosQty(index, item.quantity - 1)}
                              className="h-5 w-5 flex items-center justify-center hover:bg-gray-100 text-gray-500"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-[11px] font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdatePosQty(index, item.quantity + 1)}
                              className="h-5 w-5 flex items-center justify-center hover:bg-gray-100 text-gray-500"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-400">@{formatRupiah(item.product.price)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => handleRemoveFromPosCart(index)}
                          className="text-gray-300 hover:text-red-500 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-black text-gray-800">{formatRupiah(item.product.price * item.quantity)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Receipt Footer - Inputs, Totals & Payment */}
              {posCart.length > 0 && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3.5">
                  
                  {/* Customer & Discount Inputs */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nama Pelanggan</label>
                      <input
                        type="text"
                        placeholder="Pelanggan Umum"
                        value={posCustomerName}
                        onChange={e => setPosCustomerName(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Diskon (Nominal)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={posDiscount === 0 ? '' : posDiscount}
                        onChange={e => setPosDiscount(Number(e.target.value))}
                        className="w-full bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Metode Pembayaran</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => setPosPaymentMethod('CASH')}
                        className={`py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                          posPaymentMethod === 'CASH'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <DollarSign className="h-3.5 w-3.5" /> Tunai
                      </button>
                      <button
                        onClick={() => setPosPaymentMethod('QRIS')}
                        className={`py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                          posPaymentMethod === 'QRIS'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <QrCode className="h-3.5 w-3.5" /> QRIS
                      </button>
                      <button
                        onClick={() => setPosPaymentMethod('TRANSFER')}
                        className={`py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition-colors ${
                          posPaymentMethod === 'TRANSFER'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Transfer
                      </button>
                    </div>
                  </div>

                  {/* Cash Received section */}
                  {posPaymentMethod === 'CASH' && (
                    <div className="p-2.5 bg-white border border-gray-200 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <label className="font-bold text-gray-600">Diterima (Uang Tunai)</label>
                        <input
                          type="number"
                          value={posCashReceived === 0 ? '' : posCashReceived}
                          onChange={e => setPosCashReceived(Number(e.target.value))}
                          placeholder="Masukkan nominal"
                          className="w-32 bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-right font-bold focus:outline-hidden"
                          id="cash-received-input"
                        />
                      </div>
                      
                      {/* Shortcut buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => setPosCashReceived(calculatePosTotal())}
                          className="flex-1 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                        >
                          Uang Pas
                        </button>
                        <button
                          onClick={() => setPosCashReceived(50000)}
                          className="flex-1 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                        >
                          50K
                        </button>
                        <button
                          onClick={() => setPosCashReceived(100000)}
                          className="flex-1 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                        >
                          100K
                        </button>
                        <button
                          onClick={() => setPosCashReceived(200000)}
                          className="flex-1 py-1 text-[10px] font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                        >
                          200K
                        </button>
                      </div>

                      {posCashReceived >= calculatePosTotal() && (
                        <div className="flex justify-between items-center text-xs font-bold pt-1 border-t border-gray-100 text-emerald-600">
                          <span>Kembalian</span>
                          <span>{formatRupiah(posCashReceived - calculatePosTotal())}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Receipt totals calc */}
                  <div className="space-y-1.5 pt-1 border-t border-gray-200 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold">{formatRupiah(calculatePosSubtotal())}</span>
                    </div>
                    {posDiscount > 0 && (
                      <div className="flex justify-between text-red-600">
                        <span>Diskon</span>
                        <span className="font-bold">-{formatRupiah(calculatePosDiscountAmount(calculatePosSubtotal()))}</span>
                      </div>
                    )}
                    {storeConfig.taxRate > 0 && (
                      <div className="flex justify-between">
                        <span>PPN ({storeConfig.taxRate}%)</span>
                        <span className="font-bold">
                          {formatRupiah((Math.max(0, calculatePosSubtotal() - calculatePosDiscountAmount(calculatePosSubtotal())) * storeConfig.taxRate) / 100)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-gray-900 pt-1.5 border-t border-gray-200">
                      <span>Total Tagihan</span>
                      <span className="text-base text-rose-600">{formatRupiah(calculatePosTotal())}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCompletePosSale}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-rose-200 text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                    id="btn-complete-pos-sale"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" /> Selesaikan & Cetak Nota
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: MANAGE PRODUCTS */}
        {activeTab === 'products' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6" id="products-tab-content">
            
            {/* Header / CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Kelola Produk</h2>
                <p className="text-xs text-gray-500 mt-1">Tambahkan, ubah rincian baju, atau sesuaikan stok katalog Anda.</p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-sm"
                id="btn-add-product"
              >
                <Plus className="h-4.5 w-4.5" /> Tambah Produk Baru
              </button>
            </div>

            {/* Product Filters */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari berdasarkan nama atau deskripsi..."
                  value={searchProductQuery}
                  onChange={e => setSearchProductQuery(e.target.value)}
                  className="w-full bg-gray-50 pl-10 pr-4 py-2 text-sm font-medium border border-gray-200 rounded-xl focus:outline-hidden focus:border-rose-500"
                  id="admin-product-search"
                />
              </div>
              <select
                value={selectedProductCategory}
                onChange={e => setSelectedProductCategory(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-600 focus:outline-hidden"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat === 'Semua' ? 'Semua Kategori' : cat}</option>
                ))}
              </select>
            </div>

            {/* List / Table of Products */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Baju</th>
                      <th className="py-4 px-6">Kategori</th>
                      <th className="py-4 px-6">Harga</th>
                      <th className="py-4 px-6">Stok</th>
                      <th className="py-4 px-6">Ukuran & Warna</th>
                      <th className="py-4 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50" id={`table-row-${p.id}`}>
                        <td className="py-4 px-6 flex items-center gap-4">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-12 w-10 object-cover object-top rounded-md"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <span className="font-extrabold text-gray-900 block">{p.name}</span>
                            <span className="text-[10px] text-gray-400 block line-clamp-1 max-w-xs mt-0.5">{p.description}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-bold text-[10px] uppercase">{p.category}</span>
                        </td>
                        <td className="py-4 px-6 font-extrabold text-gray-900">{formatRupiah(p.price)}</td>
                        <td className="py-4 px-6">
                          <span className={`font-black ${p.stock <= 5 ? 'text-amber-600' : 'text-gray-900'}`}>{p.stock} pcs</span>
                        </td>
                        <td className="py-4 px-6 space-y-1">
                          {p.sizes && (
                            <div className="text-[10px] text-gray-500">
                              Size: <strong className="text-gray-700">{p.sizes.join(', ')}</strong>
                            </div>
                          )}
                          {p.colors && (
                            <div className="text-[10px] text-gray-500">
                              Warna: <strong className="text-gray-700">{p.colors.join(', ')}</strong>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                              id={`edit-prod-btn-${p.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if(confirm(`Yakin ingin menghapus ${p.name}?`)) {
                                  onDeleteProduct(p.id);
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus"
                              id={`delete-prod-btn-${p.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ADD / EDIT MODAL FOR PRODUCT */}
            {(isAddingProduct || editingProduct) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={resetProductForm} />
                <div className="relative z-10 bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  
                  {/* Modal Header */}
                  <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-gray-900 text-sm uppercase tracking-wider">
                      {editingProduct ? 'Edit Rincian Produk' : 'Tambah Produk Baju Baru'}
                    </h3>
                    <button onClick={resetProductForm} className="text-gray-400 hover:text-gray-900">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Form Scroll Container */}
                  <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nama Baju</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={e => setFormName(e.target.value)}
                        placeholder="Contoh: Tunik Muslimah Silk"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Harga (IDR)</label>
                        <input
                          type="number"
                          required
                          value={formPrice || ''}
                          onChange={e => setFormPrice(Number(e.target.value))}
                          placeholder="125000"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Stok Awal</label>
                        <input
                          type="number"
                          required
                          value={formStock === 0 ? '' : formStock}
                          onChange={e => setFormStock(Number(e.target.value))}
                          placeholder="20"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Kategori</label>
                        <select
                          value={formCategory}
                          onChange={e => setFormCategory(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-hidden text-gray-600"
                        >
                          <option value="Dress">Dress</option>
                          <option value="Blouse">Blouse</option>
                          <option value="Outerwear">Outerwear</option>
                          <option value="Hijab">Hijab</option>
                          <option value="Celana">Celana</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Link Foto Produk (URL)</label>
                        <input
                          type="text"
                          value={formImage}
                          onChange={e => setFormImage(e.target.value)}
                          placeholder="URL Unsplash atau Link Foto"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Pilihan Ukuran (Pisahkan Koma)</label>
                        <input
                          type="text"
                          value={formSizes}
                          onChange={e => setFormSizes(e.target.value)}
                          placeholder="S, M, L, XL"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Pilihan Warna (Pisahkan Koma)</label>
                        <input
                          type="text"
                          value={formColors}
                          onChange={e => setFormColors(e.target.value)}
                          placeholder="Sage Green, Dusty Pink, Black"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Deskripsi Lengkap</label>
                      <textarea
                        rows={3}
                        value={formDescription}
                        onChange={e => setFormDescription(e.target.value)}
                        placeholder="Rincian bahan, ukuran detail, dan instruksi perawatan baju..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden resize-none"
                      />
                    </div>

                    {/* Submit footer in modal */}
                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                      <button
                        type="button"
                        onClick={resetProductForm}
                        className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold uppercase tracking-wider"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md shadow-rose-200"
                        id="save-product-submit"
                      >
                        Simpan Rincian
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: TRANSACTION LOGS / ORDERS */}
        {activeTab === 'orders' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6" id="orders-tab-content">
            
            {/* Header */}
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Daftar Transaksi</h2>
              <p className="text-xs text-gray-500 mt-1">Audit log semua penjualan, baik dari POS Kasir maupun Checkout WhatsApp.</p>
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">ID Transaksi</th>
                      <th className="py-4 px-6">Tanggal & Jam</th>
                      <th className="py-4 px-6">Pelanggan</th>
                      <th className="py-4 px-6">Kanal</th>
                      <th className="py-4 px-6">Total Belanja</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-gray-400 text-xs font-bold">
                          Belum ada transaksi terekam di sistem.
                        </td>
                      </tr>
                    ) : (
                      orders.map(o => (
                        <tr key={o.id} className="hover:bg-gray-50/50" id={`order-row-${o.id}`}>
                          <td className="py-4 px-6 font-mono text-[11px] font-bold text-gray-500">{o.id}</td>
                          <td className="py-4 px-6">
                            {new Date(o.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-extrabold text-gray-900 block">{o.customerName}</span>
                            {o.customerPhone && <span className="text-[10px] text-gray-400 block mt-0.5">{o.customerPhone}</span>}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                              o.type === 'ONLINE' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                            }`}>
                              {o.type === 'ONLINE' ? 'WhatsApp' : 'POS Kasir'}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-extrabold text-rose-600">{formatRupiah(o.total)}</td>
                          <td className="py-4 px-6">
                            <select
                              value={o.status}
                              onChange={(e) => {
                                const updated = { ...o, status: e.target.value as Order['status'] };
                                onUpdateOrder(updated);
                              }}
                              className={`text-[10px] font-bold border rounded-lg px-2 py-1 focus:outline-hidden ${
                                o.status === 'COMPLETED'
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : o.status === 'PENDING'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="COMPLETED">COMPLETED</option>
                              <option value="CANCELLED">BATAL</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setShowReceiptOrder(o)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Lihat Nota Struk"
                                id={`view-receipt-${o.id}`}
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm('Yakin ingin menghapus riwayat transaksi ini? Tindakan ini tidak mengurangi/mengembalikan stok secara otomatis.')) {
                                    onDeleteOrder(o.id);
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Riwayat"
                                id={`delete-order-${o.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6" id="settings-tab-content">
            
            {/* Header */}
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Pengaturan Toko</h2>
              <p className="text-xs text-gray-500 mt-1">Konfigurasi profile UMKM, nomor WhatsApp untuk checkout, dan detail struk.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Settings Left */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs lg:col-span-2 space-y-5">
                <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nama Brand Toko</label>
                    <input
                      type="text"
                      required
                      value={setStoreName}
                      onChange={e => setSetStoreName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nomor WhatsApp Admin (Kode Negara, misal: 62)</label>
                    <input
                      type="text"
                      required
                      value={setWaNumber}
                      onChange={e => setSetWaNumber(e.target.value)}
                      placeholder="628123456789"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Pastikan menggunakan format kode negara di awal (misal 628xxx) tanpa tanda tambah (+).</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Pajak PPN (%)</label>
                      <input
                        type="number"
                        value={setTaxRate === 0 ? '' : setTaxRate}
                        onChange={e => setSetTaxRate(Number(e.target.value))}
                        placeholder="0"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Mata Uang</label>
                      <input
                        type="text"
                        disabled
                        value="Rupiah (Rp)"
                        className="w-full bg-gray-200 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-hidden text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Alamat Fisik Toko (Muncul di Nota POS)</label>
                    <textarea
                      rows={3}
                      value={setAddress}
                      onChange={e => setSetAddress(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-hidden resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-rose-200 flex items-center gap-1.5"
                    id="btn-save-settings"
                  >
                    <Save className="h-4.5 w-4.5" /> Simpan Pengaturan
                  </button>
                </form>
              </div>

              {/* Maintenance Tools Right */}
              <div className="space-y-6">
                <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl space-y-4">
                  <h4 className="font-extrabold text-amber-800 text-xs uppercase tracking-wider">Pusat Pemulihan Data</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Jika Anda ingin menghapus semua perubahan produk uji coba dan mengembalikan katalog awal baju wanita bawaan DEV Store, silakan klik tombol reset di bawah.
                  </p>
                  <button
                    onClick={() => {
                      if (confirm('Yakin ingin mereset seluruh produk? Seluruh produk kustom Anda akan terhapus dan kembali ke produk awal.')) {
                        onResetProducts();
                        alert('Katalog produk berhasil di-reset!');
                      }
                    }}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-1.5"
                    id="btn-reset-data"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset ke Produk Bawaan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* THERMAL PAPER RECEIPT INVOICE MODAL VIEW */}
      <AnimatePresence>
        {showReceiptOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowReceiptOrder(null)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative z-10 bg-white p-6 rounded-3xl w-full max-w-sm shadow-2xl flex flex-col items-center border border-gray-100 overflow-hidden max-h-[90vh]"
            >
              {/* Close receipt */}
              <button
                onClick={() => setShowReceiptOrder(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Receipt Body Frame */}
              <div className="flex-1 overflow-y-auto w-full pt-4 px-2" id="thermal-receipt-container">
                {/* Simulated thermal paper wrap */}
                <div className="bg-slate-50 border-2 border-dashed border-gray-300 p-5 rounded-lg text-slate-800 font-mono text-xs space-y-4">
                  
                  {/* Shop Branding */}
                  <div className="text-center space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-widest">{storeConfig.storeName}</h4>
                    <p className="text-[10px] text-slate-500 uppercase leading-tight">{storeConfig.address}</p>
                    <p className="text-[10px] text-slate-500 font-bold">WA: {storeConfig.whatsappNumber}</p>
                  </div>

                  <div className="border-t border-dashed border-gray-400 my-2" />

                  {/* Meta details */}
                  <div className="space-y-0.5 text-[10px] text-slate-600">
                    <p>ID NOTA: {showReceiptOrder.id}</p>
                    <p>TANGGAL: {new Date(showReceiptOrder.date).toLocaleString('id-ID')}</p>
                    <p>KASIR  : ADMIN-DEV-STORE</p>
                    <p>PEMESAN: {showReceiptOrder.customerName.toUpperCase()}</p>
                  </div>

                  <div className="border-t border-dashed border-gray-400 my-2" />

                  {/* Items List */}
                  <div className="space-y-2">
                    {showReceiptOrder.items.map((item, idx) => {
                      const itemTotal = item.price * item.quantity;
                      const optStr = (item.size || item.color) ? ` (${[item.size, item.color].filter(Boolean).join('/')})` : '';
                      return (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex justify-between font-bold">
                            <span>{item.productName}{optStr}</span>
                            <span>{formatRupiah(itemTotal)}</span>
                          </div>
                          <div className="text-slate-500 text-[10px] flex justify-between">
                            <span>{item.quantity} pcs x {formatRupiah(item.price)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-dashed border-gray-400 my-2" />

                  {/* Price Calculations */}
                  <div className="space-y-1 text-right">
                    <div className="flex justify-between">
                      <span>SUBTOTAL:</span>
                      <span>{formatRupiah(showReceiptOrder.items.reduce((sum, i) => sum + i.price * i.quantity, 0))}</span>
                    </div>
                    {/* Display mock discount info if POS and recorded */}
                    {showReceiptOrder.type === 'POS' && (
                      <div className="flex justify-between text-slate-500">
                        <span>METODE BAYAR:</span>
                        <span>{showReceiptOrder.cashReceived && showReceiptOrder.cashReceived > showReceiptOrder.total ? 'TUNAI' : 'QRIS/TRANSFER'}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-sm pt-1">
                      <span>TOTAL BILL:</span>
                      <span>{formatRupiah(showReceiptOrder.total)}</span>
                    </div>

                    {showReceiptOrder.cashReceived && (
                      <>
                        <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                          <span>DITERIMA:</span>
                          <span>{formatRupiah(showReceiptOrder.cashReceived)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>KEMBALIAN:</span>
                          <span>{formatRupiah(showReceiptOrder.changeAmount || 0)}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="border-t border-dashed border-gray-400 my-2" />

                  {/* Footnote */}
                  <div className="text-center text-[10px] text-slate-500 space-y-1">
                    <p className="font-bold">TERIMA KASIH TELAH BERBELANJA</p>
                    <p>Produk yang sudah dibeli tidak dapat ditukar/dikembalikan kecuali cacat produksi.</p>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 w-full flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> Cetak Nota
                </button>
                <button
                  onClick={() => setShowReceiptOrder(null)}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold uppercase tracking-wider text-center"
                >
                  Selesai
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
