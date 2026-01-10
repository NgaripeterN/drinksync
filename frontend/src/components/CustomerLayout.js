import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const CustomerLayout = ({ children }) => {
  const { logout } = useAuth();
  const { cart } = useCart();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Cart', href: '/cart', icon: ShoppingCartIcon },
    { name: 'History', href: '/history', icon: ShoppingBagIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  ];

  const cartItemCount = Object.values(cart).reduce((acc, quantity) => acc + quantity, 0);

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`flex-shrink-0 flex flex-col h-screen sticky top-0 p-4 relative border-r ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-9 rounded-full p-1 shadow-md border z-10 transition-colors ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-gray-300 hover:text-white'
              : 'bg-white border-gray-300 text-gray-600 hover:text-gray-900'
          }`}
        >
          {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </button>

        {/* Brand Section - Fixed */}
        <div className="flex items-center mb-8 h-8 flex-shrink-0 px-2">
          <div className={`flex items-center gap-2 transition-opacity duration-300 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <ArrowPathIcon className="h-4 w-4 text-white" />
            </div>
            <h1 className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
              DRINKSYNC
            </h1>
          </div>
        </div>

        {/* Navigation Section - Scrollable */}
        <nav className="flex-1 flex flex-col space-y-2 overflow-y-auto no-scrollbar pb-4">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 relative ${
                  router.pathname === item.href
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                    : isDark
                    ? 'hover:bg-gray-700 text-gray-300'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-6 w-6 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 whitespace-nowrap font-bold text-sm tracking-tight"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {item.name === 'Cart' && cartItemCount > 0 && (
                  <span className={`bg-red-500 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 ${isCollapsed ? 'absolute -top-1 -right-1' : ''}`}>
                    {cartItemCount}
                  </span>
                )}
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Footer Section - Fixed at bottom */}
        <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
          <motion.button
            onClick={toggleTheme}
            className={`p-3 rounded-lg flex items-center transition-all duration-200 ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isDark ? <SunIcon className="h-6 w-6 flex-shrink-0" /> : <MoonIcon className="h-6 w-6 flex-shrink-0" />}
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 whitespace-nowrap font-bold text-xs uppercase tracking-widest"
              >
                Theme
              </motion.span>
            )}
          </motion.button>
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white font-black py-3 px-4 rounded-lg flex items-center transition-all duration-200 uppercase text-[10px] tracking-[0.2em]"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 flex-shrink-0" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;
