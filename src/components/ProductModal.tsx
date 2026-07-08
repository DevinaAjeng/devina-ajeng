import { useState, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { formatRupiah } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Check, Plus, Minus } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
      setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : '');
      setQuantity(1);
      setIsAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddSubmit = () => {
    onAddToCart({
      product,
      quantity,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
    });
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 1200);
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative z-10 flex h-full max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:flex-row"
          id="product-detail-modal"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white hover:text-rose-600 md:bg-gray-100/80 md:backdrop-blur-xs"
            id="close-modal-btn"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left Column: Image Area */}
          <div className="relative h-64 w-full bg-gray-50 md:h-full md:w-1/2">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover object-top"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80';
              }}
            />
            <span className="absolute top-4 left-4 rounded-full bg-rose-600 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
              {product.category}
            </span>
          </div>

          {/* Right Column: Product Info Form */}
          <div className="flex flex-1 flex-col overflow-y-auto p-6 md:p-8">
            <div className="flex-1">
              {/* Product Info */}
              <h2 className="text-xl font-extrabold text-gray-900 md:text-2xl">
                {product.name}
              </h2>
              
              <div className="mt-2 flex items-center gap-4">
                <span className="text-2xl font-black text-rose-600">
                  {formatRupiah(product.price)}
                </span>
                <span className="text-xs text-gray-400 font-medium">|</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.stock <= 5 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'}`}>
                  Stok: {product.stock} pcs
                </span>
              </div>

              {/* Divider */}
              <div className="my-5 h-[1px] bg-gray-100" />

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Deskripsi</h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>

              {/* Form Options */}
              {!isOutOfStock && (
                <div className="mt-6 space-y-5">
                  {/* Sizes Select */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Pilih Ukuran</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-12 px-3 py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                              selectedSize === size
                                ? 'border-rose-600 bg-rose-50 text-rose-600'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            id={`size-btn-${size}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Colors Select */}
                  {product.colors && product.colors.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Pilih Warna</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.colors.map(color => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`px-4 py-2 text-xs font-bold rounded-xl border-2 transition-all ${
                              selectedColor === color
                                ? 'border-rose-600 bg-rose-50 text-rose-600'
                                : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            id={`color-btn-${color}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity adjustment */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Jumlah</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
                        <button
                          onClick={handleDecrement}
                          disabled={quantity <= 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 shadow-xs hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                          id="qty-decrement-btn"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-gray-900" id="qty-display">
                          {quantity}
                        </span>
                        <button
                          onClick={handleIncrement}
                          disabled={quantity >= product.stock}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-600 shadow-xs hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-white"
                          id="qty-increment-btn"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-400">
                        Sisa stok saat ini {product.stock} pcs
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Actions in Modal */}
            <div className="mt-8">
              {isOutOfStock ? (
                <button
                  disabled
                  className="w-full rounded-2xl bg-gray-100 py-4 text-center font-bold text-gray-400 cursor-not-allowed"
                >
                  Maaf, Stok Produk Habis
                </button>
              ) : (
                <button
                  onClick={handleAddSubmit}
                  disabled={isAdded}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white transition-all shadow-lg ${
                    isAdded
                      ? 'bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600'
                      : 'bg-rose-600 shadow-rose-200 hover:bg-rose-700 hover:scale-[1.02]'
                  }`}
                  id="add-to-cart-submit-btn"
                >
                  {isAdded ? (
                    <>
                      <Check className="h-5 w-5" /> Ditambahkan ke Keranjang!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5" /> Tambah Ke Keranjang • {formatRupiah(product.price * quantity)}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
