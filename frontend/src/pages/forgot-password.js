import { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";
import { useTheme } from '../context/ThemeContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const router = useRouter();
  const { theme } = useTheme();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // TODO: Implement actual password reset logic
    setSuccess("If an account with that email exists, a password reset link has been sent.");
    setTimeout(() => router.push("/login"), 3000);
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
          Forgot Password
        </h2>
        <p className={`text-center mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Enter your email to reset your password
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-5">
          <div className="relative">
            <label className={`block text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <div className="relative">
              <FaEnvelope className={`absolute top-1/2 left-3 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full rounded-lg border pl-10 pr-3 py-2 focus:outline-none focus:ring-2 transition ${isDark ? 'bg-gray-800/70 border-gray-700 text-gray-200 focus:ring-sky-400' : 'bg-gray-200/70 border-gray-300 text-gray-800 focus:ring-sky-500'}`}
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 rounded-lg transition"
          >
            Send Reset Link
          </motion.button>
        </form>

        <p className={`text-center text-sm mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Remember your password?{" "}
          <button onClick={() => router.push('/login')} className={`${isDark ? 'text-sky-300 hover:text-sky-400' : 'text-sky-500 hover:text-sky-600'}`}>
            Log in
          </button>
        </p>
      </motion.div>
    </div>
  );
}