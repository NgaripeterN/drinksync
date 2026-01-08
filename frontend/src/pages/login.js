import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import axios from "axios";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const { theme } = useTheme();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        { email, password }
      );

      login(response.data.token, response.data.user.role, response.data.user.name);

      if (response.data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
          Welcome back
        </h2>
        <p className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Sign in to access your DrinkSync account
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <div className="relative">
              <FaEnvelope className={`absolute top-1/2 left-3 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 transition ${isDark ? 'bg-gray-800/70 border-gray-700 text-gray-200 focus:ring-emerald-400' : 'bg-gray-200/70 border-gray-300 text-gray-800 focus:ring-emerald-500'}`}
                required
              />
            </div>
          </div>

          <div className="relative">
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
            <div className="relative">
              <FaLock className={`absolute top-1/2 left-3 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full rounded-lg border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 transition ${isDark ? 'bg-gray-800/70 border-gray-700 text-gray-200 focus:ring-emerald-400' : 'bg-gray-200/70 border-gray-300 text-gray-800 focus:ring-emerald-500'}`}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Sign In
          </motion.button>
        </form>

        <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Don’t have an account?{" "}
          <button onClick={() => router.push('/register')} className={`${isDark ? 'text-emerald-300 hover:text-emerald-400' : 'text-emerald-500 hover:text-emerald-600'}`}>
            Create one
          </button>
        </p>
      </motion.div>
    </div>
  );
}
