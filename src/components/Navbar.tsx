import { ShoppingCart, ShieldAlert, Store } from 'lucide-react';
import { StoreConfig } from '../types';

interface NavbarProps {
  currentView: 'webstore' | 'admin';
  onChangeView: (view: 'webstore' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  storeConfig: StoreConfig;
}

export default function Navbar({ currentView, onChangeView, cartCount, onOpenCart, storeConfig }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 shadow-2xs">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between">
        
        {/* Branding Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 font-black text-white text-lg shadow-sm">
            D
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-black uppercase tracking-widest text-gray-900 leading-tight">
              {storeConfig.storeName}
            </h1>
            <span className="text-[10px] font-medium tracking-wider text-rose-500 uppercase">
              Baju Wanita Premium
            </span>
          </div>
        </div>

        {/* Navigation Mode Tabs & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Main View Mode Selector */}
          <div className="flex items-center rounded-xl bg-gray-100 p-1" id="view-selector">
            <button
              onClick={() => onChangeView('webstore')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                currentView === 'webstore'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              id="switch-webstore-btn"
            >
              <Store className="h-3.5 w-3.5" /> Katalog
            </button>
            <button
              onClick={() => onChangeView('admin')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                currentView === 'admin'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
              id="switch-admin-btn"
            >
              <ShieldAlert className="h-3.5 w-3.5" /> Admin & POS
            </button>
          </div>

          {/* Cart Badge Button (Only show in webstore) */}
          {currentView === 'webstore' && (
            <button
              onClick={onOpenCart}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-transform hover:scale-105"
              id="navbar-cart-trigger-btn"
              title="Keranjang Belanja"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
