import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    ArrowPathIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    BuildingStorefrontIcon,
    ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

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

    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!authLoading && (!isAuthenticated || !isAdmin)) {
            router.push('/login');
            return;
        }

        const fetchDashboardData = async () => {
            if (!isAuthenticated || !isAdmin) return;

            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };

                const invRes = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/inventory`,
                    { headers }
                );
                setInventory(invRes.data);

            } catch (err) {
                toast.error('Failed to load dashboard data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAuthenticated, isAdmin, authLoading, router]);

    if (authLoading || !isAuthenticated || !isAdmin) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <Spinner /> <span className="ml-2">Loading Admin Portal...</span>
            </div>
        );
    }

    const lowStockItems = inventory.filter(item => item.stock < 50);
    const criticalItems = inventory.filter(item => item.stock <= 10);
    const healthyItems = inventory.filter(item => item.stock >= 50);

    const filteredInventory = inventory.filter(item =>
        item.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.drink_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedInventory = filteredInventory.reduce((acc, item) => {
        if (!acc[item.branch_name]) {
            acc[item.branch_name] = [];
        }
        acc[item.branch_name].push(item);
        return acc;
    }, {});

    const sortedBranches = Object.entries(groupedInventory).sort(([a], [b]) => {
        if (a === 'Headquarters') return -1;
        if (b === 'Headquarters') return 1;
        return a.localeCompare(b);
    });

    const getStockColor = (stock) => {
        if (stock <= 10) return 'text-red-500 bg-red-500';
        if (stock < 50) return 'text-yellow-500 bg-yellow-500';
        return 'text-green-500 bg-green-500';
    };

    const getStockStatus = (stock) => {
        if (stock <= 10) return 'Critical';
        if (stock < 50) return 'Low Stock';
        return 'Healthy';
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Admin Dashboard
                            </h1>
                            <p className={`mt-2 text-lg ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                                Overview of DrinkSync operations and inventory.
                            </p>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search branch or drink..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full md:w-80 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                                    isDark 
                                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                                    : 'bg-white border-slate-200 text-gray-900 placeholder-gray-400'
                                }`}
                            />
                        </div>
                    </div>
                </motion.div>
                
                {loading ? (
                     <div className="mt-10 flex justify-center">
                        <Spinner />
                     </div>
                ) : (
                    <div className="mt-8 space-y-8">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-xl bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400`}>
                                        <ExclamationTriangleIcon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Critical Items</p>
                                        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{criticalItems.length}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400`}>
                                        <ExclamationTriangleIcon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Low Stock</p>
                                        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{lowStockItems.length}</p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className={`p-6 rounded-2xl shadow-sm border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400`}>
                                        <CheckCircleIcon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Healthy Stock</p>
                                        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{healthyItems.length}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Inventory Grouped by Branch */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {sortedBranches.length > 0 ? (
                                sortedBranches.map(([branch, items], branchIdx) => (
                                    <motion.div
                                        key={branch}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, delay: 0.1 * branchIdx }}
                                        className={`rounded-2xl border overflow-hidden shadow-sm ${
                                            isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                                        }`}
                                    >
                                        <div className={`px-6 py-4 border-b flex items-center justify-between ${
                                            isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                                        }`}>
                                            <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                <BuildingStorefrontIcon className="h-5 w-5 text-blue-500" />
                                                {branch}
                                            </h3>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                                                isDark ? 'bg-slate-700 text-slate-300' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                                {items.length} Products
                                            </span>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {items.map((item, itemIdx) => {
                                                const stockPercentage = Math.min((item.stock / 1000) * 100, 100);
                                                const status = getStockStatus(item.stock);
                                                const colorClass = getStockColor(item.stock);
                                                
                                                return (
                                                    <div key={itemIdx} className="space-y-2">
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                                    {item.drink_name}
                                                                </p>
                                                                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                                                    Stock Level: <span className="font-mono">{item.stock}</span> units
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                                                                    status === 'Critical' ? 'bg-red-100 text-red-700' :
                                                                    status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                    {status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${stockPercentage}%` }}
                                                                transition={{ duration: 1, ease: "easeOut" }}
                                                                className={`h-full rounded-full ${colorClass.split(' ')[1]}`}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className={`col-span-full p-12 text-center rounded-2xl border-2 border-dashed ${
                                    isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-gray-400'
                                }`}>
                                    <ArchiveBoxIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-lg">No matching inventory items found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
