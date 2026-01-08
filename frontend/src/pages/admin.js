import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    PlusCircleIcon,
    ArrowPathIcon,
    BuildingStorefrontIcon,
    ChevronRightIcon,
    BeakerIcon,
    ArchiveBoxIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AdminLayout from '../components/AdminLayout';

// A spinner component for loading states
const Spinner = () => (
    <ArrowPathIcon className="h-5 w-5 animate-spin" />
);

export default function AdminDashboard() {
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

    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

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
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/dashboard`,
                    { headers }
                );
                
                // Filter out 'Headquarters' from the branches list for the restock form
                const filteredBranches = res.data.branches.filter(branch => branch.name !== 'Headquarters');
                setBranches(filteredBranches);
                setDrinks(res.data.drinks);

            } catch (err) {
                console.error('Admin fetch error:', err.response?.data || err.message);
                setError('Failed to load initial admin data. Please refresh the page.');
            }
        };

        fetchAdminData();
    }, [isAuthenticated, isAdmin, authLoading, router]);
    
    const clearMessages = () => {
        setMessage('');
        setError('');
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        clearMessages();
        
        if (!selectedHqDrink || !hqQuantity) {
            setError('Please select a drink and specify the quantity.');
            return;
        }
        if (parseInt(hqQuantity) <= 0) {
            setError('Quantity must be a positive number.');
            return;
        }
        
        setIsAddingStock(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/add-stock`,
                {
                    drink_id: parseInt(selectedHqDrink),
                    quantity: parseInt(hqQuantity),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage(`Successfully added ${hqQuantity} units of ${drinks.find(d => d.id == selectedHqDrink)?.name} to Headquarters.`);
            setHqQuantity('');
            setSelectedHqDrink('');
        } catch (err) {
            console.error('Add stock error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to add stock to Headquarters.');
        } finally {
            setIsAddingStock(false);
        }
    };

    const handleRestock = async (e) => {
        e.preventDefault();
        clearMessages();

        if (!selectedBranch || !selectedDrink || !quantity) {
            setError('Please select a branch, a drink, and specify the quantity.');
            return;
        }
        if (parseInt(quantity) <= 0) {
            setError('Quantity must be a positive number.');
            return;
        }

        setIsRestocking(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/restock`,
                {
                    branch_id: parseInt(selectedBranch),
                    drink_id: parseInt(selectedDrink),
                    quantity: parseInt(quantity),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const branchName = branches.find(b => b.id == selectedBranch)?.name;
            const drinkName = drinks.find(d => d.id == selectedDrink)?.name;
            setMessage(`Successfully restocked ${branchName} with ${quantity} units of ${drinkName}.`);
            setQuantity('');
            setSelectedBranch('');
            setSelectedDrink('');
        } catch (err) {
            console.error('Restock error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to restock the branch.');
        } finally {
            setIsRestocking(false);
        }
    };

    if (authLoading || !isAuthenticated || !isAdmin) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <Spinner /> <span className="ml-2">Loading Admin Portal...</span>
            </div>
        );
    }

    // Common class for select elements to handle placeholder color
    const selectClasses = (value) => 
        `w-full rounded-lg border py-3 pl-11 pr-4 text-base transition ${
            !value ? (isDark ? 'text-gray-400' : 'text-gray-500') : (isDark ? 'text-white' : 'text-gray-900')
        } ${isDark 
            ? 'border-slate-600 bg-slate-700 focus:border-indigo-500 focus:ring-indigo-500' 
            : 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500'
        }`;

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Stock Management
                    </h1>
                    <p className={`mt-2 text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        Add new inventory to the Headquarters or distribute stock to regional branches.
                    </p>
                </motion.div>

                {/* --- ALERTS --- */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-start gap-3 rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800"
                    >
                        <CheckCircleIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
                        <p className="font-medium text-green-900 dark:text-green-300">{message}</p>
                    </motion.div>
                )}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800"
                    >
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400" />
                        <p className={`font-medium ${isDark ? 'text-red-300' : 'text-red-900'}`}>{error}</p>
                    </motion.div>
                )}
                
                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* --- ADD STOCK TO HQ --- */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`overflow-hidden rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
                    >
                        <div className={`p-6 border-b ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                            <h2 className={`flex items-center gap-3 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <ArchiveBoxIcon className="h-7 w-7 text-indigo-500" />
                                Add to Headquarters
                            </h2>
                        </div>
                        <form onSubmit={handleAddStock} className="p-6 space-y-5">
                            <div className="relative">
                                <BeakerIcon className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-500" />
                                                                    <select
                                                                        className={selectClasses(selectedHqDrink)}
                                                                        value={selectedHqDrink}
                                                                        onChange={(e) => setSelectedHqDrink(e.target.value)}
                                                                    >
                                                                        <option value="" disabled hidden>Select a drink</option>
                                                                    
                                                                        {drinks.map(drink => (
                                                                            <option key={drink.id} value={drink.id}>{drink.name}</option>
                                                                        ))}                                </select>
                            </div>
                            <div className="relative">
                                <ChevronRightIcon className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-500" />
                                <input
                                    type="number"
                                    min="1"
                                    className={`w-full rounded-lg border py-3 pl-11 pr-4 text-base transition ${isDark ? 'placeholder-gray-400 border-slate-600 bg-slate-700 text-white focus:border-indigo-500 focus:ring-indigo-500' : 'placeholder-gray-500 border-slate-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                    placeholder="Quantity"
                                    value={hqQuantity}
                                    onChange={(e) => setHqQuantity(e.target.value)}
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={isAddingStock}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isAddingStock ? <Spinner /> : <PlusCircleIcon className="h-6 w-6" />}
                                {isAddingStock ? 'Adding Stock...' : 'Add Stock to HQ'}
                            </motion.button>
                        </form>
                    </motion.div>
                    
                    {/* --- RESTOCK BRANCH --- */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={`overflow-hidden rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}
                    >
                        <div className={`p-6 border-b ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                            <h2 className={`flex items-center gap-3 text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <BuildingStorefrontIcon className="h-7 w-7 text-teal-500" />
                                Restock a Branch
                            </h2>
                        </div>
                        <form onSubmit={handleRestock} className="p-6 space-y-5">
                             <div className="relative">
                                <BuildingStorefrontIcon className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-500" />
                                <select
                                    className={selectClasses(selectedBranch)}
                                    value={selectedBranch}
                                    onChange={(e) => setSelectedBranch(e.target.value)}
                                >
                                    <option value="" disabled hidden>Select a branch</option>
                                    
                                    {branches.map(branch => (
                                        <option key={branch.id} value={branch.id}>{branch.name} ({branch.location})</option>
                                    ))}
                                </select>
                            </div>
                             <div className="relative">
                                <BeakerIcon className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-500" />
                                <select
                                    className={selectClasses(selectedDrink)}
                                    value={selectedDrink}
                                    onChange={(e) => setSelectedDrink(e.target.value)}
                                >
                                    <option value="" disabled hidden>Select a drink</option>
                                    
                                    {drinks.map(drink => (
                                        <option key={drink.id} value={drink.id}>{drink.name}</option>
                                    ))}
                                </select>
                            </div>
                             <div className="relative">
                                <ChevronRightIcon className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-500" />
                                <input
                                    type="number"
                                    min="1"
                                    className={`w-full rounded-lg border py-3 pl-11 pr-4 text-base transition ${isDark ? 'placeholder-gray-400 border-slate-600 bg-slate-700 text-white focus:border-teal-500 focus:ring-teal-500' : 'placeholder-gray-500 border-slate-300 bg-white text-gray-900 focus:border-teal-500 focus:ring-teal-500'}`}
                                    placeholder="Quantity to Transfer"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                />
                            </div>
                            <motion.button
                                type="submit"
                                disabled={isRestocking}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isRestocking ? <Spinner /> : <PlusCircleIcon className="h-6 w-6" />}
                                {isRestocking ? 'Restocking...' : 'Restock Branch'}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}