import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, ShieldAlert, Sparkles } from 'lucide-react';
import { StoreConfig } from '../types';

interface AdminLoginProps {
  storeConfig: StoreConfig;
  onLoginSuccess: () => void;
}

export default function AdminLogin({ storeConfig, onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Simulate small smooth delay for a native application feel
    setTimeout(() => {
      const targetPassword = storeConfig.adminPassword || 'admin123';
      const lowercaseUsername = username.trim().toLowerCase();

      if (lowercaseUsername === 'admin' && password === targetPassword) {
        onLoginSuccess();
      } else {
        setError('Username atau Password salah. Silakan coba lagi!');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="flex-grow flex items-center justify-center px-4 py-16 bg-rose-50/20 relative overflow-hidden">
      {/* Decorative background blur blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-rose-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-pink-100/50 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-rose-100 shadow-xl rounded-3xl overflow-hidden relative z-10 p-8"
        id="admin-login-card"
      >
        {/* Decorative Badge */}
        <div className="flex justify-center mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 font-black text-white text-2xl shadow-md shadow-rose-100">
            <Lock className="h-6 w-6" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Login Administrator</h2>
          <p className="text-xs text-gray-500">
            Masukkan kredensial toko <span className="font-bold text-rose-600">{storeConfig.storeName}</span> untuk mengakses POS & Pengaturan.
          </p>
        </div>

        {/* Error Alert Panel */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-xs font-semibold text-red-600 flex items-start gap-2.5"
            id="login-error-alert"
          >
            <ShieldAlert className="h-4 w-4 mt-0.5 flex-none" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-rose-300 focus:bg-white rounded-xl pl-11 pr-4 py-3 text-xs font-semibold focus:outline-hidden transition-all text-gray-800"
                id="login-username-input"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-gray-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-200 focus:border-rose-300 focus:bg-white rounded-xl pl-11 pr-12 py-3 text-xs font-semibold focus:outline-hidden transition-all text-gray-800"
                id="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
                id="toggle-password-btn"
                title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-md shadow-rose-100 transition-all active:scale-98 flex items-center justify-center gap-2 ${
              isSubmitting ? 'opacity-85 cursor-not-allowed' : 'cursor-pointer'
            }`}
            id="submit-login-btn"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Masuk Ke Dashboard'
            )}
          </button>
        </form>

        {/* Demo Credentials Hint Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100 bg-gray-50/40 -mx-8 -mb-8 px-8 py-5 flex items-start gap-2.5">
          <Sparkles className="h-4 w-4 text-rose-500 mt-0.5 flex-none" />
          <div className="space-y-0.5 text-[11px] text-gray-500 leading-normal">
            <span className="font-bold text-gray-700 block">Informasi Kredensial Akses:</span>
            <span>Gunakan username <span className="font-bold text-rose-600">admin</span> dan password bawaan <span className="font-bold text-rose-600">admin123</span>. Password dapat diganti di Tab Pengaturan Toko.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
