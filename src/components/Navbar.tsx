import React, { useState, useEffect } from 'react';
import { Activity, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationCenter } from './NotificationCenter';

interface NavbarProps {
  activeView: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'store' | 'profile';
  onChangeView: (view: 'home' | 'nutrition' | 'training' | 'coach' | 'body-fat' | 'store' | 'profile') => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, onChangeView, isAuthenticated, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: '🏠 Dashboard', href: '#dashboard', view: 'home' },
    { name: '🍽️ Nutrition Hub', href: '#nutrition-hub', view: 'nutrition' },
    { name: '🏋️ Training Hub', href: '#training-hub', view: 'training' },
    { name: '🤖 AI Coach', href: '#coach', view: 'coach' },
    { name: '📸 AI Body Fat Estimator', href: '#body-fat', view: 'body-fat' },
    { name: '🛍️ Accessories Store', href: '#store', view: 'store' },
    { name: '👤 Profile', href: '#profile', view: 'profile' },
  ];

  const handleLinkClick = (e: React.MouseEvent, item: typeof menuItems[0]) => {
    e.preventDefault();
    setIsOpen(false);
    
    if (item.view === 'home') {
      onChangeView('home');
      setTimeout(() => {
        const id = item.href.substring(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 80);
    } else {
      onChangeView(item.view as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBrandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onChangeView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || activeView !== 'home'
          ? 'bg-dark-950/70 border-b border-white/5 backdrop-blur-md py-4'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left Side: Logo + Nav Links Grouped for Closer Spacing */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <a href="#" onClick={handleBrandClick} className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-violet rounded-lg blur-md opacity-45 group-hover:opacity-75 transition-opacity" />
              <div className="relative p-2 bg-dark-900 border border-white/10 rounded-lg text-brand-cyan group-hover:text-brand-violet transition-colors">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <span className="font-display font-black text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              FIT<span className="text-brand-violet">AI</span>
            </span>
          </a>

          {/* Desktop Nav Links (Balanced, moderate spacing) */}
          <div className="hidden xl:flex items-center space-x-5">
            {menuItems.map((item) => {
              const isCurrent = item.view === activeView;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
                  className={`text-xs uppercase tracking-wider transition-colors duration-200 font-bold whitespace-nowrap ${
                    isCurrent ? 'text-brand-cyan' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {item.name}
                </a>
              );
            })}
          </div>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated && (
            <NotificationCenter onChangeView={onChangeView} />
          )}
          {isAuthenticated && onLogout && (
            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-full text-xs font-black border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 transition-all uppercase tracking-wider bg-white/5 cursor-pointer"
            >
              Log Out 🚪
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="xl:hidden flex items-center space-x-2">
          {isAuthenticated && (
            <NotificationCenter onChangeView={onChangeView} />
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-dark-950/95 border-b border-white/5 backdrop-blur-lg overflow-hidden"
          >
            <div className="px-6 py-8 space-y-6 flex flex-col">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleLinkClick(e, item)}
                  className="text-lg font-medium text-zinc-300 hover:text-white transition-colors text-left"
                >
                  {item.name}
                </a>
              ))}
              <div className="h-px bg-white/5" />
              <div className="flex flex-col gap-4">
                {isAuthenticated && onLogout && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onLogout();
                    }}
                    className="w-full py-3 rounded-full text-sm font-bold border border-white/5 text-red-400 hover:bg-red-500/10 transition-colors uppercase tracking-wider bg-white/5"
                  >
                    Log Out 🚪
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
