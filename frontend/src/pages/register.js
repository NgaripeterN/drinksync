import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useTheme } from '../context/ThemeContext';

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const router = useRouter();
    const { theme } = useTheme();
  
    const handleRegister = async (e) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);
  
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
  
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/register`,
          { name, email, password, role: "customer" }
        );
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      } catch (err) {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    };
  
    const isDark = theme === 'dark';
  
    return (
      <div className={`min-h-screen flex items-center justify-center px-4 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gray-100'}`}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-full max-w-md rounded-2xl p-8 shadow-xl ${isDark ? 'bg-white/5 border border-white/10 backdrop-blur-xl' : 'bg-white border'}`}
        >
          <h2 className={`text-3xl font-extrabold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create an account
          </h2>
          <p className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Join DrinkSync in just a few steps
          </p>
  
          <form onSubmit={handleRegister} className="space-y-5">
            <div className="relative">
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
              <div className="relative">
                <FaUser className={`absolute top-1/2 left-3 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 transition ${isDark ? 'bg-gray-800/70 border-gray-700 text-gray-200 focus:ring-indigo-400' : 'bg-gray-200/70 border-gray-300 text-gray-800 focus:ring-indigo-500'}`}
                  required
                />
              </div>
            </div>
            
            <div className="relative">
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
              <div className="relative">
                <FaEnvelope className={`absolute top-1/2 left-3 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-lg border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 transition ${isDark ? 'bg-gray-800/70 border-gray-700 text-gray-200 focus:ring-indigo-400' : 'bg-gray-200/70 border-gray-300 text-gray-800 focus:ring-indigo-500'}`}
                  required
                />
              </div>
            </div>
  
            <div className="relative">
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
              <div className="relative">
                <FaLock className={`absolute top-1/2 left-3 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-lg border pl-10 pr-10 py-2 focus:outline-none focus:ring-2 transition ${isDark ? 'bg-gray-800/70 border-gray-700 text-gray-200 focus:ring-indigo-400' : 'bg-gray-200/70 border-gray-300 text-gray-800 focus:ring-indigo-500'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
  
            <div className="relative">
              <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
              <div className="relative">
                <FaLock className={`absolute top-1/2 left-3 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full rounded-lg border pl-10 pr-10 py-2 focus:outline-none focus:ring-2 transition ${isDark ? 'bg-gray-800/70 border-gray-700 text-gray-200 focus:ring-indigo-400' : 'bg-gray-200/70 border-gray-300 text-gray-800 focus:ring-indigo-500'}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
  
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
  
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Register
            </motion.button>
          </form>
  
          <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Already have an account?{" "}
            <button onClick={() => router.push('/login')} className={`${isDark ? 'text-indigo-300 hover:text-indigo-400' : 'text-indigo-500 hover:text-indigo-600'}`}>
              Log in
            </button>
          </p>
        </motion.div>
      </div>
    );
  }
  