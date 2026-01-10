import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  CurrencyDollarIcon, 
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function Prices() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [drinks, setDrinks] = useState([]);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/drinks/list`,
          { headers }
        );
        setDrinks(res.data);
      } catch (err) {
        setError('Failed to load drinks.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrinks();
  }, []);

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/drinks/${id}`,
        { price: newPrice },
        { headers }
      );
      toast.success('Price updated successfully');
      setDrinks(
        drinks.map((drink) =>
          drink.id === id ? { ...drink, price: newPrice } : drink
        )
      );
      setEditing(null);
      setNewPrice('');
    } catch (err) {
      toast.error('Failed to update price.');
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-10 py-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
            <CurrencyDollarIcon className="h-3 w-3 mr-1.5" />
            Pricing Console
          </div>
          <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Global Price Control
          </h1>
          <p className="text-gray-500 font-medium">
            Maintain your profit margins. Update beverage pricing across all branches instantly.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`overflow-hidden rounded-[2.5rem] border-2 shadow-2xl transition-all ${
            isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl' : 'bg-white border-gray-100 shadow-xl'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={isDark ? 'bg-white/[0.02]' : 'bg-gray-50/50'}>
                  <th className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Beverage Details
                  </th>
                  <th className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Market Price
                  </th>
                  <th className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-right ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Management
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan="3" className="py-20 text-center">
                      <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : (
                  drinks.map((drink) => (
                    <motion.tr 
                      key={drink.id}
                      initial={false}
                      className={`group transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50/50'}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border-2 ${
                            isDark ? 'bg-gray-900 border-white/5' : 'bg-gray-50 border-gray-100'
                          }`}>
                            <TagIcon className="h-6 w-6 text-indigo-500" />
                          </div>
                          <span className={`font-black text-lg tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {drink.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <AnimatePresence mode="wait">
                          {editing === drink.id ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="relative max-w-[160px]"
                            >
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-500 text-xs">KES</span>
                              <input
                                type="number"
                                autoFocus
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 font-black outline-none transition-all ${
                                  isDark ? 'bg-gray-900 border-emerald-500/50 text-white' : 'bg-white border-emerald-500/30 text-gray-900'
                                }`}
                              />
                            </motion.div>
                          ) : (
                            <motion.span 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`text-xl font-black ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                              <span className="text-emerald-500 text-sm mr-1">KES</span>
                              {parseFloat(drink.price).toFixed(2)}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {editing === drink.id ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditing(null)}
                              className={`p-3 rounded-xl border-2 transition-all ${
                                isDark ? 'border-white/5 text-gray-400 hover:bg-white/5' : 'border-gray-100 text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              <XMarkIcon className="h-5 w-5 stroke-[3px]" />
                            </button>
                            <button
                              onClick={() => handleUpdate(drink.id)}
                              className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                            >
                              <CheckIcon className="h-5 w-5 stroke-[3px]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditing(drink.id);
                              setNewPrice(drink.price);
                            }}
                            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${
                              isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            }`}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            Update Price
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}