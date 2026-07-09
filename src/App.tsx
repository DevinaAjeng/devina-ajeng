import { useState, useEffect } from 'react';
import { Product, CartItem, Order, StoreConfig, UserProfile, UserRole } from './types';
import { INITIAL_PRODUCTS, CATEGORIES } from './constants/initialProducts';
import { generateId } from './utils';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';

// Import local images so Vite can bundle them and generate correct production URLs
// @ts-ignore
import dressModel from './assets/images/dress_model_1783601120735.jpg';
// @ts-ignore
import knitwearModel from './assets/images/knitwear_model_1783601135331.jpg';

const LOCAL_STORAGE_PRODUCTS_KEY = 'devstore_products_v2';
const LOCAL_STORAGE_ORDERS_KEY = 'devstore_orders_v1';
const LOCAL_STORAGE_CONFIG_KEY = 'devstore_config_v1';

// Pre-configured elegant demo sales history to populate analytics immediately
const getMockOrders = (): Order[] => {
  const t = new Date();
  const formatOffsetDate = (daysAgo: number, hours: number) => {
    const d = new Date(t);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, 0, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'demo-ord-1',
      date: formatOffsetDate(4, 11),
      items: [
        { productId: 'prod-1', productName: 'Aurelia Floral Midi Dress', price: 189000, quantity: 1, size: 'M', color: 'Dusty Pink' },
        { productId: 'prod-5', productName: 'Korean Aesthetic Plaid Blazer', price: 225000, quantity: 1, size: 'L', color: 'Beige Plaid' }
      ],
      total: 414000,
      type: 'ONLINE',
      customerName: 'Alya Rohali',
      customerPhone: '081234902123',
      status: 'COMPLETED'
    },
    {
      id: 'demo-ord-2',
      date: formatOffsetDate(3, 15),
      items: [
        { productId: 'prod-2', productName: 'Knit Cardigan Premium Oversized', price: 135000, quantity: 1, size: 'All Size', color: 'Cream' },
        { productId: 'prod-6', productName: 'Pleated Culottes Highwaist', price: 99000, quantity: 1, size: 'All Size fit to XL', color: 'Black' }
      ],
      total: 234000,
      type: 'POS',
      customerName: 'Niken Safitri',
      status: 'COMPLETED',
      cashReceived: 250000,
      changeAmount: 16000
    },
    {
      id: 'demo-ord-3',
      date: formatOffsetDate(2, 10),
      items: [
        { productId: 'prod-3', productName: 'Linen Casual Blouse', price: 110000, quantity: 1, size: 'M', color: 'Off-White' }
      ],
      total: 110000,
      type: 'POS',
      customerName: 'Pelanggan Umum',
      status: 'COMPLETED',
      cashReceived: 110000,
      changeAmount: 0
    },
    {
      id: 'demo-ord-4',
      date: formatOffsetDate(1, 14),
      items: [
        { productId: 'prod-1', productName: 'Aurelia Floral Midi Dress', price: 189000, quantity: 1, size: 'S', color: 'Sage Green' },
        { productId: 'prod-4', productName: 'Pashmina Silk Premium', price: 65000, quantity: 2, size: 'Standar', color: 'Rose Gold' }
      ],
      total: 319000,
      type: 'ONLINE',
      customerName: 'Farida Hasan',
      customerPhone: '08987654321',
      status: 'PENDING'
    },
    {
      id: 'demo-ord-5',
      date: formatOffsetDate(0, 9), // Today morning
      items: [
        { productId: 'prod-7', productName: 'Satin Silk Slip Dress Elegance', price: 249000, quantity: 1, size: 'M', color: 'Emerald Green' }
      ],
      total: 249000,
      type: 'POS',
      customerName: 'Amara Putri',
      status: 'COMPLETED',
      cashReceived: 300000,
      changeAmount: 51000
    }
  ];
};

const DEFAULT_STORE_CONFIG: StoreConfig = {
  storeName: 'DEV Store',
  whatsappNumber: '628123456789', // Indonesia WA code prefix format
  address: 'Ruko Fashion Elit Kav 3A, Jl. Jend. Sudirman, Jakarta Selatan, 12190',
  currencySymbol: 'Rp',
  taxRate: 0 // Default to 0% PPN, customizable
};

export default function App() {
  // --- Core Persistent State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [storeConfig, setStoreConfig] = useState<StoreConfig>(DEFAULT_STORE_CONFIG);

  // --- User Profile & Role State ---
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('devstore_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return {
      name: 'Tamu Cantik',
      phone: '',
      role: 'CUSTOMER' as UserRole,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
  });

  // Save profile changes and control permissions dynamically
  const handleUpdateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('devstore_user_profile', JSON.stringify(profile));
    
    if (profile.role === 'CUSTOMER') {
      setIsAdminAuthenticated(false);
    } else {
      setIsAdminAuthenticated(true);
    }
  };

  // --- UI/UX Interactive State ---
  const [currentView, setCurrentView] = useState<'webstore' | 'admin'>('webstore');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Catalog Filters ---
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('Semua');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');

  // 1. Initial Load: Real-time Sync with Firestore database
  useEffect(() => {
    // A. Real-time Products Sync
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Product;
        // Self-heal: Upgrade old Unsplash placeholder URLs or outdated products to the beautiful custom generated ones
        const isUnsplashUrl = typeof data.image === 'string' && data.image.startsWith('https://images.unsplash.com');
        const isInvalidImage = !data.image || typeof data.image !== 'string' || (!data.image.startsWith('http') && !data.image.startsWith('/src/'));
        const originalProd = INITIAL_PRODUCTS.find(p => p.id === data.id);
        const isOutdatedProduct = originalProd && (data.image !== originalProd.image || data.name !== originalProd.name);
        
        if (isUnsplashUrl || isInvalidImage || isOutdatedProduct) {
          if (originalProd) {
            data.name = originalProd.name;
            data.price = originalProd.price;
            data.description = originalProd.description;
            data.image = originalProd.image;
            data.category = originalProd.category;
            data.sizes = originalProd.sizes;
            data.colors = originalProd.colors;
            // Save the healed document back to Firestore
            setDoc(doc(db, 'products', data.id), data).catch((err) => {
              console.error("Error healing product in Firestore:", err);
            });
          }
        }
        items.push(data);
      });

      if (items.length === 0) {
        // Seed the products if totally empty
        INITIAL_PRODUCTS.forEach(async (prod) => {
          await setDoc(doc(db, 'products', prod.id), prod);
        });
      } else {
        // Sort products by id to keep a stable visual order
        items.sort((a, b) => a.id.localeCompare(b.id));
        setProducts(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    // B. Real-time Orders Sync
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Order);
      });

      if (items.length === 0) {
        // Seed mock orders
        const mockOrders = getMockOrders();
        mockOrders.forEach(async (order) => {
          await setDoc(doc(db, 'orders', order.id), order);
        });
      } else {
        // Sort orders by date descending so newest are on top
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    // C. Real-time Store Config Sync
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'settings'), (docSnap) => {
      if (docSnap.exists()) {
        setStoreConfig(docSnap.data() as StoreConfig);
      } else {
        // Seed default config
        setDoc(doc(db, 'config', 'settings'), DEFAULT_STORE_CONFIG);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'config/settings');
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
      unsubscribeConfig();
    };
  }, []);

  // --- Callback handlers ---

  const handleUpdateStoreConfig = async (config: StoreConfig) => {
    try {
      await setDoc(doc(db, 'config', 'settings'), config);
    } catch (e) {
      console.error("Error updating config:", e);
    }
  };

  const handleResetProducts = async () => {
    try {
      // Delete existing products
      const querySnapshot = await getDocs(collection(db, 'products'));
      for (const docSnap of querySnapshot.docs) {
        await deleteDoc(doc(db, 'products', docSnap.id));
      }
      // Re-seed products
      for (const prod of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', prod.id), prod);
      }
    } catch (e) {
      console.error("Error resetting products:", e);
    }
  };

  // Products CRUD
  const handleAddProduct = async (newProd: Product) => {
    try {
      await setDoc(doc(db, 'products', newProd.id), newProd);
    } catch (e) {
      console.error("Error adding product:", e);
    }
  };

  const handleUpdateProduct = async (updatedProd: Product) => {
    try {
      await setDoc(doc(db, 'products', updatedProd.id), updatedProd);
    } catch (e) {
      console.error("Error updating product:", e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {
      console.error("Error deleting product:", e);
    }
  };

  // Orders CRUD
  const handleAddOrder = async (newOrder: Order) => {
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (e) {
      console.error("Error adding order:", e);
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    try {
      await setDoc(doc(db, 'orders', updatedOrder.id), updatedOrder);
    } catch (e) {
      console.error("Error updating order:", e);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch (e) {
      console.error("Error deleting order:", e);
    }
  };

  // --- Client Cart Handling ---

  const handleAddToCart = (newItem: CartItem) => {
    // Check if item with exact same ID, size, and color exists
    const existingIndex = cart.findIndex(
      item =>
        item.product.id === newItem.product.id &&
        item.selectedSize === newItem.selectedSize &&
        item.selectedColor === newItem.selectedColor
    );

    if (existingIndex > -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + newItem.quantity;
      // Cap at product stock
      updated[existingIndex].quantity = Math.min(newQty, newItem.product.stock);
      setCart(updated);
    } else {
      setCart([...cart, newItem]);
    }
  };

  const handleAddToCartDirectly = (product: Product) => {
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : undefined;
    
    handleAddToCart({
      product,
      quantity: 1,
      selectedSize: defaultSize,
      selectedColor: defaultColor,
    });

    // Automatically slide cart open to give immediate delightful feedback
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }

    const item = cart[index];
    if (newQty <= item.product.stock) {
      const updated = [...cart];
      updated[index].quantity = newQty;
      setCart(updated);
    }
  };

  const handleRemoveCartItem = (index: number) => {
    const updated = cart.filter((_, i) => i !== index);
    setCart(updated);
  };

  // Checkout process: records PENDING online order and updates catalog stock
  const handleCheckout = async (customerName: string, customerAddress: string) => {
    if (cart.length === 0) return;

    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = (subtotal * storeConfig.taxRate) / 100;
    const total = subtotal + tax;

    // Create Order Record
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      size: item.selectedSize,
      color: item.selectedColor,
    }));

    const newOrder: Order = {
      id: generateId('WA'),
      date: new Date().toISOString(),
      items: orderItems,
      total,
      type: 'ONLINE',
      customerName,
      customerPhone: storeConfig.whatsappNumber,
      status: 'PENDING',
    };

    // 1. Log online transaction in database
    await handleAddOrder(newOrder);

    // 2. Reduce products stock
    for (const p of products) {
      const cartItemsForThisProduct = cart.filter(item => item.product.id === p.id);
      if (cartItemsForThisProduct.length > 0) {
        const totalPurchased = cartItemsForThisProduct.reduce((sum, item) => sum + item.quantity, 0);
        const updatedProduct = {
          ...p,
          stock: Math.max(0, p.stock - totalPurchased),
        };
        await handleUpdateProduct(updatedProduct);
      }
    }

    // 3. Clear shopping cart
    setCart([]);
  };

  // Filter Catalog
  const filteredCatalogProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) || 
                        p.description.toLowerCase().includes(catalogSearchQuery.toLowerCase());
    const matchCategory = selectedCatalogCategory === 'Semua' || p.category === selectedCatalogCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-rose-500 selection:text-white flex flex-col">
      {/* Top sticky responsive Navbar */}
      <Navbar
        currentView={currentView}
        onChangeView={setCurrentView}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        storeConfig={storeConfig}
        userProfile={userProfile}
        onChangeProfile={handleUpdateProfile}
        orders={orders}
      />

      {/* Main Container Views switcher */}
      <main className="flex-grow flex flex-col">
        {currentView === 'webstore' ? (
          /* VIEW 1: WEBSTORE CATALOG SCREEN */
          <div className="flex-grow flex flex-col">
            
            {/* Banner Hero Section */}
            <section className="relative overflow-hidden bg-rose-50/60 py-12 md:py-16 px-4 md:px-8 border-b border-rose-100">
              {/* Abstract decorative graphic blobs */}
              <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-rose-200/40 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 h-72 w-72 rounded-full bg-pink-100/50 blur-3xl pointer-events-none" />

              <div className="mx-auto max-w-7xl relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                
                {/* Text Promo */}
                <div className="space-y-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-600">
                    <Sparkles className="h-3.5 w-3.5" /> Koleksi Anggun Lebaran & Kasual
                  </span>
                  
                  <h2 className="text-3xl font-black md:text-4xl text-gray-900 uppercase tracking-tight leading-none">
                    Pakaian Wanita Premium Istimewa Untuk Anda
                  </h2>
                  
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-lg">
                    Tingkatkan kepercayaan diri Anda setiap hari bersama **{storeConfig.storeName}**. Nikmati kemudahan memesan pakaian eksklusif, adem, dan jahitan rapi yang langsung terhubung ke WhatsApp penjual!
                  </p>

                  <div className="flex flex-wrap gap-3.5 pt-2">
                    <button
                      onClick={() => {
                        const target = document.getElementById('catalog-explore-section');
                        target?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-rose-200 hover:bg-rose-700 hover:scale-102 transition-all cursor-pointer"
                    >
                      Mulai Belanja <ArrowRight className="h-4 w-4" />
                    </button>
                    <a
                      href={`https://wa.me/${storeConfig.whatsappNumber.replace(/\D/g, '')}?text=Halo%20Admin%20${encodeURIComponent(storeConfig.storeName)}%2C%20saya%20ingin%20bertanya%20mengenai%20koleksi%20baju%20wanita%20terbaru.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white border border-gray-200 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                    >
                      <MessageCircle className="h-4.5 w-4.5 text-emerald-500" /> Tanya Admin
                    </a>
                  </div>
                </div>

                {/* Banner collage / featured images */}
                <div className="hidden md:flex justify-end relative h-72">
                  <div className="w-52 h-64 rounded-2xl bg-gray-100 border-4 border-white shadow-xl overflow-hidden rotate-[-4deg] absolute right-32 top-0 z-10 hover:rotate-0 transition-transform duration-300">
                    <img
                      src={dressModel}
                      alt="Women dress model"
                      className="h-full w-full object-cover object-top"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=850&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="w-48 h-60 rounded-2xl bg-gray-100 border-4 border-white shadow-lg overflow-hidden rotate-[6deg] absolute right-8 top-6 hover:rotate-0 transition-transform duration-300">
                    <img
                      src={knitwearModel}
                      alt="Women knit model"
                      className="h-full w-full object-cover object-top"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=850&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* Catalog Grid Section with Filter controllers */}
            <section className="mx-auto max-w-7xl px-4 md:px-8 py-10 w-full" id="catalog-explore-section">
              
              {/* Filters / Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-8 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                    <Layers className="h-5 w-5 text-rose-600" /> Jelajahi Koleksi Kami
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Gunakan kategori atau kolom pencarian untuk menemukan baju wanita impian Anda.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 w-full md:w-auto">
                  {/* Search Input */}
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="Cari baju wanita..."
                      value={catalogSearchQuery}
                      onChange={e => setCatalogSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 pl-10 text-xs font-semibold focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
                      id="catalog-search-input"
                    />
                    <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Categories picker */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCatalogCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                          selectedCatalogCategory === cat
                            ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                        id={`catalog-cat-btn-${cat}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Products Grid */}
              <div className="mt-8">
                {filteredCatalogProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="rounded-full bg-gray-50 p-6 text-gray-300">
                      <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="mt-4 text-sm font-bold text-gray-700">Produk Tidak Ditemukan</h4>
                    <p className="mt-1 text-xs text-gray-400 max-w-xs">
                      Maaf, baju wanita dengan kata kunci tersebut sedang tidak tersedia. Coba ganti kategori atau kata kunci Anda.
                    </p>
                    <button
                      onClick={() => { setCatalogSearchQuery(''); setSelectedCatalogCategory('Semua'); }}
                      className="mt-4 flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2 text-xs font-bold"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Atur Ulang Filter
                    </button>
                  </div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredCatalogProducts.map(product => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onViewDetails={(p) => setSelectedProduct(p)}
                          onAddToCartDirectly={handleAddToCartDirectly}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

            </section>

          </div>
        ) : !isAdminAuthenticated ? (
          /* VIEW 2: MERCHANT ADMIN LOGIN FORM */
          <AdminLogin
            storeConfig={storeConfig}
            onLoginSuccess={() => setIsAdminAuthenticated(true)}
          />
        ) : (
          /* VIEW 3: MERCHANT ADMIN & POINT OF SALE DASHBOARD */
          <AdminPanel
            products={products}
            orders={orders}
            storeConfig={storeConfig}
            onUpdateStoreConfig={handleUpdateStoreConfig}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddOrder={handleAddOrder}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
            onResetProducts={handleResetProducts}
            onLogout={() => {
              // Reset profile to CUSTOMER on logout
              handleUpdateProfile({
                ...userProfile,
                role: 'CUSTOMER'
              });
              setCurrentView('webstore');
            }}
            userProfile={userProfile}
          />
        )}
      </main>

      {/* FOOTER BRANDS INFO */}
      {currentView === 'webstore' && (
        <footer className="bg-slate-900 text-white border-t border-slate-800 py-12 px-4 md:px-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm uppercase tracking-widest">{storeConfig.storeName}</h4>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                Aplikasi digital terintegrasi UMKM baju wanita, mempertemukan kenyamanan belanja modern secara online dengan ketangguhan sistem pencatatan POS Kasir.
              </p>
            </div>
            <div className="space-y-3">
              <h5 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">Lokasi Outlet</h5>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs uppercase font-mono">
                {storeConfig.address}
              </p>
            </div>
            <div className="space-y-3">
              <h5 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">Metode Pemesanan</h5>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pilih baju favorit Anda, masukkan ukuran & warna, kumpulkan ke keranjang belanja, lalu klik checkout. Sistem kami akan menyusun rincian pembelian rapi dan membuka chat WhatsApp admin untuk pembayaran & pengiriman instan.
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-7xl border-t border-slate-800 mt-10 pt-6 text-center text-[10px] text-gray-500 font-mono flex flex-col sm:flex-row justify-between items-center gap-3">
            <span>© 2026 {storeConfig.storeName}. Hak Cipta Dilindungi.</span>
            <span>Aplikasi UMKM Premium • Didukung oleh AI Studio</span>
          </div>
        </footer>
      )}

      {/* OVERLAY COMPONENT 1: PRODUCT DETAILED MODAL POPUP */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      {/* OVERLAY COMPONENT 2: SHOPPING CART SLIDE-OUT DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
        storeConfig={storeConfig}
        userProfile={userProfile}
      />
    </div>
  );
}
