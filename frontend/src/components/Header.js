import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';

const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.header
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 left-0 right-0 p-4 bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg flex items-center justify-between z-50"
    >
      <Link href="/" className="text-2xl font-bold text-white">
        DrinkSync
      </Link>

      <nav className="flex items-center space-x-4">
        <Link href="/" className="text-white hover:text-blue-300 transition-colors duration-300">
          Home
        </Link>
        <Link href="/dashboard" className="text-white hover:text-blue-300 transition-colors duration-300">
          Dashboard
        </Link>
        <Link href="/about" className="text-white hover:text-blue-300 transition-colors duration-300">
          About
        </Link>
       
        
        <motion.button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-700 text-white shadow-lg focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {theme === 'dark' ? (
            <SunIcon className="h-6 w-6" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </motion.button>
      </nav>
    </motion.header>
  );
};

export default Header;

