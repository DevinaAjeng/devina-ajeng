import React from 'react';
import { Product } from '../types';
import { formatRupiah } from '../utils';
import { motion } from 'motion/react';
import { Eye, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCartDirectly: (product: Product) => void;
}

export default function ProductCard({ product, onViewDetails, onAddToCartDirectly }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs transition-all hover:shadow-md hover:border-gray-200"
      id={`product-card-${product.id}`}
    >
      {/* Category Tag */}
      <span className="absolute top-3 left-3 z-10 rounded-full bg-white/90 backdrop-blur-xs px-3 py-1 text-[11px] font-medium tracking-wide text-rose-600 shadow-xs uppercase">
        {product.category}
      </span>

      {/* Product Image Container */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80';
          }}
        />
        
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <span className="rounded-md bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-900">
              Habis
            </span>
          </div>
        )}

        {/* Hover overlay actions */}
        {!isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={() => onViewDetails(product)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-900 transition-transform duration-200 hover:scale-110 shadow-lg"
              title="Lihat Detail"
              id={`view-detail-btn-${product.id}`}
            >
              <Eye className="h-5 w-5" />
            </button>
            <button
              onClick={() => onAddToCartDirectly(product)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-600 text-white transition-transform duration-200 hover:scale-110 shadow-lg"
              title="Tambah Ke Keranjang"
              id={`add-to-cart-btn-${product.id}`}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Description & Details */}
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <h3 className="line-clamp-1 text-sm font-semibold text-gray-900 transition-colors group-hover:text-rose-600">
          {product.name}
        </h3>
        
        <p className="mt-1 line-clamp-2 text-xs text-gray-500 flex-1 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-400">Harga</span>
            <span className="text-base font-bold text-gray-900">
              {formatRupiah(product.price)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-gray-400">Stok</span>
            <p className={`text-xs font-semibold ${product.stock <= 5 ? 'text-amber-600' : 'text-gray-600'}`}>
              {product.stock} pcs
            </p>
          </div>
        </div>

        {/* Mobile direct CTA button */}
        <div className="mt-4 block md:hidden">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full rounded-xl bg-gray-100 py-2.5 text-center text-xs font-medium text-gray-400 cursor-not-allowed"
            >
              Stok Habis
            </button>
          ) : (
            <button
              onClick={() => onViewDetails(product)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 text-center text-xs font-semibold transition-colors"
            >
              <Eye className="h-4 w-4" /> Detail & Beli
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
