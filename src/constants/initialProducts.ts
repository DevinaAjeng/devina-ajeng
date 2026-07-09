import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aurelia Floral Midi Dress',
    price: 189000,
    description: 'Dress midi anggun dengan motif floral pastel yang manis. Terbuat dari bahan katun rayon premium yang super adem, jatuh, dan nyaman dipakai seharian. Sangat cocok untuk acara kasual maupun semi-formal.',
    image: '/src/assets/images/floral_midi_dress_1783598184334.jpg',
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
    image: '/src/assets/images/knit_cardigan_1783598203722.jpg',
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
    image: '/src/assets/images/linen_blouse_new_1783598673563.jpg',
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
    image: '/src/assets/images/pashmina_silk_1783598229763.jpg',
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
    image: '/src/assets/images/plaid_blazer_1783598241804.jpg',
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
    image: '/src/assets/images/pleated_culottes_1783598254754.jpg',
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
    image: '/src/assets/images/satin_slip_dress_1783598269823.jpg',
    category: 'Dress',
    stock: 15,
    sizes: ['S', 'M', 'L'],
    colors: ['Emerald Green', 'Champagne', 'Maroon']
  },
  {
    id: 'prod-8',
    name: 'Short Sleeve Knotted Floral Blouse',
    price: 125000,
    description: 'Blouse lengan pendek bermotif floral yang manis dengan detail simpul/ikat (knotted) cantik di bagian depan bawah. Berbahan katun rayon premium yang halus, adem, dan menyerap keringat. Sempurna untuk tampilan kasual feminin sehari-hari.',
    image: '/src/assets/images/knotted_floral_blouse_1783598945963.jpg',
    category: 'Blouse',
    stock: 35,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White Floral', 'Pink Floral', 'Blue Floral']
  }
];

export const CATEGORIES = ['Semua', 'Dress', 'Blouse', 'Outerwear', 'Hijab', 'Celana'];
