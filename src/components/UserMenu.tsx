import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, Order } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Check, 
  ChevronDown, 
  ShieldCheck, 
  ShoppingBag, 
  UserCheck, 
  Phone, 
  X, 
  Settings, 
  History, 
  Store,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { formatRupiah } from '../utils';

interface UserMenuProps {
  userProfile: UserProfile;
  onChangeProfile: (profile: UserProfile) => void;
  orders: Order[];
  onSwitchView: (view: 'webstore' | 'admin') => void;
  currentView: 'webstore' | 'admin';
}

const ROLE_DETAILS = [
  {
    role: 'CUSTOMER' as UserRole,
    label: 'Pelanggan',
    desc: 'Bisa berbelanja baju premium, menggunakan keranjang belanja, & melihat riwayat pembelian pribadi.',
    colorClass: 'bg-rose-50 text-rose-600 border-rose-100',
    icon: ShoppingBag,
    badgeColor: 'bg-rose-100 text-rose-700'
  },
  {
    role: 'CASHIER' as UserRole,
    label: 'Kasir',
    desc: 'Akses cepat ke Point of Sale (POS) Kasir & Cetak Struk. Terbatas untuk fitur kelola produk & pengaturan.',
    colorClass: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: DollarSign,
    badgeColor: 'bg-amber-100 text-amber-700'
  },
  {
    role: 'ADMIN' as UserRole,
    label: 'Admin Toko',
    desc: 'Akses penuh ke dashboard ringkasan bisnis, kelola stok produk, POS, & transaksi. Terbatas dari pengaturan sensitif.',
    colorClass: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    icon: Briefcase,
    badgeColor: 'bg-indigo-100 text-indigo-700'
  },
  {
    role: 'OWNER' as UserRole,
    label: 'Pemilik Toko',
    desc: 'Akses absolut tanpa batas untuk semua sistem laporan keuangan, manajemen produk, kasir, & ganti konfigurasi toko.',
    colorClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: ShieldCheck,
    badgeColor: 'bg-emerald-100 text-emerald-700'
  }
];

// Presets of beautiful high-fashion avatar illustrations for roles
const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', // default / Customer
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', // Cashier
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', // Admin
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', // Owner
];

export default function UserMenu({ 
  userProfile, 
  onChangeProfile, 
  orders, 
  onSwitchView,
  currentView
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'switch' | 'edit' | 'orders'>('switch');
  
  // Local state for editing profile
  const [editName, setEditName] = useState(userProfile.name);
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editAvatar, setEditAvatar] = useState(userProfile.avatarUrl || AVATAR_PRESETS[0]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state with props
  useEffect(() => {
    setEditName(userProfile.name);
    setEditPhone(userProfile.phone);
    if (userProfile.avatarUrl) {
      setEditAvatar(userProfile.avatarUrl);
    }
  }, [userProfile]);

  // Filter orders that belong to this customer
  const myOrders = orders.filter(order => {
    if (userProfile.role !== 'CUSTOMER') return false;
    const searchName = userProfile.name.toLowerCase().trim();
    const searchPhone = userProfile.phone.trim();
    
    const matchesName = order.customerName.toLowerCase().includes(searchName) && searchName !== 'tamu cantik';
    const matchesPhone = searchPhone ? order.customerPhone?.includes(searchPhone) : false;
    
    return matchesName || matchesPhone;
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeProfile({
      ...userProfile,
      name: editName.trim() || 'Pelanggan Setia',
      phone: editPhone.trim(),
      avatarUrl: editAvatar
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRoleChange = (role: UserRole) => {
    // Automatically swap avatar to correspond to role preview for fun and clarity
    let autoAvatar = userProfile.avatarUrl || AVATAR_PRESETS[0];
    if (role === 'CUSTOMER') autoAvatar = AVATAR_PRESETS[0];
    else if (role === 'CASHIER') autoAvatar = AVATAR_PRESETS[1];
    else if (role === 'ADMIN') autoAvatar = AVATAR_PRESETS[2];
    else if (role === 'OWNER') autoAvatar = AVATAR_PRESETS[3];

    onChangeProfile({
      ...userProfile,
      role,
      avatarUrl: autoAvatar
    });

    // Auto navigate views based on roles
    if (role === 'CUSTOMER') {
      onSwitchView('webstore');
    } else {
      onSwitchView('admin');
    }
  };

  const getRoleLabel = (role: UserRole) => {
    return ROLE_DETAILS.find(r => r.role === role)?.label || role;
  };

  const getRoleBadgeColor = (role: UserRole) => {
    return ROLE_DETAILS.find(r => r.role === role)?.badgeColor || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="relative" id="user-menu-root">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-100 p-1.5 pr-3 hover:bg-gray-100/70 transition-all cursor-pointer text-left focus:outline-hidden"
        id="user-profile-trigger-btn"
        title="Menu Pengguna & Peran"
      >
        <div className="relative h-8 w-8 rounded-lg overflow-hidden border border-rose-100">
          <img 
            src={userProfile.avatarUrl || AVATAR_PRESETS[0]} 
            alt={userProfile.name} 
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-[11px] font-extrabold text-gray-800 truncate max-w-[100px] leading-tight">
            {userProfile.name}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 leading-none w-max ${getRoleBadgeColor(userProfile.role)}`}>
            {getRoleLabel(userProfile.role)}
          </span>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-1 flex-shrink-0" />
      </button>

      {/* Dropdown Panel Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Click-outside backdrop */}
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white border border-rose-100 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[550px]"
              id="user-profile-dropdown"
            >
              {/* Profile Card Header */}
              <div className="p-4 bg-gradient-to-br from-rose-50/70 to-pink-50/40 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl overflow-hidden border border-rose-200 shadow-xs">
                    <img 
                      src={userProfile.avatarUrl || AVATAR_PRESETS[0]} 
                      alt={userProfile.name} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-800 leading-tight">
                      {userProfile.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {userProfile.phone || 'No. HP belum diisi'}
                    </p>
                    <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-1 leading-none ${getRoleBadgeColor(userProfile.role)}`}>
                      Akses: {getRoleLabel(userProfile.role)}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-rose-100/50 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-gray-100 text-xs bg-gray-50/50" id="user-menu-tabs">
                <button
                  onClick={() => setActiveSubTab('switch')}
                  className={`flex-1 py-3 text-center font-bold tracking-wider uppercase border-b-2 transition-all ${
                    activeSubTab === 'switch'
                      ? 'border-rose-500 text-rose-600 bg-white font-extrabold'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Ganti Peran
                </button>
                <button
                  onClick={() => setActiveSubTab('edit')}
                  className={`flex-1 py-3 text-center font-bold tracking-wider uppercase border-b-2 transition-all ${
                    activeSubTab === 'edit'
                      ? 'border-rose-500 text-rose-600 bg-white font-extrabold'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Edit Profil
                </button>
                {userProfile.role === 'CUSTOMER' && (
                  <button
                    onClick={() => setActiveSubTab('orders')}
                    className={`flex-1 py-3 text-center font-bold tracking-wider uppercase border-b-2 transition-all relative ${
                      activeSubTab === 'orders'
                        ? 'border-rose-500 text-rose-600 bg-white font-extrabold'
                        : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Pesanan Saya
                    {myOrders.length > 0 && (
                      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </button>
                )}
              </div>

              {/* Subtab Content Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* 1. ROLE SWITCHER TAB */}
                {activeSubTab === 'switch' && (
                  <div className="space-y-2.5">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pilih Peran Untuk Menguji Toko:</p>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {ROLE_DETAILS.map((r) => {
                        const IconComponent = r.icon;
                        const isCurrent = userProfile.role === r.role;
                        
                        return (
                          <button
                            key={r.role}
                            onClick={() => handleRoleChange(r.role)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                              isCurrent
                                ? 'bg-rose-50/50 border-rose-200 ring-1 ring-rose-500/20 shadow-xs'
                                : 'bg-white border-gray-100 hover:bg-gray-50/60 hover:border-gray-200'
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isCurrent ? 'bg-rose-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                              <IconComponent className="h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-800">{r.label}</span>
                                {isCurrent && (
                                  <span className="flex items-center gap-1 text-[9px] font-black text-rose-600 uppercase bg-rose-100 px-1.5 py-0.5 rounded-md">
                                    <Check className="h-2.5 w-2.5" /> Aktif
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 leading-normal">{r.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. EDIT PROFILE TAB */}
                {activeSubTab === 'edit' && (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {saveSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                        <Check className="h-4 w-4" /> Profil berhasil diperbarui!
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Masukkan nama Anda..."
                        required
                        className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:bg-white focus:border-rose-300 focus:outline-hidden text-gray-800"
                        id="profile-edit-name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">No. HP / WhatsApp</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-gray-400">
                          <Phone className="h-3.5 w-3.5" />
                        </span>
                        <input
                          type="text"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="08123456789"
                          className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-xs font-semibold focus:bg-white focus:border-rose-300 focus:outline-hidden text-gray-800"
                          id="profile-edit-phone"
                        />
                      </div>
                      <p className="text-[9px] text-gray-400">Digunakan untuk melacak pesanan dan pre-fill checkout WA.</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Pilih Avatar Ilustrasi</label>
                      <div className="flex gap-2.5 pt-1">
                        {AVATAR_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditAvatar(preset)}
                            className={`h-11 w-11 rounded-lg overflow-hidden border-2 transition-all relative ${
                              editAvatar === preset ? 'border-rose-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt={`Avatar ${idx}`} className="h-full w-full object-cover" />
                            {editAvatar === preset && (
                              <span className="absolute inset-0 bg-rose-500/10 flex items-center justify-center">
                                <span className="h-4 w-4 bg-rose-600 rounded-full flex items-center justify-center text-white">
                                  <Check className="h-2.5 w-2.5" />
                                </span>
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md shadow-rose-100 transition-all cursor-pointer"
                      id="save-profile-btn"
                    >
                      Simpan Perubahan
                    </button>
                  </form>
                )}

                {/* 3. MY ORDERS TAB (CUSTOMER ONLY) */}
                {activeSubTab === 'orders' && userProfile.role === 'CUSTOMER' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Riwayat Belanja Anda:</p>
                      <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        {myOrders.length} Transaksi
                      </span>
                    </div>

                    {myOrders.length === 0 ? (
                      <div className="text-center py-8 px-4 bg-gray-50 rounded-xl space-y-2">
                        <History className="h-8 w-8 text-gray-300 mx-auto" />
                        <h4 className="text-xs font-bold text-gray-700">Belum Ada Transaksi</h4>
                        <p className="text-[10px] text-gray-400 leading-normal">
                          Belum ditemukan pesanan dengan nama &ldquo;{userProfile.name}&rdquo;. Pesan sekarang untuk mencatat transaksi Anda!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {myOrders.map((order) => (
                          <div 
                            key={order.id} 
                            className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2 text-left"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                              <span>ID: {order.id.slice(0, 10)}...</span>
                              <span>{new Date(order.date).toLocaleDateString('id-ID')}</span>
                            </div>

                            <div className="space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs text-gray-700 font-medium">
                                  <span className="line-clamp-1 flex-1">
                                    {item.productName} ({item.size})
                                  </span>
                                  <span className="text-gray-400 ml-2">
                                    x{item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-1 border-t border-gray-200/50">
                              <span className="text-[10px] font-black uppercase text-gray-400">Total</span>
                              <span className="text-xs font-extrabold text-rose-600">{formatRupiah(order.total)}</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] font-bold uppercase text-gray-400">Status</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                order.status === 'COMPLETED' 
                                  ? 'bg-emerald-50 text-emerald-600' 
                                  : order.status === 'CANCELLED'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-amber-50 text-amber-600'
                              }`}>
                                {order.status === 'COMPLETED' ? 'Selesai' : order.status === 'CANCELLED' ? 'Dibatalkan' : 'Menunggu'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Quick switch to webstore footer for POS/Merchant Roles */}
              {userProfile.role !== 'CUSTOMER' && (
                <div className="p-3 bg-slate-900 text-white border-t border-slate-800 text-center flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-left">
                    <Store className="h-4 w-4 text-rose-500 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block leading-none">Tampilan Aktif:</span>
                      <span className="text-[11px] font-bold text-white block mt-0.5">{currentView === 'webstore' ? 'Katalog Toko' : 'Dashboard Admin'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSwitchView(currentView === 'webstore' ? 'admin' : 'webstore');
                      setIsOpen(false);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all"
                    id="user-menu-view-toggle"
                  >
                    Buka {currentView === 'webstore' ? 'Admin' : 'Katalog'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
