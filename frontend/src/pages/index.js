import { motion } from "framer-motion";
import Link from "next/link";
import { useTheme } from "../context/ThemeContext";
import { 
  ArrowRightIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  MapPinIcon,
  SparklesIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`relative min-h-screen overflow-x-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 px-4">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-teal-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase tracking-[0.3em]">
              <SparklesIcon className="h-4 w-4 mr-2" />
              Revolutionizing Beverage Logistics
            </div>
            
            <h1 className={`text-5xl md:text-7xl font-black leading-[1.1] tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Refreshment, <br/>
              <span className="text-green-500">Synchronized.</span>
            </h1>
            
            <p className={`text-lg md:text-xl font-medium max-w-lg leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Experience the fastest way to stock your favorites. Integrated branch networks, real-time inventory, and secure digital payments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dashboard">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-teal-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-teal-500/40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Start Ordering Now
                  <ArrowRightIcon className="h-4 w-4 stroke-[3px]" />
                </motion.div>
              </Link>
              <Link href="/about">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    isDark ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-100 text-gray-900 hover:bg-gray-50 shadow-sm'
                  }`}
                >
                  Our Network
                </motion.div>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>5+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Major Branches</p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
              <div>
                <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>24/7</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Stock Syncing</p>
              </div>
              <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
              <div>
                <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure Pay</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative block mt-12 lg:mt-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-tr from-sky-500/20 to-teal-500/20 rounded-[3rem] blur-3xl`} />
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-gray-100 dark:border-gray-800 transform rotate-3 hover:rotate-0 transition-transform duration-700">
              <img src="/images/hero-background.png" alt="Hero" className="w-full h-auto object-cover" />
            </div>
            
            {/* Floating UI Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className={`absolute -top-4 -right-4 lg:-top-8 lg:-right-8 p-4 lg:p-6 rounded-3xl shadow-2xl border max-w-[160px] lg:max-w-[200px] ${
                isDark ? 'bg-gray-800 border-gray-700 shadow-sky-500/10' : 'bg-white border-gray-100 shadow-xl'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-500/10 rounded-lg">
                  <CreditCardIcon className="h-5 w-5 text-teal-500" />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}>Payment</span>
              </div>
              <p className={`text-sm font-bold opacity-70 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Transaction Verified via M-Pesa</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-24 px-4 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className={`text-3xl md:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Why Choose DrinkSync?</h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto">We've built a system focused on speed, transparency, and ease of access.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ClockIcon className="h-8 w-8 text-sky-500" />}
              title="Real-Time Sync"
              desc="Stock levels are synchronized instantly across all branches and HQ."
              isDark={isDark}
            />
            <FeatureCard 
              icon={<ShieldCheckIcon className="h-8 w-8 text-teal-500" />}
              title="Secure Checkout"
              desc="Integrated directly with M-Pesa STK push for reliable transactions."
              isDark={isDark}
            />
            <FeatureCard 
              icon={<MapPinIcon className="h-8 w-8 text-slate-500" />}
              title="Local Access"
              desc="Filter and order from the specific branch nearest to your location."
              isDark={isDark}
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
             <div className="grid grid-cols-2 gap-4">
                <img src="/images/coke.jpg" className="rounded-3xl shadow-lg transform -rotate-2" alt="Product" />
                <img src="/images/sprite.jpg" className="rounded-3xl shadow-lg mt-8 transform rotate-2" alt="Product" />
             </div>
          </div>
          
          <div className="order-1 lg:order-2 space-y-8">
            <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Simplified Ordering Process</h2>
            
            <div className="space-y-6">
              <Step number="01" title="Select Branch" desc="Choose your location to view live local inventory." isDark={isDark} />
              <Step number="02" title="Pick Beverages" desc="Add your favorite brands to your digital cart." isDark={isDark} />
              <Step number="03" title="Fast Payment" desc="Authorize the M-Pesa prompt on your mobile device." isDark={isDark} />
              <Step number="04" title="Instant History" desc="Track your receipts and status in your dashboard." isDark={isDark} />
            </div>

            <Link href="/dashboard">
              <motion.div 
                whileHover={{ x: 10 }}
                className="inline-flex items-center gap-2 text-sky-500 font-black uppercase text-xs tracking-[0.2em] cursor-pointer"
              >
                Launch Dashboard
                <ArrowRightIcon className="h-4 w-4 stroke-[3px]" />
              </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-24 pt-12">
        <div className={`max-w-7xl mx-auto rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden bg-teal-600 shadow-2xl shadow-teal-500/40`}>
          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">Ready to quench <br/>your thirst?</h2>
            <Link href="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block px-12 py-5 bg-white text-teal-600 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-xl cursor-pointer"
              >
                Join DrinkSync Today
              </motion.div>
            </Link>
          </div>
          
          {/* Background circles */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-teal-400/20 rounded-full" />
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 px-4 border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-600 rounded-lg">
              <ArrowPathIcon className="h-6 w-6 text-white" />
            </div>
            <span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>DRINKSYNC</span>
          </div>
          
          <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            &copy; {new Date().getFullYear()} Synchronized Logistics. All Rights Reserved.
          </div>

          <div className="flex gap-6">
            <Link href="/about" className={`text-[10px] font-black uppercase tracking-widest hover:text-sky-500 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>About</Link>
            <Link href="/dashboard" className={`text-[10px] font-black uppercase tracking-widest hover:text-sky-500 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Dashboard</Link>
            <Link href="/login" className={`text-[10px] font-black uppercase tracking-widest hover:text-sky-500 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, isDark }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`p-10 rounded-[2.5rem] border-2 transition-all ${
        isDark ? 'bg-gray-800 border-gray-700/50 hover:border-sky-500/50 shadow-sky-500/5' : 'bg-white border-gray-100 hover:border-sky-500/20 shadow-sm shadow-sky-500/5'
      }`}
    >
      <div className="p-4 bg-sky-500/10 rounded-2xl inline-block mb-6">
        {icon}
      </div>
      <h3 className={`text-xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <p className={`text-sm leading-relaxed font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
    </motion.div>
  );
}

function Step({ number, title, desc, isDark }) {
  return (
    <div className="flex gap-6">
      <span className="text-4xl font-black text-sky-500/20 tracking-tighter leading-none">{number}</span>
      <div>
        <h4 className={`text-lg font-black tracking-tight mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
        <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
      </div>
    </div>
  );
}