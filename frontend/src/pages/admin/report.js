import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ArrowPathIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  RectangleGroupIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function SalesReport() {
  const router = useRouter();
  const { isAuthenticated, loading, isAdmin } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [isFetching, setIsFetching] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, isAdmin]);

  const fetchData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [reportRes, branchesRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/report?branch_id=${selectedBranch}`, { headers }),
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/dashboard`, { headers })
      ]);

      setReportData(reportRes.data);
      setBranches(branchesRes.data.branches);
    } catch (err) {
      toast.error('Failed to retrieve report data.');
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchData();
    }
  }, [selectedBranch, isAuthenticated, isAdmin]);

  const exportToCSV = () => {
    if (!reportData) return;

    const branchName = selectedBranch === 'all' 
      ? 'Global Network' 
      : branches.find(b => b.id.toString() === selectedBranch.toString())?.name || 'Selected Branch';

    const headers = ["Brand", "Units Sold", "Revenue (KES)", "Contribution (%)"];
    const rows = reportData.salesPerDrink.map(item => [
      item.drink_name,
      item.total_units_sold,
      parseFloat(item.total_revenue).toFixed(2),
      ((parseFloat(item.total_revenue) / parseFloat(reportData.grandTotalRevenue)) * 100).toFixed(1) + "%"
    ]);

    // Add Metadata and Grand Total rows
    const csvRows = [
      ["DRINKSYNC SALES REPORT"],
      [`Scope: ${branchName}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [], // Spacer
      headers,
      ...rows,
      [], // Spacer
      ["GRAND TOTAL", "", parseFloat(reportData.grandTotalRevenue).toFixed(2), "100%"]
    ];

    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    const fileName = `DrinkSync_Report_${branchName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !reportData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-10 py-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1.5" />
              Performance Analytics
            </div>
            <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Executive Sales Report
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={exportToCSV}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                isDark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100 shadow-sm'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export CSV
            </button>

            <div className="relative group min-w-[240px]">
            <BuildingStorefrontIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className={`w-full rounded-2xl border-2 pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer ${
                isDark 
                  ? 'bg-gray-800/50 border-white/5 text-white focus:border-indigo-500/50' 
                  : 'bg-white border-gray-100 text-gray-900 shadow-sm focus:border-indigo-500/20'
              }`}
            >
              <option value="all">Global Network (All)</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Revenue" 
            value={`KES ${parseFloat(reportData.grandTotalRevenue).toLocaleString()}`} 
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
            color="text-emerald-500"
            isDark={isDark}
          />
          <StatCard 
            label="Total Units Sold" 
            value={reportData.salesPerDrink.reduce((acc, curr) => acc + parseInt(curr.total_units_sold), 0)} 
            icon={<ShoppingBagIcon className="h-6 w-6" />}
            color="text-indigo-500"
            isDark={isDark}
          />
          <StatCard 
            label="Active Branches" 
            value={branches.length} 
            icon={<BuildingStorefrontIcon className="h-6 w-6" />}
            color="text-amber-500"
            isDark={isDark}
          />
        </div>

        {/* Brand Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Revenue by Brand */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-8 md:p-10 rounded-[3rem] border-2 shadow-2xl ${
              isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl' : 'bg-white border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <RectangleGroupIcon className="h-6 w-6 text-indigo-500" />
              </div>
              <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Revenue per Brand</h2>
            </div>

            <div className="space-y-8">
              {reportData.salesPerDrink.map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className={`font-black uppercase text-[10px] tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.drink_name}</span>
                    <span className={`font-black text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>KES {parseFloat(item.total_revenue).toLocaleString()}</span>
                  </div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(parseFloat(item.total_revenue) / parseFloat(reportData.grandTotalRevenue)) * 100}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Unit Breakdown Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`overflow-hidden rounded-[3rem] border-2 shadow-2xl ${
              isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl' : 'bg-white border-gray-100'
            }`}
          >
            <div className={`px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center gap-3 ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50/50'}`}>
              <ChartBarIcon className="h-6 w-6 text-indigo-500" />
              <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Unit Distribution</h2>
            </div>
            <div className="p-8">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-left border-b border-gray-100 dark:border-white/5">
                    <th className="pb-4">Product</th>
                    <th className="pb-4 text-center">Units Sold</th>
                    <th className="pb-4 text-right">Contribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {reportData.salesPerDrink.map((item, i) => (
                    <tr key={i} className="group">
                      <td className={`py-5 font-black text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.drink_name}</td>
                      <td className={`py-5 text-center font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.total_units_sold}</td>
                      <td className="py-5 text-right font-black text-xs text-indigo-500">
                        {((parseFloat(item.total_revenue) / parseFloat(reportData.grandTotalRevenue)) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, icon, color, isDark }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-8 rounded-[2.5rem] border-2 shadow-xl flex items-center gap-6 transition-all ${
        isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl' : 'bg-white border-gray-100'
      }`}
    >
      <div className={`p-4 rounded-2xl bg-gray-500/10 ${color}`}>
        {icon}
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        <p className={`text-2xl font-black tracking-tight mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      </div>
    </motion.div>
  );
}
