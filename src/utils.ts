import { CartItem, StoreConfig } from './types';

export const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const generateId = (prefix: string = ''): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatWhatsappMessage = (
  cart: CartItem[],
  customerName: string,
  customerAddress: string,
  storeConfig: StoreConfig
): string => {
  const line = '------------------------------------------';
  let message = `*PESANAN BARU - ${storeConfig.storeName}*\n`;
  message += `${line}\n`;
  message += `*Nama Pelanggan:* ${customerName}\n`;
  message += `*Alamat Pengiriman:* ${customerAddress}\n`;
  message += `${line}\n\n`;
  
  let total = 0;
  cart.forEach((item, index) => {
    const itemSubtotal = item.product.price * item.quantity;
    total += itemSubtotal;
    const sizeStr = item.selectedSize ? ` (Size: ${item.selectedSize})` : '';
    const colorStr = item.selectedColor ? ` (Warna: ${item.selectedColor})` : '';
    
    message += `${index + 1}. *${item.product.name}*${sizeStr}${colorStr}\n`;
    message += `   ${item.quantity} x ${formatRupiah(item.product.price)} = *${formatRupiah(itemSubtotal)}*\n\n`;
  });

  // Calculate tax if configured
  let finalTotal = total;
  if (storeConfig.taxRate > 0) {
    const tax = (total * storeConfig.taxRate) / 100;
    finalTotal += tax;
    message += `${line}\n`;
    message += `Subtotal: ${formatRupiah(total)}\n`;
    message += `Pajak (${storeConfig.taxRate}%): ${formatRupiah(tax)}\n`;
  }
  
  message += `${line}\n`;
  message += `*TOTAL PEMBAYARAN:* *${formatRupiah(finalTotal)}*\n`;
  message += `${line}\n\n`;
  message += `Mohon konfirmasi ketersediaan stok dan detail pembayaran. Terima kasih! 🙏`;

  return encodeURIComponent(message);
};

export const getWhatsappUrl = (phone: string, text: string): string => {
  // Remove non-numeric characters from phone number
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${text}`;
};
