import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.header
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 px-6 py-4 z-50 backdrop-blur-xl border-b transition-colors duration-500 ${
        isDark 
          ? 'bg-gray-900/70 border-white/5' 
          : 'bg-white/70 border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:rotate-180 transition-transform duration-700">
            <ArrowPathIcon className="h-5 w-5 text-white" />
          </div>
          <span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
            DRINKSYNC
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <NavLink href="/" label="Home" isDark={isDark} />
          <NavLink href="/dashboard" label="Dashboard" isDark={isDark} />
          <NavLink href="/about" label="About" isDark={isDark} />
        </nav>
        
        <div className="flex items-center gap-4">
          <motion.button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl border transition-all ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700' 
                : 'bg-gray-50 border-gray-200 text-indigo-600 hover:bg-gray-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDark ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </motion.button>

          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              Login
            </motion.div>
          </Link>
        </div>
      </div>
    </motion.header>
  );
};

function NavLink({ href, label, isDark }) {
  return (
    <Link 
      href={href} 
      className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
        isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-indigo-600'
      }`}
    >
      {label}
    </Link>
  );
}

export default Header;

