import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  ArrowPathIcon, 
  PhoneIcon, 
  ArrowRightIcon,
  ChevronLeftIcon,
  CheckBadgeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

export default function Checkout() {
    const { isAuthenticated, loading, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const router = useRouter();
    
    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [branchId, setBranchId] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }

        if (router.query.cart && router.query.total && router.query.branchId) {
            try {
                const parsedCart = JSON.parse(router.query.cart);
                const items = Object.entries(parsedCart).map(([drinkId, quantity]) => ({
                    drink_id: parseInt(drinkId),
                    quantity: quantity,
                }));
                setCartItems(items);
                setTotalAmount(parseFloat(router.query.total));
                setBranchId(parseInt(router.query.branchId));
            } catch (e) {
                console.error("Failed to parse cart data:", e);
                setError("Error loading cart data.");
            }
        } else if (!loading) {
            setError("No active checkout session found.");
        }
    }, [isAuthenticated, loading, router]);

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!phoneNumber) {
            setError("Please enter your M-Pesa phone number.");
            return;
        }
        if (phoneNumber.length !== 9) {
            setError("Please enter a valid 9-digit number (e.g. 712345678)");
            return;
        }

        setIsProcessing(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/create`,
                {
                    branch_id: branchId,
                    items: cartItems,
                    phoneNumber: `254${phoneNumber}`,
                },
                { headers }
            );

            if (response.data.checkoutRequestID) {
                setSuccessMessage("STK Push Initiated! Verify on your phone.");
                setTimeout(() => {
                    router.push('/history');
                }, 3000);
            } else {
                setError(response.data.message || "Failed to initiate M-Pesa payment.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Payment initiation failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || !isAuthenticated) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className={`relative min-h-screen flex items-center justify-center p-4 overflow-hidden transition-colors duration-500 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className={`fixed top-6 right-6 p-3 rounded-2xl border-2 z-50 transition-all ${
                    isDark 
                        ? 'bg-gray-800 border-gray-700 text-yellow-400 hover:bg-gray-700 shadow-xl shadow-indigo-500/10' 
                        : 'bg-white border-gray-200 text-indigo-600 hover:bg-gray-50 shadow-lg'
                }`}
            >
                {isDark ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>

            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Left Side: Order Info */}
                <div className="space-y-6">
                    <Link href="/cart" className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                        <ChevronLeftIcon className="h-4 w-4 stroke-[3px]" />
                        Back to Cart
                    </Link>

                    <div className="space-y-2">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                            <LockClosedIcon className="h-3 w-3 mr-1.5" />
                            Secure Checkout
                        </div>
                        <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Complete Your <br/>Order.
                        </h1>
                    </div>

                    <div className={`p-8 rounded-[2.5rem] border-2 transition-all ${isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl' : 'bg-white border-gray-100 shadow-sm'}`}>
                        <h3 className={`text-sm font-black uppercase tracking-widest mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Summary</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Items ({cartItems.length})</span>
                                <span className={`font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>KES {totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Transaction Fee</span>
                                <span className="text-emerald-500 font-black">Free</span>
                            </div>
                            <div className={`h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-2`} />
                            <div className="flex justify-between items-end">
                                <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Grand Total</span>
                                <span className="text-3xl font-black text-indigo-500">KES {totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}>
                            <ShieldCheckIcon className="h-5 w-5 text-indigo-500" />
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Verified Payment</span>
                        </div>
                        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100'}`}>
                            <CheckBadgeIcon className="h-5 w-5 text-emerald-500" />
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Authorized Agent</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Payment Form */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-10 rounded-[3rem] border-2 shadow-2xl transition-all ${
                        isDark ? 'bg-gray-800 border-white/5 shadow-indigo-500/10' : 'bg-white border-gray-100 shadow-md'
                    }`}
                >
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-2 bg-white rounded-2xl shadow-inner flex items-center justify-center">
                            <img src="/images/mpesa.png" className="h-12 w-auto object-contain" alt="M-Pesa" />
                        </div>
                        <div>
                            <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>M-Pesa Checkout</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Express STK Push</p>
                        </div>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-8">
                        <div className="space-y-3">
                            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Phone Number
                            </label>
                            <div className="relative group">
                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm tracking-tighter border-r pr-3 ${isDark ? 'text-gray-400 border-gray-700' : 'text-gray-500 border-gray-200'}`}>+254</span>
                                <input 
                                    type="tel" 
                                    required
                                    autoFocus
                                    placeholder="712345678" 
                                    value={phoneNumber} 
                                    onChange={e => setPhoneNumber(e.target.value.replace(/\D/g,'').slice(0,9))}
                                    className={`w-full pl-20 pr-4 py-5 rounded-2xl border-2 font-black text-lg outline-none transition-all ${
                                        isDark 
                                            ? 'bg-gray-900 border-white/5 text-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10' 
                                            : 'bg-gray-50 border-gray-100 text-gray-900 focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5'
                                    }`}
                                />
                            </div>
                            <p className={`text-[9px] font-medium px-1 italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                You will receive an automated M-Pesa prompt on this device.
                            </p>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2"
                                >
                                    <ExclamationTriangleIcon className="h-4 w-4" />
                                    {error}
                                </motion.div>
                            )}
                            {successMessage && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2"
                                >
                                    <CheckBadgeIcon className="h-4 w-4" />
                                    {successMessage}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isProcessing}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[10px] tracking-[0.2em] py-6 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Complete Payment
                                    <ArrowRightIcon className="h-5 w-5 stroke-[3px]" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-8 flex flex-col items-center gap-2 opacity-40">
                        <div className="flex gap-2">
                            <LockClosedIcon className={`h-3 w-3 ${isDark ? 'text-white' : 'text-gray-900'}`} />
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}>End-to-End Encrypted</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}