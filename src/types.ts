export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
  }[];
  total: number;
  type: 'ONLINE' | 'POS';
  customerName: string;
  customerPhone?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  cashReceived?: number;
  changeAmount?: number;
}

export interface StoreConfig {
  storeName: string;
  whatsappNumber: string; // formats like 628123456789
  address: string;
  currencySymbol: string;
  taxRate: number; // in percentage, e.g., 10 for 10%
}
