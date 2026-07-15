import React from 'react';
import { motion } from 'framer-motion';
import { FiGift, FiZap } from 'react-icons/fi';

export default function Hero({ onStartClick }) {
  // Floating particle coordinates for background decoration
  const particles = [
    { size: 'w-24 h-24', color: 'bg-purple-500/10', position: 'top-10 left-[15%]', delay: 0 },
    { size: 'w-32 h-32', color: 'bg-blue-500/10', position: 'bottom-20 right-[15%]', delay: 2 },
    { size: 'w-16 h-16', color: 'bg-yellow-500/5', position: 'top-40 right-[30%]', delay: 1 },
  ];

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Animated Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-luxury-purple/20 rounded-full blur-[100px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-luxury-blue/20 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />

      {/* Floating Particles */}
      {particles.map((p, idx) => (
        <motion.div
          key={idx}
          className={`absolute ${p.size} ${p.color} rounded-full blur-xl pointer-events-none`}
          style={{ top: p.position.includes('top') ? p.position.split(' ')[0].replace('top-', '') + '%' : 'auto', left: p.position.includes('left') ? p.position.split(' ')[1].replace('left-[', '').replace(']', '') : 'auto' }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 6 + idx * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}

      <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-luxury-purple-dark/40 border border-luxury-purple/30 backdrop-blur-md mb-8"
        >
          <FiGift className="text-luxury-purple-light animate-bounce" />
          <span className="text-xs font-semibold tracking-wider text-purple-200 uppercase">
            100% Free • No Sign-up Required
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight sm:leading-none"
        >
          Make Birthdays Magical With{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-luxury-purple-light via-pink-400 to-luxury-gold-light glow-purple">
            SmartWish AI
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed"
        >
          Generate three stunning, high-resolution birthday posters featuring your friend, classmate, or colleague. Inspired by luxury themes, complete with professional typography, gold sparkles, and balloons.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <button
            onClick={onStartClick}
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold btn-primary text-lg flex items-center justify-center gap-3 group"
          >
            <FiZap className="text-xl group-hover:scale-125 transition-transform" />
            Generate Posters Now
          </button>
          
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold btn-secondary text-lg flex items-center justify-center"
          >
            See How it Works
          </a>
        </motion.div>

        {/* Mini Preview Deck */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="relative max-w-4xl mx-auto flex items-center justify-center mt-8"
        >
          {/* Card Deck Mockup */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-slate-950 via-transparent to-transparent z-10 h-full w-full pointer-events-none" />
          
          <div className="flex gap-4 sm:gap-6 justify-center items-center w-full px-4 overflow-hidden py-10">
            {/* Poster 1 Mock */}
            <div className="w-[180px] sm:w-[250px] aspect-[4/5] rounded-xl bg-gradient-to-br from-luxury-purple-dark to-black border border-purple-500/20 shadow-2xl rotate-[-6deg] transform -translate-x-4 sm:-translate-x-8 opacity-75 hidden sm:block relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/5 backdrop-blur-sm" />
              <div className="absolute top-4 left-4 font-serif text-xxs text-luxury-gold opacity-50">LUXURY PURPLE</div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-yellow-500/30 bg-purple-500/10" />
            </div>

            {/* Poster 3 Mock (Center - Black Gold) */}
            <div className="w-[220px] sm:w-[300px] aspect-[4/5] rounded-2xl bg-gradient-to-b from-[#181818] to-black border border-luxury-gold-dark/40 shadow-2xl relative z-20 scale-105 overflow-hidden ring-4 ring-luxury-gold/20">
              <div className="absolute top-6 left-6 font-serif text-xs text-luxury-gold-light tracking-widest font-bold">BLACK GOLD</div>
              <div className="absolute inset-x-4 top-20 bottom-16 rounded-xl border border-luxury-gold-dark/20 flex flex-col items-center justify-center bg-black/40">
                <div className="w-24 h-32 rounded-lg border border-luxury-gold/30 bg-yellow-500/5 mb-3 flex items-center justify-center">
                  <FiGift className="text-3xl text-luxury-gold-light" />
                </div>
                <div className="w-2/3 h-3 bg-luxury-gold/30 rounded" />
              </div>
              <div className="absolute bottom-4 left-6 right-6 h-6 rounded bg-luxury-gold/10 border border-luxury-gold-dark/30" />
            </div>

            {/* Poster 2 Mock */}
            <div className="w-[180px] sm:w-[250px] aspect-[4/5] rounded-xl bg-gradient-to-bl from-luxury-blue-dark to-black border border-blue-500/20 shadow-2xl rotate-[6deg] transform translate-x-4 sm:translate-x-8 opacity-75 hidden sm:block relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-500/5 backdrop-blur-sm" />
              <div className="absolute top-4 right-4 font-serif text-xxs text-luxury-blue-light opacity-50">ROYAL BLUE</div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-lg border border-blue-500/30 bg-blue-500/10" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
