import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aurelia Floral Midi Dress',
    price: 189000,
    description: 'Dress midi anggun dengan motif floral pastel yang manis. Terbuat dari bahan katun rayon premium yang super adem, jatuh, dan nyaman dipakai seharian. Sangat cocok untuk acara kasual maupun semi-formal.',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
    category: 'Dress',
    stock: 25,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Sage Green', 'Dusty Pink', 'Navy']
  },
  {
    id: 'prod-2',
    name: 'Knit Cardigan Premium Oversized',
    price: 135000,
    description: 'Cardigan rajut rajutan tebal namun tetap ringan dan sejuk di kulit. Desain oversized korea yang modis dengan kancing kayu estetik di bagian depan. Sempurna sebagai outerwear harian Anda.',
    image: 'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=800&auto=format&fit=crop&q=80',
    category: 'Outerwear',
    stock: 18,
    sizes: ['All Size'],
    colors: ['Cream', 'Bronze', 'Charcoal']
  },
  {
    id: 'prod-3',
    name: 'Linen Casual Blouse',
    price: 110000,
    description: 'Blouse kasual minimalis berbahan linen rami organik berkualitas tinggi. Karakter serat kain yang khas memberikan kesan premium, sejuk, dan menyerap keringat dengan baik. Dilengkapi detail kerah V yang manis.',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=80',
    category: 'Blouse',
    stock: 30,
    sizes: ['M', 'L', 'XL'],
    colors: ['Off-White', 'Terracotta', 'Olive']
  },
  {
    id: 'prod-4',
    name: 'Pashmina Silk Premium',
    price: 65000,
    description: 'Pashmina satin silk premium dengan kilau mewah yang elegan dan bertekstur lembut. Mudah dibentuk, tegak di dahi, dan tidak licin. Sangat cocok dipadukan dengan gaun pesta maupun pakaian formal harian.',
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
    category: 'Hijab',
    stock: 50,
    sizes: ['Standar'],
    colors: ['Rose Gold', 'Taupe', 'Silver', 'Black']
  },
  {
    id: 'prod-5',
    name: 'Korean Aesthetic Plaid Blazer',
    price: 225000,
    description: 'Blazer formal bergaya kasual ala Korea dengan motif kotak-kotak (plaid) klasik. Memiliki furing penuh di bagian dalam, padding bahu tipis untuk siluet yang tegas, serta saku fungsional kiri dan kanan.',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
    category: 'Outerwear',
    stock: 12,
    sizes: ['S', 'M', 'L'],
    colors: ['Beige Plaid', 'Grey Plaid']
  },
  {
    id: 'prod-6',
    name: 'Pleated Culottes Highwaist',
    price: 99000,
    description: 'Celana kulot plisket dengan pinggang tinggi (highwaist) yang memberikan efek kaki terlihat lebih jenjang. Bahan babydoll premium berlipat rapi yang awet meski dicuci berulang kali. Pinggang full karet yang elastis.',
    image: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&auto=format&fit=crop&q=80',
    category: 'Celana',
    stock: 40,
    sizes: ['All Size fit to XL'],
    colors: ['Black', 'Mocha', 'Soft Grey']
  },
  {
    id: 'prod-7',
    name: 'Satin Silk Slip Dress Elegance',
    price: 249000,
    description: 'Slip dress berbahan satin silk super halus dan berkilau mewah. Potongan draping leher (cowl neck) yang sensual namun tetap sopan, dilengkapi dengan tali bahu tipis berperekat yang dapat disesuaikan panjangnya.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
    category: 'Dress',
    stock: 15,
    sizes: ['S', 'M', 'L'],
    colors: ['Emerald Green', 'Champagne', 'Maroon']
  },
  {
    id: 'prod-8',
    name: 'Oversized Cotton Combed Tee',
    price: 79000,
    description: 'Kaos oversized polos kasual berbahan Cotton Combed 24s tebal, lembut, dan tidak menerawang. Sangat nyaman untuk bersantai di rumah atau hangout santai dengan dipadupadankan bersama celana denim atau kulot.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    category: 'Blouse',
    stock: 35,
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Lilac', 'Lilac Pink', 'White', 'Black']
  }
];

export const CATEGORIES = ['Semua', 'Dress', 'Blouse', 'Outerwear', 'Hijab', 'Celana'];
