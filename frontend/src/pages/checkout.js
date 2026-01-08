import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Checkout() {
    const { isAuthenticated, loading } = useAuth();
    const { theme, toggleTheme } = useTheme();
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
        } else {
            setError("No cart data found. Please go back to the dashboard.");
        }
    }, [isAuthenticated, loading, router]);

    const handlePayment = async () => {
        if (!phoneNumber) {
            setError("Please enter your Mpesa phone number.");
            return;
        }
        if (!branchId || cartItems.length === 0) {
            setError("Cart or branch information is missing. Please return to the dashboard.");
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
                    phoneNumber: phoneNumber,
                },
                { headers }
            );

            if (response.data.checkoutRequestID) {
                setSuccessMessage("STK Push initiated! Please check your phone to complete the payment.");
                setTimeout(() => {
                    router.push('/dashboard');
                }, 5000);
            } else {
                setError(response.data.message || "Failed to initiate Mpesa payment.");
            }
        } catch (err) {
            console.error("Payment initiation error:", err.response?.data || err.message);
            setError(err.response?.data?.message || "Payment initiation failed. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading || !isAuthenticated) {
        return <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center">Loading...</div>;
    }

    if (error && !successMessage) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">Checkout Error</h2>
                    <p className="text-red-500 mb-6">{error}</p>
                    <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center p-4 relative">
             <button
                onClick={toggleTheme}
                className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors z-50 shadow-lg"
                aria-label="Toggle Theme"
            >
                {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6" />}
            </button>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-lg"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Checkout</h2>

                {successMessage && (
                    <div className="bg-green-500 p-3 rounded-md mb-4 text-center text-white">
                        {successMessage}
                        <Link href="/dashboard" className="underline ml-2">Go to Dashboard</Link>
                    </div>
                )}
                {error && !successMessage && <p className="text-red-500 text-xs italic mb-4">{error}</p>}

                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3">Order Summary</h3>
                    {cartItems.length > 0 ? (
                        <ul>
                            {cartItems.map((item, index) => (
                                <li key={index} className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 text-sm sm:text-base">
                                    <span>Drink ID: {item.drink_id} x {item.quantity}</span>
                                    {/* Placeholder price */}
                                    <span>KES { (item.quantity * 70).toFixed(2) }</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No items in cart.</p>
                    )}
                    <div className="flex justify-between font-bold text-lg mt-4">
                        <span>Total:</span>
                        <span>KES {totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="phoneNumber" className="block text-gray-600 dark:text-gray-300 text-sm font-bold mb-2">
                        Mpesa Phone Number:
                    </label>
                    <input
                        type="text"
                        id="phoneNumber"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 dark:text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        placeholder="e.g., 2547XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                    <Link href="/dashboard" className="w-full sm:w-auto text-center bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200">
                        Back to Dashboard
                    </Link>
                    <motion.button
                        onClick={handlePayment}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition-all duration-200"
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Processing...' : `Pay KES ${totalAmount.toFixed(2)}`}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
