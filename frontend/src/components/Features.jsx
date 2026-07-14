import React from 'react';
import { motion } from 'framer-motion';
import { FiSliders, FiTrendingUp, FiCpu, FiUnlock, FiLayers, FiDownload } from 'react-icons/fi';

const features = [
  {
    icon: <FiLayers className="text-3xl text-luxury-purple-light" />,
    title: "Three Exquisite Themes",
    description: "Receive three distinct, designer-grade templates in a single click: Luxury Purple, Royal Blue, and Black Gold."
  },
  {
    icon: <FiCpu className="text-3xl text-purple-400" />,
    title: "Smart Photo Framing",
    description: "Our image engine crops the uploaded photo to fit beautifully inside glowing frames and glassmorphic panels."
  },
  {
    icon: <FiSliders className="text-3xl text-luxury-gold" />,
    title: "Premium Aesthetics",
    description: "Includes birthday cake line-art, floating metallic balloons, vector sparkles, confetti, and gold foil borders."
  },
  {
    icon: <FiTrendingUp className="text-3xl text-blue-400" />,
    title: "Instagram Ready",
    description: "Rendered at a high-resolution 1080x1350 layout, perfect for social feeds, messaging apps, or printing."
  },
  {
    icon: <FiDownload className="text-3xl text-cyan-400" />,
    title: "Lossless Exports",
    description: "Export your generated designs instantly as high-quality PNG or JPG files directly to your device."
  },
  {
    icon: <FiUnlock className="text-3xl text-yellow-400" />,
    title: "Zero Limits, No Login",
    description: "We believe in pure accessibility. No accounts, no subscriptions, and absolutely no watermarks."
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-luxury-blue/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold tracking-widest text-luxury-purple-light uppercase mb-3">PRODUCT FEATURES</h2>
          <p className="text-3xl sm:text-5xl font-black tracking-tight">
            Designed to Make Them Feel <span className="bg-clip-text text-transparent bg-gradient-to-r from-luxury-purple-light to-pink-400">Special</span>
          </p>
          <div className="h-1.5 w-24 bg-gradient-to-r from-luxury-purple-light to-pink-400 mx-auto mt-4 rounded-full" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="glass-panel p-8 rounded-2xl glass-panel-hover flex flex-col items-start text-left"
            >
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 shadow-inner">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-100">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
