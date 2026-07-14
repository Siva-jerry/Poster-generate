import React from 'react';
import { FiGift, FiTwitter, FiGithub, FiInstagram, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40 py-12 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-luxury-purple to-luxury-blue flex items-center justify-center shadow-lg border border-purple-500/20">
            <FiGift className="text-xl text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-luxury-purple-light to-luxury-blue-light">
              SmartWish AI
            </span>
            <p className="text-slate-500 text-xxs tracking-wider uppercase">Birthday Poster Engine</p>
          </div>
        </div>

        {/* Made with love */}
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <span>Made with</span>
          <FiHeart className="text-red-500 fill-red-500 animate-pulse" />
          <span>by Antigravity Team © 2026</span>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4">
          <a href="#" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-luxury-purple-light/40 hover:text-luxury-purple-light transition-all">
            <FiTwitter className="text-lg" />
          </a>
          <a href="#" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-luxury-blue-light/40 hover:text-luxury-blue-light transition-all">
            <FiInstagram className="text-lg" />
          </a>
          <a href="#" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-luxury-gold/40 hover:text-luxury-gold transition-all">
            <FiGithub className="text-lg" />
          </a>
        </div>

      </div>
    </footer>
  );
}
