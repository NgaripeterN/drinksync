import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import axios from "axios";
import { 
  UserIcon,
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { theme } = useTheme();

  const validate = () => {
    const newErrors = {};
    // Name validation
    if (!name.trim()) newErrors.name = "Full name is required.";

    // Email validation
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid.";
    }
    
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!passwordRegex.test(password)) {
      newErrors.password = "Password must be 10+ characters, with uppercase, lowercase, number, and special character.";
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setApiError(null);
    setSuccess(null);

    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
        { name, email, password, role: "customer" }
      );
      setSuccess("Registration successful! Redirecting to login...");
      router.push("/login?from=register");
    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setApiError(message);
      setErrors({ form: message }); // Display server error at form level
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen flex items-center justify-center px-4 overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full max-w-md p-10 my-10 rounded-[3rem] shadow-2xl border transition-all ${
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
            Join the Network
          </h2>
          <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Create your account to start ordering.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* General API Error Message */}
          {(apiError && !success) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border text-xs font-bold text-center bg-red-500/10 border-red-500/20 text-red-500`}
            >
              {apiError}
            </motion.div>
          )}
          {/* Success Message */}
          {success && (
             <motion.div 
             initial={{ opacity: 0, y: -10 }}
             animate={{ opacity: 1, y: 0 }}
             className={`p-4 rounded-xl border text-xs font-bold text-center bg-emerald-500/10 border-emerald-500/20 text-emerald-500`}
           >
             {success}
           </motion.div>
          )}

          {/* Form Fields */}
          <div className="space-y-2">
            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Full Name
            </label>
            <div className="relative group">
              <UserIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full rounded-2xl border-2 pl-12 pr-4 py-4 text-sm font-bold outline-none transition-all ${
                  isDark 
                    ? `bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 ${errors.name ? 'border-red-500/50' : ''}` 
                    : `bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 ${errors.name ? 'border-red-500/30' : ''}`
                }`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 font-bold ml-2 mt-1 flex items-center gap-1"><ExclamationCircleIcon className="h-4 w-4" />{errors.name}</p>}
          </div>

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
                    ? `bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 ${errors.email ? 'border-red-500/50' : ''}` 
                    : `bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 ${errors.email ? 'border-red-500/30' : ''}`
                }`}
                placeholder="name@company.com"
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-bold ml-2 mt-1 flex items-center gap-1"><ExclamationCircleIcon className="h-4 w-4" />{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Password
            </label>
            <div className="relative group">
              <LockClosedIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-2xl border-2 pl-12 pr-12 py-4 text-sm font-bold outline-none transition-all ${
                  isDark 
                    ? `bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 ${errors.password ? 'border-red-500/50' : ''}` 
                    : `bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 ${errors.password ? 'border-red-500/30' : ''}`
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
            {errors.password && <p className="text-xs text-red-500 font-bold ml-2 mt-1 flex items-center gap-1"><ExclamationCircleIcon className="h-4 w-4" />{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Confirm Password
            </label>
            <div className="relative group">
              <LockClosedIcon className={`absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-indigo-400' : 'text-gray-400 group-focus-within:text-indigo-500'}`} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-2xl border-2 pl-12 pr-12 py-4 text-sm font-bold outline-none transition-all ${
                  isDark 
                    ? `bg-gray-900/50 border-white/5 text-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 ${errors.confirmPassword ? 'border-red-500/50' : ''}` 
                    : `bg-gray-50 border-gray-50 text-gray-900 focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 ${errors.confirmPassword ? 'border-red-500/30' : ''}`
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
            {errors.confirmPassword && <p className="text-xs text-red-500 font-bold ml-2 mt-1 flex items-center gap-1"><ExclamationCircleIcon className="h-4 w-4" />{errors.confirmPassword}</p>}
          </div>

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
                Register Account
                <ArrowRightIcon className="h-4 w-4 stroke-[3px]" />
              </>
            )}
          </motion.button>
        </form>

        <p className={`text-center text-[10px] font-black uppercase tracking-[0.1em] mt-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-500 hover:text-indigo-400 transition-colors ml-1">
            Sign In Instead
          </Link>
        </p>
      </motion.div>
    </div>
  );
}