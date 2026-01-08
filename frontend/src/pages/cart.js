import React, { useState, useEffect } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

const Cart = () => {
    const { cart, branchId, addToCart, removeFromCart, getCartTotal, clearCart } = useCart();
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
                console.error('Failed to fetch drinks:', error);
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
        return <CustomerLayout><div className="text-center p-10">Loading cart...</div></CustomerLayout>;
    }

    return (
        <CustomerLayout>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-12"
            >
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-8">Your Cart</h1>
                {cartItems.length === 0 ? (
                    <div className={`text-center p-6 sm:p-10 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                        <p className="text-lg sm:text-xl text-gray-400">Your cart is empty.</p>
                        <button onClick={() => router.push('/dashboard')} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className={`rounded-lg shadow-xl p-4 sm:p-8 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                        <ul className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {cartItems.map(item => (
                                <li key={item.id} className="py-6 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                    <div className="flex items-center w-full">
                                        <img src={drinkImages[item.name] || '/images/coke.jpg'} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover mr-4 sm:mr-6"/>
                                        <div className="flex-grow">
                                            <h3 className="text-base sm:text-lg font-semibold text-foreground">{item.name}</h3>
                                            <p className="text-sm sm:text-base text-gray-400">KES {parseFloat(item.price).toFixed(2)}</p>
                                            <p className="sm:hidden text-lg font-bold text-foreground mt-2">KES {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto sm:gap-4">
                                        <div className={`flex items-center rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                            <button onClick={() => removeFromCart(item.id)} className={`p-3 rounded-l-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}><FaMinus size={12}/></button>
                                            <span className="px-4 text-lg font-bold">{item.quantity}</span>
                                            <button onClick={() => addToCart(item.id, item.price, branchId)} className={`p-3 rounded-r-lg ${isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'}`}><FaPlus size={12}/></button>
                                        </div>
                                        <p className="hidden sm:block text-lg font-bold text-foreground w-24 text-right">KES {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                                        <button onClick={() => removeFromCart(item.id, true)} className="text-red-500 hover:text-red-400 p-2"><FaTrash/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className={`mt-8 pt-6 border-t text-right ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                            <div className={`text-xl sm:text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Total: KES {totalAmount.toFixed(2)}
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
                                <button onClick={() => { clearCart(); router.push('/dashboard'); }} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                    Clear Cart
                                </button>
                                <button onClick={handleCheckout} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </CustomerLayout>
    );
};

export default Cart;
