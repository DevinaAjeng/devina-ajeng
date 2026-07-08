import React, { useState } from 'react';
import { CartItem, StoreConfig } from '../types';
import { formatRupiah, formatWhatsappMessage, getWhatsappUrl } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Plus, Minus, Send, ShoppingBag } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (index: number, quantity: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: (customerName: string, customerAddress: string) => void;
  storeConfig: StoreConfig;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  storeConfig,
}: CartDrawerProps) {
  const [customerName, setCustomerName] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const tax = (subtotal * storeConfig.taxRate) / 100;
  const total = subtotal + tax;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Nama lengkap harus diisi');
      return;
    }
    if (!customerAddress.trim()) {
      setFormError('Alamat pengiriman harus diisi');
      return;
    }

    setFormError('');
    
    // Format WA message
    const waText = formatWhatsappMessage(cart, customerName, customerAddress, storeConfig);
    const waUrl = getWhatsappUrl(storeConfig.whatsappNumber, waText);

    // Call checkout trigger (saves order locally as pending)
    onCheckout(customerName, customerAddress);

    // Open Whatsapp
    window.open(waUrl, '_blank');
    
    // Reset form & close
    setCustomerName('');
    setCustomerAddress('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Drawer container */}
        <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-screen max-w-md flex flex-col bg-white shadow-2xl h-full"
            id="cart-drawer-panel"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">Keranjang Belanja</h2>
                  <p className="text-xs text-gray-400">{cart.length} item dipilih</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900"
                id="close-cart-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Content (Scrollable items + Form) */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="mb-4 rounded-full bg-gray-50 p-6 text-gray-300">
                    <ShoppingBag className="h-12 w-12" />
                  </div>
                  <h3 className="text-base font-bold text-gray-700">Keranjang Masih Kosong</h3>
                  <p className="mt-1 text-xs text-gray-400 max-w-xs">
                    Silakan telusuri katalog baju wanita kami yang cantik dan tambahkan ke keranjang belanja Anda.
                  </p>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Daftar Pilihan</h3>
                    <div className="divide-y divide-gray-100 border-b border-gray-100">
                      {cart.map((item, index) => (
                        <div key={`${item.product.id}-${index}`} className="flex py-4 gap-4 group" id={`cart-item-${index}`}>
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="h-20 w-16 object-cover object-top rounded-lg bg-gray-50 flex-none"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
                                {item.product.name}
                              </h4>
                              {/* Selection details */}
                              <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-500">
                                {item.selectedSize && (
                                  <span className="rounded-md bg-gray-50 border border-gray-100 px-1.5 py-0.5">
                                    Size: <strong>{item.selectedSize}</strong>
                                  </span>
                                )}
                                {item.selectedColor && (
                                  <span className="rounded-md bg-gray-50 border border-gray-100 px-1.5 py-0.5">
                                    Warna: <strong>{item.selectedColor}</strong>
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between">
                              {/* Quantity control */}
                              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
                                <button
                                  onClick={() => onUpdateQuantity(index, item.quantity - 1)}
                                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-500 hover:text-gray-900 disabled:opacity-40"
                                  id={`cart-qty-dec-${index}`}
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-gray-800">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock}
                                  className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-gray-500 hover:text-gray-900 disabled:opacity-40"
                                  id={`cart-qty-inc-${index}`}
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              <span className="text-sm font-extrabold text-gray-900">
                                {formatRupiah(item.product.price * item.quantity)}
                              </span>
                            </div>
                          </div>

                          {/* Delete Item Button */}
                          <button
                            onClick={() => onRemoveItem(index)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 self-start mt-1 transition-colors md:opacity-0 md:group-hover:opacity-100"
                            title="Hapus"
                            id={`cart-remove-item-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer Information Form */}
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Informasi Pemesan</h3>
                    
                    {formError && (
                      <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-xs font-medium text-red-600">
                        {formError}
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label htmlFor="customer-name" className="block text-xs font-bold text-gray-600 uppercase mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          id="customer-name"
                          type="text"
                          value={customerName}
                          onChange={e => setCustomerName(e.target.value)}
                          placeholder="Contoh: Siti Aminah"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:border-rose-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label htmlFor="customer-address" className="block text-xs font-bold text-gray-600 uppercase mb-1">
                          Alamat Pengiriman Lengkap
                        </label>
                        <textarea
                          id="customer-address"
                          rows={3}
                          value={customerAddress}
                          onChange={e => setCustomerAddress(e.target.value)}
                          placeholder="Jalan Mawar No. 12, RT 03/RW 04, Kecamatan Klojen, Kota Malang, Jawa Timur, 65111"
                          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-800 placeholder-gray-400 focus:border-rose-500 focus:outline-hidden resize-none"
                        />
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Drawer Footer (Subtotal, Tax, Total, Checkout Button) */}
            {cart.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-5 space-y-4">
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subtotal)}</span>
                  </div>
                  {storeConfig.taxRate > 0 && (
                    <div className="flex justify-between text-xs font-medium text-gray-500">
                      <span>Pajak PPN ({storeConfig.taxRate}%)</span>
                      <span>{formatRupiah(tax)}</span>
                    </div>
                  )}
                  <div className="h-[1px] bg-gray-200 my-1" />
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-extrabold text-gray-900">Total Pembayaran</span>
                    <span className="text-xl font-black text-rose-600">{formatRupiah(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutSubmit}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white py-4 font-bold transition-all shadow-lg shadow-emerald-100"
                  id="checkout-wa-submit-btn"
                >
                  <Send className="h-4 w-4" /> Hubungi WA Penjual & Checkout
                </button>
                <p className="text-[10px] text-center text-gray-400">
                  Pesanan akan otomatis terekam di sistem toko dan Anda akan diarahkan ke WhatsApp untuk penyelesaian pembayaran dan pengiriman.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
