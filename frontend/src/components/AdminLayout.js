import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HomeIcon,
  ChartPieIcon,
  ArrowLeftOnRectangleIcon,
  SunIcon,
  MoonIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Sales Report', href: '/admin/report', icon: ChartPieIcon },
  ];

  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`flex-shrink-0 flex flex-col justify-between p-4 relative border-r ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-9 rounded-full p-1 shadow-md border transition-colors ${
            isDark
              ? 'bg-gray-700 border-gray-600 text-gray-300 hover:text-white'
              : 'bg-white border-gray-300 text-gray-600 hover:text-gray-900'
          }`}
        >
          {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
        </button>

        <div>
          <div className="flex items-center mb-8 overflow-hidden h-8">
            <h1
              className={`text-2xl font-bold whitespace-nowrap transition-opacity duration-300 ${
                isDark ? 'text-white' : 'text-gray-900'
              } ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}
            >
              Admin Panel
            </h1>
          </div>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    router.pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'hover:bg-gray-700 text-gray-300'
                      : 'hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <item.icon className="h-6 w-6 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="ml-3 whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col space-y-2">
          <motion.button
            onClick={toggleTheme}
            className={`p-3 rounded-lg flex items-center transition-all duration-200 ${
              isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isDark ? <SunIcon className="h-6 w-6 flex-shrink-0" /> : <MoonIcon className="h-6 w-6 flex-shrink-0" />}
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="ml-3 whitespace-nowrap"
              >
                Toggle Theme
              </motion.span>
            )}
          </motion.button>
          <motion.button
            onClick={logout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg flex items-center transition-all duration-200"
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

export default AdminLayout;
