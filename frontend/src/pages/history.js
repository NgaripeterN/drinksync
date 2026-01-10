import React, { useState, useEffect, useCallback } from 'react';
import CustomerLayout from '../components/CustomerLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon, 
  ClockIcon, 
  ArchiveBoxIcon,
  ArrowPathIcon,
  NoSymbolIcon,
  PhoneIcon,
  ArrowPathRoundedSquareIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const History = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showCancelled, setShowCancelled] = useState(true);

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'paid', label: 'Paid' },
    { id: 'pending', label: 'Pending' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const fetchOrders = useCallback(async (targetPage, isAppend, status) => {
    try {
      if (isAppend) setLoadingMore(true);
      else setLoading(true);

      const token = localStorage.getItem('token');
      const statusFilter = status !== 'all' ? `&status=${status}` : '';
      const cacheBuster = `_t=${Date.now()}&_r=${Math.random().toString(36).substring(7)}`;
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/history?page=${targetPage}&limit=5${statusFilter}&${cacheBuster}`;
      
      const res = await axios.get(url, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      const incoming = res.data.orders || [];
      setOrders(prev => isAppend ? [...prev, ...incoming] : incoming);
      setHasMore(res.data.pagination?.hasNextPage || false);
      setPage(targetPage);
      setError(null);
    } catch (err) {
      setError("Unable to load history.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchOrders(1, false, activeTab);
    }
  }, [authLoading, isAuthenticated, activeTab, fetchOrders]);

  const handleRefresh = () => {
    fetchOrders(1, false, activeTab);
    toast.success("History Updated");
  };

  const handleLoadMore = () => fetchOrders(page + 1, true, activeTab);
  const onRetry = (id) => { setSelectedOrderId(id); setIsModalOpen(true); };
  const onCancel = (id) => { setSelectedOrderId(id); setIsCancelModalOpen(true); };

  const handleRetrySubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setActionLoading(selectedOrderId);
    setIsModalOpen(false);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/retry-payment`, 
        { orderId: selectedOrderId, phoneNumber }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("STK Push Sent!");
      setTimeout(() => fetchOrders(1, false, activeTab), 2000);
    } catch (err) { toast.error("Retry failed."); }
    finally { setActionLoading(null); setPhoneNumber(''); }
  };

  const handleCancelConfirm = async () => {
    setActionLoading(selectedOrderId);
    setIsCancelModalOpen(false);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/orders/cancel`, 
        { orderId: selectedOrderId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Order Cancelled.");
      fetchOrders(1, false, activeTab);
    } catch (err) { toast.error("Cancel failed."); }
    finally { setActionLoading(null); }
  };

  if (authLoading) return (
    <CustomerLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <ArrowPathIcon className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    </CustomerLayout>
  );

  return (
    <CustomerLayout>
      <div className="max-w-5xl mx-auto space-y-10 py-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
              <ClockIcon className="h-3 w-3 mr-1.5" />
              Activity Log
            </div>
            <h1 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Purchase History
            </h1>
          </div>
          <button 
            onClick={handleRefresh}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
              isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20' : 'bg-white text-indigo-600 hover:bg-gray-50 border border-gray-100 shadow-sm'
            }`}
          >
            <ArrowPathRoundedSquareIcon className="h-4 w-4" />
            Sync Records
          </button>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                  activeTab === t.id 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' 
                  : isDark 
                    ? 'bg-gray-800/50 text-gray-400 border border-white/5 hover:text-white' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'all' && (
            <button
              onClick={() => setShowCancelled(!showCancelled)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                !showCancelled
                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                : isDark 
                  ? 'bg-gray-800 border-indigo-500/50 text-indigo-400 hover:bg-gray-700 hover:border-indigo-400' 
                  : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 shadow-md shadow-indigo-500/5'
              }`}
            >
              {showCancelled ? (
                <><NoSymbolIcon className="h-4 w-4 stroke-[3px]" /> Hide Cancelled</>
              ) : (
                <><CheckBadgeIcon className="h-4 w-4 stroke-[3px]" /> Showing Only Active</>
              )}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <ArrowPathIcon className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Retrieving Secure Records</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {orders
                .filter(order => showCancelled || activeTab !== 'all' || order.payment_status !== 'cancelled')
                .map(order => (
                <motion.div 
                  key={order.id} 
                  layout
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`group rounded-[2.5rem] border-2 overflow-hidden transition-all hover:shadow-2xl ${
                    isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl hover:border-indigo-500/30' : 'bg-white border-gray-50 hover:border-indigo-500/20 shadow-sm'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-6 ${
                    isDark ? 'bg-white/[0.02]' : 'bg-gray-50/50'
                  }`}>
                    <div className="flex gap-5 items-center">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner ${
                        order.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 
                        order.payment_status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        <ShoppingBagIcon className="h-7 w-7" />
                      </div>
                      <div>
                        <h3 className={`font-black text-xl tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Order #{order.id}
                        </h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(order.order_date).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                        order.payment_status === 'paid' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 
                        order.payment_status === 'cancelled' ? 'bg-red-500/5 border-red-500/20 text-red-400' : 
                        'bg-amber-500/5 border-amber-500/20 text-amber-400'
                      }`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-8 space-y-6">
                    <div className="space-y-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center group/item">
                          <div className="flex gap-4 items-center">
                            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/10 shadow-sm">
                              <img src={item.image || '/images/coke.jpg'} className="h-full w-full object-cover" alt="" />
                            </div>
                            <div>
                              <p className={`font-black text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              KES {parseFloat(item.price_at_order).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Transaction Value</p>
                        <p className="text-3xl font-black text-indigo-500">
                          KES {parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      {order.mpesa_receipt_code && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                          isDark ? 'bg-white/5 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-100 text-gray-500'
                        }`}>
                          <CheckBadgeIcon className="h-4 w-4 text-emerald-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{order.mpesa_receipt_code}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Area */}
                  {order.payment_status === 'pending' && (
                    <div className={`px-8 py-6 flex flex-col sm:flex-row gap-4 border-t ${
                      isDark ? 'bg-indigo-500/5 border-white/5' : 'bg-indigo-50/30 border-gray-50'
                    }`}>
                      <button 
                        onClick={() => onCancel(order.id)} 
                        className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                          isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        Cancel Order
                      </button>
                      <button 
                        onClick={() => onRetry(order.id)} 
                        className="flex-1 py-4 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        Retry Payment
                        <ArrowRightIcon className="h-4 w-4 stroke-[3px]" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMore && (
              <div className="text-center pt-6 pb-12">
                <button 
                  onClick={handleLoadMore} 
                  disabled={loadingMore}
                  className="px-10 py-5 rounded-[2rem] border-2 border-indigo-500/20 text-indigo-500 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-indigo-500 hover:text-white hover:shadow-2xl hover:shadow-indigo-500/40 transition-all disabled:opacity-50"
                >
                  {loadingMore ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin inline mr-2" />
                  ) : null}
                  {loadingMore ? 'Syncing...' : 'Load Older Records'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`py-32 text-center border-2 border-dashed rounded-[3rem] ${
              isDark ? 'border-gray-700 bg-gray-800/20' : 'border-gray-200 bg-gray-50/50'
            }`}
          >
            <div className="h-20 w-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <ArchiveBoxIcon className="h-10 w-10 text-indigo-500/50" />
            </div>
            <h3 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              No {activeTab !== 'all' ? activeTab : ''} Records Found
            </h3>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">
              Your transaction history is currently empty for this filter.
            </p>
          </motion.div>
        )}
      </div>

      {/* Retry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className={`relative w-full max-w-md p-8 rounded-[3rem] shadow-2xl border transition-all ${
                isDark ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-500/10 rounded-[1.5rem]">
                  <PhoneIcon className="h-6 w-6 text-indigo-500" />
                </div>
                <div>
                  <h3 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Retry Payment</h3>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Order #{selectedOrderId}</p>
                </div>
              </div>
              
              <form onSubmit={handleRetrySubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    M-Pesa Mobile Number
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm tracking-tighter">+254</span>
                    <input 
                      type="tel" 
                      required
                      autoFocus
                      placeholder="712345678" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g,'').slice(0,9))}
                      className={`w-full pl-16 pr-4 py-4 rounded-2xl border-2 font-black outline-none transition-all ${
                        isDark 
                          ? 'bg-gray-900 border-white/5 text-white focus:border-indigo-500/50' 
                          : 'bg-gray-50 border-gray-100 text-gray-900 focus:border-indigo-500/20'
                      }`}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Send STK Push
                  <ChevronRightIcon className="h-4 w-4 stroke-[3px]" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {isCancelModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCancelModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className={`relative w-full max-w-md p-10 rounded-[3.5rem] shadow-2xl text-center border transition-all ${
                isDark ? 'bg-gray-800 border-white/5' : 'bg-white border-gray-100'
              }`}
            >
              <div className="h-24 w-24 bg-red-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <NoSymbolIcon className="h-12 w-12 text-red-500" />
              </div>
              <h3 className={`text-3xl font-black tracking-tight mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Cancel Order?</h3>
              <p className="text-gray-500 text-sm mb-10 font-bold uppercase tracking-widest opacity-70">Inventory items will be restored.</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsCancelModalOpen(false)} 
                  className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${
                    isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Go Back
                </button>
                <button 
                  onClick={handleCancelConfirm} 
                  className="flex-1 py-4 rounded-2xl bg-red-600 text-white font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-red-500/40 hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CustomerLayout>
  );
};

export default History;
