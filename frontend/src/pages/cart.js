import React, { useState, useEffect } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon, 
  ShoppingBagIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ArchiveBoxXMarkIcon
} from '@heroicons/react/24/outline';

const Cart = () => {
    const { cart, branchId, addToCart, removeFromCart, getCartTotal, clearCart, updateCartQuantity } = useCart();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [drinks, setDrinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const drinkImages = {
        'Coke': '/images/coke3.jpg',
        'Fanta': '/images/Fanta-Orange.jpg',
        'Sprite': '/images/sprite.jpg',
    };

    useEffect(() => {
        const fetchDrinks = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/drinks/list?branchId=${branchId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDrinks(response.data);
            } catch (error) {
                // Error handled silently or through UI if needed
            } finally {
                setLoading(false);
            }
        };

        if (branchId) {
            fetchDrinks();
        } else {
            setLoading(false);
        }
    }, [branchId]);

    const cartItems = Object.keys(cart).map(drinkId => {
        const drink = drinks.find(d => d.id === parseInt(drinkId));
        return drink ? { ...drink, quantity: cart[drinkId] } : null;
    }).filter(item => item !== null);

    const totalAmount = getCartTotal(drinks);

    const handleCheckout = () => {
        router.push({
            pathname: '/checkout',
            query: {
                branchId: branchId,
                cart: JSON.stringify(cart),
                total: totalAmount,
            },
        });
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div className="max-w-6xl mx-auto space-y-10 py-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                            Your Selection
                        </div>
                        <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Shopping Cart
                        </h1>
                    </div>
                    {cartItems.length > 0 && (
                        <button 
                            onClick={clearCart}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                                isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'
                            }`}
                        >
                            <ArchiveBoxXMarkIcon className="h-4 w-4" />
                            Clear Cart
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex flex-col items-center justify-center py-20 px-4 rounded-[3rem] border-2 border-dashed ${
                            isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                        <div className="p-6 bg-indigo-500/10 rounded-[2rem] mb-6">
                            <ShoppingBagIcon className="h-12 w-12 text-indigo-500 opacity-50" />
                        </div>
                        <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your cart is empty</h2>
                        <p className="text-gray-500 font-medium mb-8">Looks like you haven't added anything yet.</p>
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 transition-all"
                        >
                            Start Shopping
                            <ArrowRightIcon className="h-4 w-4 stroke-[3px]" />
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                        {/* Items List */}
                        <div className="lg:col-span-2 space-y-4">
                            <AnimatePresence mode="popLayout">
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className={`group relative p-6 rounded-[2.5rem] border-2 transition-all hover:shadow-xl ${
                                            isDark ? 'bg-gray-800/50 border-gray-700 hover:border-indigo-500/30' : 'bg-white border-gray-100 hover:border-indigo-500/20'
                                        }`}
                                    >
                                        <div className="flex flex-col sm:flex-row items-center gap-6">
                                            {/* Image */}
                                            <div className="relative h-24 w-24 sm:h-28 sm:w-24 flex-shrink-0">
                                                <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                                                <img 
                                                    src={drinkImages[item.name] || '/images/coke.jpg'} 
                                                    alt={item.name} 
                                                    className="relative h-full w-full object-cover rounded-2xl shadow-lg border-2 border-white/10"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-grow text-center sm:text-left space-y-1">
                                                <h3 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {item.name}
                                                </h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                                    KES {parseFloat(item.price).toFixed(2)} / unit
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-4">
                                                <div className={`flex items-center p-1.5 rounded-2xl border-2 ${
                                                    isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-100'
                                                }`}>
                                                    <motion.button 
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => removeFromCart(item.id)}
                                                        className={`p-2 rounded-xl transition-all ${
                                                            isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-white text-gray-600 shadow-sm'
                                                        }`}
                                                    >
                                                        <MinusIcon className="h-4 w-4 stroke-[3px]" />
                                                    </motion.button>
                                                    
                                                    <span className={`w-10 text-center font-black text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        {item.quantity}
                                                    </span>

                                                    <motion.button 
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => addToCart(item.id, item.price, branchId)}
                                                        className={`p-2 rounded-xl transition-all ${
                                                            isDark ? 'hover:bg-gray-800 text-indigo-400' : 'hover:bg-white text-indigo-600 shadow-sm'
                                                        }`}
                                                    >
                                                        <PlusIcon className="h-4 w-4 stroke-[3px]" />
                                                    </motion.button>
                                                </div>

                                                <div className="text-right min-w-[100px]">
                                                    <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                        KES {(parseFloat(item.price) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>

                                                <motion.button 
                                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeFromCart(item.id, true)}
                                                    className="p-3 text-red-500/50 hover:text-red-500 transition-colors"
                                                >
                                                    <TrashIcon className="h-6 w-6" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:sticky lg:top-8 space-y-6">
                            <div className={`p-8 rounded-[2.5rem] border-2 shadow-2xl transition-all ${
                                isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl shadow-indigo-500/10' : 'bg-white border-gray-100 shadow-indigo-500/5'
                            }`}>
                                <h3 className={`text-xl font-black tracking-tight mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Order Summary
                                </h3>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className={isDark ? 'text-white' : 'text-gray-900'}>KES {totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-500">Service Fee</span>
                                        <span className="text-emerald-500">FREE</span>
                                    </div>
                                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-4" />
                                    <div className="flex justify-between items-end">
                                        <span className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
                                        <span className={`text-3xl font-black text-indigo-600`}>KES {totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCheckout}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-indigo-500/40 transition-all flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout
                                    <ArrowRightIcon className="h-4 w-4 stroke-[3px]" />
                                </motion.button>

                                <button 
                                    onClick={() => router.push('/dashboard')}
                                    className={`w-full mt-4 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-colors ${
                                        isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-indigo-600'
                                    }`}
                                >
                                    Continue Shopping
                                </button>
                            </div>

                            {/* Secure Payment Badge */}
                            <div className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 ${
                                isDark ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            }`}>
                                <div className="p-2 bg-emerald-500/20 rounded-xl">
                                    <ArrowPathIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Secured by M-Pesa</p>
                                    <p className="text-[9px] font-bold opacity-70">Encrypted checkout session</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
};

export default Cart;