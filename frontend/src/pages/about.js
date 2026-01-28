import React from "react";
import { motion } from "framer-motion";
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';
import { 
  SparklesIcon, 
  CpuChipIcon, 
  UserGroupIcon, 
  GlobeAltIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
  LightBulbIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const About = () => {
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
    <div className={`relative min-h-screen overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] -left-[5%] w-[30%] h-[30%] bg-sky-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] -right-[5%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-20 px-4 text-center max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center px-4 py-2 rounded-full bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            Our Mission & Vision
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-5xl md:text-7xl font-black leading-tight tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Redefining <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-green-500">Fast Access.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-lg md:text-xl font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            DrinkSync isn't just an ordering platform. It's a synchronized ecosystem designed to bridge the gap between major beverage networks and your immediate needs.
          </motion.p>
        </section>

        {/* Pillars Section */}
        <section className="py-20 px-4 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <AboutCard 
              icon={<CpuChipIcon className="h-8 w-8 text-sky-500" />}
              title="Integrated Tech"
              desc="Our proprietary sync engine ensures every branch inventory is accurate to the second."
              isDark={isDark}
            />
            <AboutCard 
              icon={<UserGroupIcon className="h-8 w-8 text-teal-500" />}
              title="Community First"
              desc="Building stronger connections between local beverage branches and the customers they serve."
              isDark={isDark}
            />
            <AboutCard 
              icon={<GlobeAltIcon className="h-8 w-8 text-slate-500" />}
              title="Scalable Logistics"
              desc="A platform built to grow from local neighborhoods to nationwide synchronized distribution."
              isDark={isDark}
            />
          </div>
        </section>

        {/* Detailed Story Section */}
        <section className={`py-24 px-4 ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className={`text-4xl font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>The Synchronized Philosophy</h2>
              <p className={`text-lg font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                In a world that moves faster every day, legacy logistics can't keep up. DrinkSync was founded on the principle that inventory and demand should exist in a perfect, real-time loop.
              </p>
              
              <div className="space-y-4">
                {[
                  "Eliminating out-of-stock disappointments.",
                  "Zero-friction digital payment integration.",
                  "Localized branch filtering for speed.",
                  "Transparent transaction history for all users."
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckBadgeIcon className="h-6 w-6 text-teal-500 flex-shrink-0" />
                    <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-sky-500/40 cursor-pointer"
                >
                  Join the Evolution
                  <ArrowRightIcon className="h-4 w-4 stroke-[3px]" />
                </motion.div>
              </Link>
            </div>

            <div className="relative">
              <div className={`absolute inset-0 bg-sky-500/20 rounded-[3rem] blur-3xl`} />
              <div className={`relative p-8 rounded-[3rem] border-2 overflow-hidden ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100 shadow-xl'}`}>
                <div className="aspect-video bg-gradient-to-br from-sky-500 to-teal-500 rounded-2xl mb-8 flex items-center justify-center overflow-hidden">
                   <LightBulbIcon className="h-24 w-24 text-white/20 animate-pulse" />
                </div>
                <h3 className={`text-2xl font-black mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Driven by Innovation</h3>
                <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Our team of engineers and logistics experts work around the clock to ensure that DrinkSync remains the gold standard for beverage distribution in the digital age.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 px-4 border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <ArrowPathIcon className="h-6 w-6 text-sky-500" />
              <span className={`text-xl font-black tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>DRINKSYNC</span>
            </div>
            
            <div className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              &copy; {new Date().getFullYear()} Synchronized Logistics. All Rights Reserved.
            </div>

            <div className="flex gap-6">
              <Link href="/" className={`text-[10px] font-black uppercase tracking-widest hover:text-sky-500 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Home</Link>
              <Link href="/dashboard" className={`text-[10px] font-black uppercase tracking-widest hover:text-sky-500 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Dashboard</Link>
              <Link href="/login" className={`text-[10px] font-black uppercase tracking-widest hover:text-sky-500 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Login</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

function AboutCard({ icon, title, desc, isDark }) {
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

export default About;