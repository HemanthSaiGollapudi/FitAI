import React from 'react';
import { Activity, Send, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Subscription registered! Welcome to the FitAI Newsletter.");
  };

  return (
    <footer className="relative border-t border-white/5 bg-dark-950/80 pt-20 pb-10 overflow-hidden">
      {/* Visual background gradient */}
      <div className="absolute bottom-0 right-[20%] w-[300px] h-[300px] bg-brand-violet/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 text-left">
        
        {/* Brand Information (Left Col) */}
        <div className="md:col-span-4 space-y-6">
          <a href="#" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-violet rounded-lg blur-md opacity-45 group-hover:opacity-75 transition-opacity" />
              <div className="relative p-2 bg-dark-900 border border-white/10 rounded-lg text-brand-cyan group-hover:text-brand-violet transition-colors">
                <Activity className="h-5 w-5" />
              </div>
            </div>
            <span className="font-display font-black text-xl tracking-wider text-white">
              FIT<span className="text-brand-violet">AI</span>
            </span>
          </a>

          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm font-normal">
            FitAI synthesizes state-of-the-art neural algorithms with physiology science to deliver custom exercise splits and macro-partitioning plans. Built for developers, athletes, and biohackers.
          </p>

          {/* Social Icons */}
          <div className="flex items-center space-x-4">
            {[
              { 
                icon: (
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ), 
                href: "https://twitter.com" 
              },
              { 
                icon: (
                  <svg className="h-4 w-4 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                ), 
                href: "https://instagram.com" 
              },
              { 
                icon: (
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                ), 
                href: "https://github.com" 
              }
            ].map((soc, idx) => (
              <a
                key={idx}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:text-white hover:border-brand-violet/40 transition-colors flex items-center justify-center"
              >
                {soc.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links (Middle Col 1) */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
          <ul className="space-y-3 text-sm font-medium">
            {['Features', 'How It Works', 'Workout Plans', 'BMI Calculator'].map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support Links (Middle Col 2) */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h4>
          <ul className="space-y-3 text-sm font-medium">
            {['Pricing', 'FAQ', 'Privacy Policy', 'Terms of Service'].map((link) => (
              <li key={link}>
                <a
                  href={link.startsWith('P') || link.startsWith('F') ? `#${link.toLowerCase().replace(/\s+/g, '-')}` : '#'}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter / Contact (Right Col) */}
        <div className="md:col-span-4 space-y-6">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">FitAI Dispatch</h4>
            <p className="text-zinc-400 text-xs leading-relaxed font-normal">
              Subscribe to get metabolic optimization tricks and bi-weekly research review letters.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubscribe} className="relative flex items-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-dark-900 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet transition-colors pr-12"
              required
            />
            <button
              type="submit"
              className="absolute right-1.5 p-2 bg-gradient-to-r from-brand-violet to-brand-cyan rounded-lg text-white hover:scale-105 transition-transform"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Contact Details */}
          <div className="space-y-2 pt-2 text-xs text-zinc-500 font-semibold">
            <div className="flex items-center space-x-2">
              <Mail className="h-3.5 w-3.5 text-brand-violet" />
              <span>support@fitai.neuro</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-3.5 w-3.5 text-brand-cyan" />
              <span>Infinite Loop, Cupertino, CA</span>
            </div>
          </div>
        </div>

      </div>

      {/* Corporate Disclaimer Bottom */}
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-medium">
        <span>© {new Date().getFullYear()} FitAI Inc. All rights reserved.</span>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-zinc-300">Security Specs</a>
          <a href="#" className="hover:text-zinc-300">Status Logs</a>
          <a href="#" className="hover:text-zinc-300">Sitemap Index</a>
        </div>
      </div>
    </footer>
  );
};
