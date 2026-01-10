import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCartIcon, 
  BuildingOfficeIcon, 
  MapPinIcon,
  SparklesIcon,
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import CustomerLayout from '../components/CustomerLayout';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [drinks, setDrinks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const {
    cart,
    addToCart,
    removeFromCart,
    getCartTotal,
    setBranch,
    branchId: cartBranchId,
    updateCartQuantity,
  } = useCart();

  const drinkImages = {
    Coke: '/images/coke3.jpg',
    Fanta: '/images/Fanta-Orange.jpg',
    Sprite: '/images/sprite.jpg',
  };

  const filteredDrinks = useMemo(() => {
    return drinks.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [drinks, searchTerm]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const staticBranches = [
      { id: 1, name: 'Headquarters', location: 'Nairobi' },
      { id: 2, name: 'Kisumu Branch', location: 'Kisumu' },
      { id: 3, name: 'Mombasa Branch', location: 'Mombasa' },
      { id: 4, name: 'Nakuru Branch', location: 'Nakuru' },
      { id: 5, name: 'Eldoret Branch', location: 'Eldoret' },
    ];

    setBranches(staticBranches);

    if (cartBranchId) {
      setSelectedBranch(cartBranchId);
    } else {
      setSelectedBranch(staticBranches[0].id);
      setBranch(staticBranches[0].id);
    }
  }, [cartBranchId, setBranch]);

  useEffect(() => {
    if (!selectedBranch || !isAuthenticated) return;

    const fetchDrinks = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
          `${BACKEND_URL}/drinks/list?branchId=${selectedBranch}`,
          { headers }
        );
        setDrinks(res.data);
      } catch (err) {
        setError('Failed to load drinks.');
      }
    };

    fetchDrinks();
  }, [selectedBranch, isAuthenticated]);

  const handleBranchChange = (e) => {
    const newBranchId = e.target.value;
    if (Object.keys(cart).length > 0 && newBranchId !== selectedBranch) {
      if (!window.confirm('Changing branches will clear your cart. Continue?')) return;
    }
    setBranch(newBranchId);
    setSelectedBranch(newBranchId);
  };

  const handleQuantityChange = (drinkId, value, maxStock) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    
    if (numValue === '') {
      updateCartQuantity(drinkId, 0);
      return;
    }

    if (isNaN(numValue) || numValue < 0) return;
    
    const clampedValue = Math.min(numValue, maxStock);
    updateCartQuantity(drinkId, clampedValue);
  };

  const totalAmount = getCartTotal(drinks);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  if (loading || !isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
          <p className="font-bold uppercase tracking-widest text-xs opacity-50">Syncing Drinks...</p>
        </div>
      </div>
    );
  }

  return (
    <CustomerLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        
        {/* Modern Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 shadow-2xl border-2 ${
            isDark ? 'bg-gray-800 border-gray-700/50 shadow-indigo-500/5' : 'bg-white border-gray-100'
          }`}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <SparklesIcon className="h-3 w-3 mr-1.5" />
                Premium Beverage Network
              </div>
              <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Welcome back, <br/>
                <span className="text-indigo-500">{user?.name?.split(' ')[0]}!</span>
              </h1>
              <p className={`text-base font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                What would you like to drink today? Choose your nearest branch and start your order.
              </p>
            </div>

            <div className={`p-6 rounded-[2rem] border-2 space-y-4 md:w-80 ${
              isDark ? 'bg-gray-900/50 border-gray-700/50' : 'bg-gray-50 border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <BuildingOfficeIcon className="h-5 w-5 text-indigo-500" />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Branch</span>
              </div>
              
              <select
                value={selectedBranch}
                onChange={handleBranchChange}
                className={`w-full py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all focus:ring-4 focus:ring-indigo-500/10 outline-none ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white hover:border-gray-600'
                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300 shadow-sm'
                }`}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              
              <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                <MapPinIcon className="h-3 w-3 mr-1" />
                <span>Serving {branches.find(b => b.id.toString() === selectedBranch.toString())?.location || 'Your Region'}</span>
              </div>
            </div>
          </div>

          {/* Decorative background shapes */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        </motion.section>

        {/* Main Content Area */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className={`text-2xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Available Drinks
              </h2>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">From {branches.find(b => b.id.toString() === selectedBranch.toString())?.location}</p>
            </div>

            <div className="relative group">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-11 pr-4 py-2.5 rounded-xl border-2 text-sm font-bold w-full md:w-64 transition-all focus:ring-4 focus:ring-indigo-500/10 outline-none ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Drinks Grid */}
          {filteredDrinks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDrinks.map((drink) => (
                <motion.div
                  key={drink.id}
                  layout
                  whileHover={{ y: -8 }}
                  className={`group rounded-[2rem] overflow-hidden border-2 transition-all duration-300 ${
                    isDark ? 'bg-gray-800 border-gray-700/50 hover:border-indigo-500/50' : 'bg-white border-gray-100 hover:border-indigo-500/30 shadow-sm'
                  }`}
                >
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      src={drinkImages[drink.name] || '/images/coke.jpg'}
                      alt={drink.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      draggable="false"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {drink.quantity === 0 ? (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-xl">
                          Sold Out
                        </span>
                      </div>
                    ) : drink.quantity <= 10 ? (
                      <span className="absolute top-4 right-4 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                        Low Stock
                      </span>
                    ) : null}
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{drink.name}</h3>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {drink.quantity} Bottles Left
                        </p>
                      </div>
                      <p className={`text-xl font-black ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        <span className="text-xs mr-0.5">KES</span>
                        {parseFloat(drink.price).toLocaleString()}
                      </p>
                    </div>

                    <div className="pt-2">
                      {!cart[drink.id] ? (
                        <button
                          onClick={() => addToCart(drink.id, drink.price, selectedBranch)}
                          disabled={drink.quantity === 0}
                          className={`w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all shadow-lg ${
                            drink.quantity === 0
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-95'
                          }`}
                        >
                          <PlusIcon className="h-4 w-4 stroke-[3px]" />
                          Add to Order
                        </button>
                      ) : (
                        <div className={`flex items-center justify-between p-1.5 rounded-2xl border-2 ${
                          isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-100'
                        }`}>
                          <button
                            onClick={() => removeFromCart(drink.id)}
                            className={`p-2 rounded-xl transition-all ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-200 text-gray-800 shadow-sm'}`}
                          >
                            <MinusIcon className="h-4 w-4 stroke-[3px]" />
                          </button>
                          <input
                            type="number"
                            value={cart[drink.id] || 0}
                            onChange={(e) => handleQuantityChange(drink.id, e.target.value, drink.quantity)}
                            className={`w-16 text-center text-lg font-black bg-transparent border-none outline-none ${isDark ? 'text-white' : 'text-gray-900'}`}
                          />
                          <button
                            onClick={() => addToCart(drink.id, drink.price, selectedBranch)}
                            disabled={cart[drink.id] >= drink.quantity}
                            className={`p-2 rounded-xl transition-all disabled:opacity-30 ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-200 text-gray-800 shadow-sm'}`}
                          >
                            <PlusIcon className="h-4 w-4 stroke-[3px]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-20 text-center rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
              <SparklesIcon className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              <h3 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                No Drinks Found
              </h3>
              <p className="text-sm font-bold text-gray-500">We couldn't find any drinks matching "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Dynamic Floating Cart Bar */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-[60]"
            >
              <Link href="/cart">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-indigo-600 rounded-[2rem] p-4 flex items-center justify-between shadow-2xl shadow-indigo-500/40 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <ShoppingBagIcon className="h-6 w-6 text-white" />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full border-4 border-indigo-600">
                        {cartCount}
                      </span>
                    </div>
                    <div>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Check Out Now</p>
                      <p className="text-white font-black text-xl">
                        KES {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white/20 hover:bg-white/30 transition-colors p-3 rounded-2xl">
                    <ShoppingCartIcon className="h-6 w-6 text-white" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-red-500 text-white px-6 py-3 rounded-full font-black text-sm shadow-xl flex items-center gap-2">
            <XCircleIcon className="h-5 w-5" />
            {error}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}