import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusCircleIcon,
    ArrowPathIcon,
    BuildingStorefrontIcon,
    ChevronRightIcon,
    BeakerIcon,
    ArchiveBoxIcon,
    TruckIcon,
    SparklesIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import AdminLayout from '../../components/AdminLayout';

const Spinner = () => (
    <ArrowPathIcon className="h-5 w-5 animate-spin" />
);

export default function RestockPage() {
    const { isAuthenticated, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [branches, setBranches] = useState([]);
    const [drinks, setDrinks] = useState([]);

    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedDrink, setSelectedDrink] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isRestocking, setIsRestocking] = useState(false);

    const [selectedHqDrink, setSelectedHqDrink] = useState('');
    const [hqQuantity, setHqQuantity] = useState('');
    const [isAddingStock, setIsAddingStock] = useState(false);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !isAdmin)) {
            router.push('/login');
            return;
        }

        const fetchAdminData = async () => {
            if (!isAuthenticated || !isAdmin) return;

            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const res = await axios.get(
                    `${BACKEND_URL}/admin/dashboard`,
                    { headers }
                );
                
                const filteredBranches = res.data.branches.filter(branch => branch.name !== 'Headquarters');
                setBranches(filteredBranches);
                setDrinks(res.data.drinks);

            } catch (err) {
                toast.error('Failed to load initial admin data.');
            }
        };

        fetchAdminData();
    }, [isAuthenticated, isAdmin, authLoading, router]);
    
    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!selectedHqDrink || !hqQuantity) {
            toast.error('Please select a drink and specify the quantity.');
            return;
        }
        setIsAddingStock(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${BACKEND_URL}/admin/add-stock`,
                {
                    drink_id: parseInt(selectedHqDrink),
                    quantity: parseInt(hqQuantity),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Headquarters stock updated.');
            setHqQuantity('');
            setSelectedHqDrink('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add stock.');
        } finally {
            setIsAddingStock(false);
        }
    };

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!selectedBranch || !selectedDrink || !quantity) {
            toast.error('Please complete all fields.');
            return;
        }
        setIsRestocking(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${BACKEND_URL}/admin/restock`,
                {
                    branch_id: parseInt(selectedBranch),
                    drink_id: parseInt(selectedDrink),
                    quantity: parseInt(quantity),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Inventory transfer successful.');
            setQuantity('');
            setSelectedBranch('');
            setSelectedDrink('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to restock branch.');
        } finally {
            setIsRestocking(false);
        }
    };

    if (authLoading || !isAuthenticated || !isAdmin) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    const inputClasses = `w-full rounded-2xl border-2 pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all ${
        isDark 
            ? 'bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50' 
            : 'bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20'
    }`;

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto space-y-10 py-4">
                {/* Page Header */}
                <div className="space-y-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                        <TruckIcon className="h-3 w-3 mr-1.5" />
                        Logistics Engine
                    </div>
                    <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Inventory Management
                    </h1>
                    <p className="text-gray-500 font-medium max-w-2xl">
                        Control the flow of refreshments. Add new supply to the central hub or distribute stock across your branch network.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* HQ Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-8 md:p-10 rounded-[3rem] border-2 shadow-2xl transition-all ${
                            isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl shadow-indigo-500/10' : 'bg-white border-gray-100 shadow-xl'
                        }`}
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-indigo-500/10 rounded-3xl">
                                <ArchiveBoxIcon className="h-8 w-8 text-indigo-500" />
                            </div>
                            <div>
                                <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Headquarters
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Add Primary Supply</p>
                            </div>
                        </div>

                        <form onSubmit={handleAddStock} className="space-y-6">
                            <div className="space-y-2">
                                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Select Beverage
                                </label>
                                <div className="relative group">
                                    <BeakerIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                                    <select
                                        className={inputClasses}
                                        value={selectedHqDrink}
                                        onChange={(e) => setSelectedHqDrink(e.target.value)}
                                    >
                                        <option value="" disabled>Choose drink...</option>
                                        {drinks.map(drink => (
                                            <option key={drink.id} value={drink.id}>{drink.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Bulk Quantity
                                </label>
                                <div className="relative group">
                                    <PlusCircleIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                                    <input
                                        type="number"
                                        min="1"
                                        className={inputClasses}
                                        placeholder="Enter amount..."
                                        value={hqQuantity}
                                        onChange={(e) => setHqQuantity(e.target.value)}
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isAddingStock}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isAddingStock ? <Spinner /> : <><SparklesIcon className="h-4 w-4 stroke-[3px]" /> Update Hub Supply</>}
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Branch Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-8 md:p-10 rounded-[3rem] border-2 shadow-2xl transition-all ${
                            isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl shadow-teal-500/10' : 'bg-white border-gray-100 shadow-xl'
                        }`}
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-teal-500/10 rounded-3xl">
                                <BuildingStorefrontIcon className="h-8 w-8 text-teal-500" />
                            </div>
                            <div>
                                <h2 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Branch Network
                                </h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Internal Transfer</p>
                            </div>
                        </div>

                        <form onSubmit={handleRestock} className="space-y-6">
                            <div className="space-y-2">
                                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Destination Branch
                                </label>
                                <div className="relative group">
                                    <BuildingStorefrontIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-teal-400' : 'text-gray-400 group-focus-within:text-teal-500'}`} />
                                    <select
                                        className={inputClasses}
                                        value={selectedBranch}
                                        onChange={(e) => setSelectedBranch(e.target.value)}
                                    >
                                        <option value="" disabled>Select target...</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>{branch.name} ({branch.location})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Beverage Type
                                </label>
                                <div className="relative group">
                                    <BeakerIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-teal-400' : 'text-gray-400 group-focus-within:text-teal-500'}`} />
                                    <select
                                        className={inputClasses}
                                        value={selectedDrink}
                                        onChange={(e) => setSelectedDrink(e.target.value)}
                                    >
                                        <option value="" disabled>Select drink...</option>
                                        {drinks.map(drink => (
                                            <option key={drink.id} value={drink.id}>{drink.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Transfer Quantity
                                </label>
                                <div className="relative group">
                                    <ChevronRightIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-teal-400' : 'text-gray-400 group-focus-within:text-teal-500'}`} />
                                    <input
                                        type="number"
                                        min="1"
                                        className={inputClasses}
                                        placeholder="Enter amount..."
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isRestocking}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isRestocking ? <Spinner /> : <><ArrowRightIcon className="h-4 w-4 stroke-[3px]" /> Confirm Transfer</>}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}