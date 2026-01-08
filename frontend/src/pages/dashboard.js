import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import CustomerLayout from '../components/CustomerLayout';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';

export default function Dashboard() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const [drinks, setDrinks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    cart,
    addToCart,
    removeFromCart,
    getCartTotal,
    setBranch,
    branchId: cartBranchId,
  } = useCart();

  const drinkImages = {
    Coke: '/images/coke3.jpg',
    Fanta: '/images/Fanta-Orange.jpg',
    Sprite: '/images/sprite.jpg',
  };

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
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/drinks/list?branchId=${selectedBranch}`,
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

  const totalAmount = getCartTotal(drinks);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  if (loading || !isAuthenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
        Loading...
      </div>
    );
  }

  return (
    <CustomerLayout>
      {error && <div className="bg-red-500 p-3 rounded-md mb-4 text-white">{error}</div>}
      {successMessage && <div className="bg-green-500 p-3 rounded-md mb-4 text-white">{successMessage}</div>}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 sm:p-6 rounded-lg shadow-lg mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      >
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          {user?.name ? `Welcome, ${user.name}!` : 'Customer Dashboard'}
        </h2>

        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <select
            value={selectedBranch}
            onChange={handleBranchChange}
            className={`w-full md:w-auto py-2 px-3 rounded-md border focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.location})
              </option>
            ))}
          </select>

          <div className="fixed bottom-4 left-4 right-4 md:static md:w-auto z-50">
            <Link href="/cart">
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 shadow-lg w-full md:w-auto"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="text-sm sm:text-base text-center">
                  View Cart ({cartCount})
                  <span className="block sm:inline"> – KES {totalAmount.toFixed(2)}</span>
                </span>
              </motion.a>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Drinks */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-4">Available Drinks</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {drinks.map((drink) => (
          <motion.div
            key={drink.id}
            whileHover={{ y: -5 }}
            className={`rounded-xl overflow-hidden shadow-lg border flex flex-col ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="relative h-56 sm:h-72 md:h-80">
              <img
                src={drinkImages[drink.name] || '/images/coke.jpg'}
                alt={drink.name}
                className="w-full h-full object-cover"
                draggable="false"
              />
              {drink.quantity === 0 && (
                <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  SOLD OUT
                </span>
              )}
            </div>

            <div className="p-4 sm:p-5 flex flex-col flex-grow">
              <h3 className="text-xl font-bold mb-1">{drink.name}</h3>
              <p className={`text-lg font-semibold mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                KES {parseFloat(drink.price).toFixed(2)}
              </p>
              <p className="text-sm mb-4 text-gray-500">
                {drink.quantity > 0 ? `${drink.quantity} remaining` : 'Out of stock'}
              </p>

              <div className="mt-auto">
                {!cart[drink.id] ? (
                  <button
                    onClick={() => addToCart(drink.id, drink.price, selectedBranch)}
                    disabled={drink.quantity === 0}
                    className={`w-full py-2 rounded-lg font-bold transition ${
                      drink.quantity === 0
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => removeFromCart(drink.id)}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                      −
                    </button>
                    <span className="text-lg font-bold">{cart[drink.id]}</span>
                    <button
                      onClick={() => addToCart(drink.id, drink.price, selectedBranch)}
                      disabled={cart[drink.id] >= drink.quantity}
                      className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </CustomerLayout>
  );
}