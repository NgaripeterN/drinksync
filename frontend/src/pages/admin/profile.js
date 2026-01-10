import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

const AdminProfilePage = () => {
    const { user, token, setUser, setToken } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({ ...prev, name: user.name, email: user.email }));
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const { name, email, password, confirmPassword } = formData;

        if (password && password !== confirmPassword) {
            toast.error("Passwords do not match.");
            setLoading(false);
            return;
        }

        const updateData = { name, email };
        if (password) {
            updateData.password = password;
        }

        try {
            const res = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/profile/update`, updateData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const { user: updatedUser, token: updatedToken } = res.data;

            localStorage.setItem('token', updatedToken);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setToken(updatedToken);

            toast.success('Admin profile updated successfully!');
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
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
            <div className="max-w-4xl mx-auto space-y-8 py-4">
                {/* Header Area */}
                <div className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 border-2 border-indigo-500/10 bg-gradient-to-br from-indigo-600 to-indigo-700 shadow-2xl shadow-indigo-500/20 text-white">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="h-32 w-32 rounded-[2rem] bg-white/10 backdrop-blur-xl border-4 border-white/20 flex items-center justify-center shadow-inner group">
                            <ShieldCheckIcon className="h-16 w-16 text-white/80 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-4xl font-black tracking-tight">{user.name}</h1>
                            <p className="text-indigo-100 font-medium opacity-80">{user.email}</p>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-400/30">
                                System Administrator
                            </div>
                        </div>
                    </div>
                    {/* Abstract circles */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-48 h-48 bg-indigo-400/20 rounded-full" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className={`p-8 rounded-[2rem] border-2 transition-all ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100 shadow-sm'}`}>
                            <div className="flex items-center gap-2 mb-4">
                                <KeyIcon className="h-5 w-5 text-indigo-500" />
                                <h3 className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Auth Settings</h3>
                            </div>
                            <p className={`text-sm font-medium leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Administrators have elevated privileges. Ensure you use a strong password and keep your credentials private.
                            </p>
                            <div className="space-y-3 text-[10px] font-black uppercase tracking-widest">
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    Root Access
                                </div>
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <ShieldCheckIcon className="h-4 w-4" />
                                    Encrypted Core
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Form */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`lg:col-span-2 p-8 md:p-10 rounded-[2.5rem] border-2 transition-all ${isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-xl' : 'bg-white border-gray-100 shadow-xl'}`}
                    >
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Admin Name</label>
                                    <div className="relative group">
                                        <UserIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full rounded-2xl border-2 pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all ${
                                                isDark 
                                                    ? 'bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50' 
                                                    : 'bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20'
                                            }`}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</label>
                                    <div className="relative group">
                                        <EnvelopeIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`w-full rounded-2xl border-2 pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all ${
                                                isDark 
                                                    ? 'bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50' 
                                                    : 'bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20'
                                            }`}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent my-2" />

                            <div className="space-y-6">
                                <div className="space-y-2 text-center md:text-left">
                                    <h4 className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}>Update Admin Password</h4>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Requires immediate re-authentication</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>New Password</label>
                                        <div className="relative group">
                                            <LockClosedIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className={`w-full rounded-2xl border-2 pl-12 pr-12 py-4 text-sm font-bold outline-none transition-all ${
                                                    isDark 
                                                        ? 'bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50' 
                                                        : 'bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-indigo-500 transition-colors"
                                            >
                                                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Confirm Password</label>
                                        <div className="relative group">
                                            <LockClosedIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className={`w-full rounded-2xl border-2 pl-12 pr-12 py-4 text-sm font-bold outline-none transition-all ${
                                                    isDark 
                                                        ? 'bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50' 
                                                        : 'bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20'
                                                }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 hover:text-indigo-500 transition-colors"
                                            >
                                                {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                    'Update Admin Account'
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminProfilePage;