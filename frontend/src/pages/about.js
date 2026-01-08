import React from "react";
import { motion } from "framer-motion";
import { useTheme } from '../context/ThemeContext';

const About = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`relative min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {isDark && (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-gray-900 to-gray-950 pointer-events-none" />
      )}

      <div className="container mx-auto px-6 pt-32 pb-20 relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-extrabold mb-6"
        >
          About{" "}
          <span className={`bg-clip-text text-transparent ${isDark ? 'bg-gradient-to-r from-emerald-300 to-cyan-300' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`}>
            DrinkSync
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
        >
          DrinkSync is a smart platform that connects customers with branches across
          the supermarket network — allowing fast ordering, secure payments, and
          real-time inventory updates. Our goal is simple: make refreshing drinks
          accessible anywhere, anytime.
        </motion.p>

        {/* Feature cards */}
        <div className="mt-14 grid gap-6 md:gap-8 md:grid-cols-3">
          {[
            {
              title: "Seamless Ordering",
              text: "Place orders instantly and pick your preferred branch without hassle."
            },
            {
              title: "Secure Payments",
              text: "Integrated with Mpesa Sandbox for smooth and verified transactions."
            },
            {
              title: "Real-Time Insights",
              text: "Stay informed with live dashboards showing sales trends, branch performance, and inventory levels."
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.1 }}
              className={`p-6 rounded-2xl shadow-lg transition ${isDark ? 'bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/30' : 'bg-white border'}`}
            >
              <h3 className={`text-xl font-semibold mb-3 ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
                {item.title}
              </h3>
              <p className={`text-sm md:text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Closing line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`mt-14 text-sm md:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
        >
          Designed to be intuitive, reliable, and friendly.
        </motion.div>
      </div>
    </div>
  );
};

export default About;
