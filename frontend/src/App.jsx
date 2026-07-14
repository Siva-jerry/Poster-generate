import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Generator from './components/Generator';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import PreviewModal from './components/PreviewModal';
import { FiGift, FiZap, FiMenu, FiX } from 'react-icons/fi';
import { checkBackendHealth } from './services/api';

export default function App() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    imageUrl: '',
    theme: ''
  });
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [backendStatus, setBackendStatus] = useState(false);

  // Monitor scroll state for styling navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Check if backend is alive
    const checkHealth = async () => {
      const data = await checkBackendHealth();
      if (data && data.status === 'ok') {
        setBackendStatus(true);
      }
    };
    checkHealth();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenPreview = (imageUrl, theme) => {
    setModalState({
      isOpen: true,
      imageUrl,
      theme
    });
  };

  const handleClosePreview = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-luxury-purple/50 selection:text-white">
      
      {/* Navigation Bar */}
      <nav className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'glass-navbar py-4 shadow-lg' 
          : 'bg-transparent py-6'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-luxury-purple to-luxury-blue flex items-center justify-center border border-purple-500/20 shadow-md">
              <FiGift className="text-lg text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-luxury-purple-light to-luxury-blue-light">
              SmartWish AI
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How it Works</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">FAQ</button>
            
            {/* Health status dot */}
            <div className="flex items-center gap-1.5 text-slate-500 text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${backendStatus ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{backendStatus ? 'Live' : 'Connecting'}</span>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <button 
              onClick={() => scrollToSection('generator')}
              className="px-5 py-2.5 rounded-xl font-bold btn-primary text-sm flex items-center gap-2"
            >
              <FiZap />
              Generate Poster
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-navbar absolute top-full left-0 right-0 py-6 border-b border-white/5 flex flex-col items-center gap-5 text-sm font-semibold text-slate-300 shadow-2xl">
            <button onClick={() => scrollToSection('features')} className="hover:text-white py-1">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white py-1">How it Works</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-white py-1">FAQ</button>
            <button 
              onClick={() => scrollToSection('generator')}
              className="w-4/5 py-3 rounded-xl font-bold btn-primary text-center flex items-center justify-center gap-2 mt-2"
            >
              <FiZap />
              Generate Poster
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <Hero onStartClick={() => scrollToSection('generator')} />

      {/* Features Grid */}
      <Features />

      {/* Workflow steps */}
      <HowItWorks />

      {/* Core poster generator tool */}
      <Generator onOpenPreview={handleOpenPreview} />

      {/* Frequently Asked Questions */}
      <FAQ />

      {/* Main Footer */}
      <Footer />

      {/* Fullscreen High-Res Preview Modal */}
      <PreviewModal
        isOpen={modalState.isOpen}
        imageUrl={modalState.imageUrl}
        theme={modalState.theme}
        onClose={handleClosePreview}
      />

    </div>
  );
}
