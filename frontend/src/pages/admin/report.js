import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ChartPieIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';

export default function AdminReport() {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const router = useRouter();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [salesReport, setSalesReport] = useState([]);
    const [grandTotalRevenue, setGrandTotalRevenue] = useState(0);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!loading && (!isAuthenticated || !isAdmin)) {
            router.push('/login'); // Redirect non-admin users
        }

        const fetchSalesReport = async () => {
            if (!isAuthenticated || !isAdmin) return;
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/report`, { headers });
                setSalesReport(response.data.salesPerDrink);
                setGrandTotalRevenue(parseFloat(response.data.grandTotalRevenue));
            } catch (err) {
                console.error("Error fetching sales report:", err.response?.data || err.message);
                setError(err.response?.data?.message || "Failed to fetch sales report.");
            }
        };
        fetchSalesReport();
    }, [isAuthenticated, isAdmin, loading, router]);

    if (loading || !isAuthenticated || !isAdmin) {
        return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>Loading...</div>;
    }

    return (
        <AdminLayout>
            {error && <div className="bg-red-500 p-3 rounded-md mb-4">{error}</div>}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`p-8 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            >
                <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
                    <ChartPieIcon className="h-7 w-7" />
                    <span>Sales Report</span>
                </h2>
                {salesReport.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                                <tr>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Drink
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Units Sold
                                    </th>
                                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                        Revenue (KES)
                                    </th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
                                {salesReport.map((report, index) => (
                                    <tr key={index} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {report.drink_name}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {report.total_units_sold}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                            {parseFloat(report.total_revenue).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                <tr className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} font-bold`}>
                                    <td className={`px-6 py-4 whitespace-nowrap text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>Grand Total</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-base ${isDark ? 'text-white' : 'text-gray-900'}`}></td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {grandTotalRevenue.toFixed(2)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No sales data available yet.</p>
                )}
            </motion.div>
        </AdminLayout>
    );
}
