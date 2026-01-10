import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowPathIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        { email, password }
      );

      login(response.data.token, response.data.user);

      if (response.data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen flex items-center justify-center px-4 overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full max-w-md p-10 rounded-[3rem] shadow-2xl border transition-all ${
          isDark ? 'bg-gray-800/50 border-white/5 backdrop-blur-2xl shadow-indigo-500/10' : 'bg-white border-gray-100 shadow-xl'
        }`}
      >
        <div className="text-center space-y-4 mb-10">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:rotate-180 transition-transform duration-700">
              <ArrowPathIcon className="h-5 w-5 text-white" />
            </div>
            <span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>
              DRINKSYNC
            </span>
          </Link>
          <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome Back
          </h2>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Please enter your details to sign in.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Email Address
            </label>
            <div className="relative group">
              <EnvelopeIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-2xl border-2 pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all ${
                  isDark 
                    ? 'bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10' 
                    : 'bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5'
                }`}
                placeholder="name@company.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Password
              </label>
              <Link href="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-400 transition-colors">
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <LockClosedIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-2xl border-2 pl-12 pr-12 py-4 text-sm font-bold outline-none transition-all ${
                  isDark 
                    ? 'bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10' 
                    : 'bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5'
                }`}
                placeholder="••••••••"
                required
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

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <ArrowPathIcon className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRightIcon className="h-4 w-4 stroke-[3px]" />
              </>
            )}
          </motion.button>
        </form>

        <p className={`text-center text-[10px] font-black uppercase tracking-[0.1em] mt-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          New to DrinkSync?{" "}
          <Link href="/register" className="text-indigo-500 hover:text-indigo-400 transition-colors ml-1">
            Create an Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}