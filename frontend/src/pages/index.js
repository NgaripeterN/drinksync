import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-gray-900">

      {/* Main content area */}
      <div className="relative flex-1 flex items-center justify-center">

        {/* Background image with blur */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero-background.png')",
            filter: "blur(2px)", // blur only the background
          }}
        />

        {/* Gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/30" />

        {/* Centered card */}
        <div className="relative z-10 
                        bg-white/20 backdrop-blur-md border border-white/20 
                        rounded-2xl p-6 md:p-10 max-w-3xl text-center shadow-2xl
                        max-h-[calc(100vh-80px)] overflow-auto">

          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-5 text-gray-100"
          >
            DrinkSync
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-sm md:text-xl text-gray-200 mb-6 md:mb-8 leading-relaxed"
          >
            Your go-to place for refreshing drinks. Order from any branch, pay securely, and enjoy fast service wherever you are.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex gap-4 flex-wrap justify-center"
          >
            <Link
              href="/dashboard"
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow"
            >
              Start Ordering
            </Link>

            <Link
              href="/about"
              className="px-5 py-3 rounded-xl border border-gray-700 bg-gray-50 hover:bg-white text-gray-800 font-semibold shadow"
            >
              Learn More
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Footer always visible */}
      <footer className="w-full bg-gray-900/95 backdrop-blur text-gray-300 text-center p-4 h-16 flex items-center justify-center">
        <p>&copy; {new Date().getFullYear()} DrinkSync. All rights reserved.</p>
      </footer>
    </div>
  );
}