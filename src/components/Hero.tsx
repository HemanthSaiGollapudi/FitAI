import React from 'react';
import { Play, Sparkles, ArrowRight, ShieldCheck, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {}

export const Hero: React.FC<HeroProps> = () => {
  // Generate random floating nodes for the interactive AI network graphic
  const nodes = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 5 + 3,
    delay: Math.random() * 2,
    duration: Math.random() * 4 + 4,
  }));

  const handleScrollToDashboard = () => {
    const el = document.getElementById('dashboard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen pt-32 pb-20 flex items-center overflow-hidden">
      {/* Background Gradients and Glowing Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] rounded-full radial-glow opacity-60 animate-pulse-slow" />
        <div className="absolute bottom-[30%] right-[10%] w-[450px] h-[450px] rounded-full radial-glow-cyan opacity-40 animate-pulse-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[10%] right-[30%] w-[300px] h-[300px] bg-brand-pink/5 rounded-full blur-[80px] animate-float-slow" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side Content */}
        <div className="lg:col-span-7 flex flex-col text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md self-start"
          >
            <Sparkles className="h-4 w-4 text-brand-cyan animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-zinc-300">
              Next-Gen AI Fitness Experience
            </span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-none"
            >
              Your Personal <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-indigo via-brand-violet to-brand-cyan animate-gradient">
                AI Fitness Coach
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-zinc-400 text-lg sm:text-xl max-w-xl font-normal leading-relaxed"
            >
              FitAI leverages advanced neural networks to create custom, hyper-personalized workout routines and nutrition strategies tailored specifically to your unique metabolic profile and goals.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4"
          >
            <button
              onClick={handleScrollToDashboard}
              className="group relative px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 bg-gradient-to-r from-brand-violet to-brand-cyan text-white shadow-glow-purple hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              Go to Dashboard <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleScrollToDashboard}
              className="px-8 py-4 rounded-xl text-base font-bold transition-all duration-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white flex items-center justify-center gap-2 backdrop-blur-md"
            >
              <Play className="h-4 w-4 fill-white text-white" /> Try Demo
            </button>
          </motion.div>

          {/* Social Proof Tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap items-center gap-6 pt-6 text-zinc-500 text-sm border-t border-white/5"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-cyan" />
              <span>HIPAA Compliant Data Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand-violet" />
              <span>Real-Time Plan Adjustments</span>
            </div>
          </motion.div>
        </div>

        {/* Right Side 3D-style Graphic */}
        <div className="lg:col-span-5 relative flex justify-center items-center py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px]"
          >
            {/* Outer Glowing Spheres */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-violet/20 to-brand-cyan/20 rounded-full blur-[40px] animate-spin-slow" />
            
            {/* Spinning Core Graphic */}
            <div className="absolute inset-4 bg-dark-900 border border-white/10 rounded-full flex items-center justify-center shadow-glass backdrop-blur-2xl">
              <svg className="w-full h-full p-4" viewBox="0 0 100 100">
                {/* Connecting lines */}
                {nodes.map((n1) =>
                  nodes.map((n2) => {
                    // Connect close nodes
                    const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                    if (dist > 10 && dist < 32 && n1.id < n2.id) {
                      return (
                        <motion.line
                          key={`${n1.id}-${n2.id}`}
                          x1={n1.x}
                          y1={n1.y}
                          x2={n2.x}
                          y2={n2.y}
                          stroke="rgba(139, 92, 246, 0.15)"
                          strokeWidth="0.5"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: [0, 1, 0] }}
                          transition={{
                            duration: Math.random() * 4 + 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      );
                    }
                    return null;
                  })
                )}

                {/* Animated Glowing Orbit lines */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(6, 182, 212, 0.1)" strokeWidth="0.5" strokeDasharray="5, 5" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="30"
                  fill="none"
                  stroke="url(#neon-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="20 180"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />

                {/* Nodes */}
                {nodes.map((node) => (
                  <motion.circle
                    key={node.id}
                    cx={node.x}
                    cy={node.y}
                    r={node.size / 6}
                    fill={node.id % 2 === 0 ? '#8b5cf6' : '#06b6d4'}
                    animate={{
                      y: [node.y, node.y - 4, node.y],
                      opacity: [0.6, 1, 0.6],
                    }}
                    transition={{
                      duration: node.duration,
                      repeat: Infinity,
                      delay: node.delay,
                      ease: 'easeInOut',
                    }}
                  />
                ))}

                {/* Gradients */}
                <defs>
                  <linearGradient id="neon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Glowing Center Badge */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-dark-950/90 border border-brand-violet/40 p-5 rounded-2xl flex flex-col items-center justify-center shadow-glow-purple"
            >
              <Activity className="h-8 w-8 text-brand-cyan animate-pulse mb-1" />
              <span className="font-display font-bold text-xs tracking-wider text-white uppercase">
                FitAI Engine
              </span>
              <span className="text-[10px] text-brand-violet font-semibold uppercase tracking-widest mt-1 px-2 py-0.5 bg-brand-violet/10 rounded-full">
                Active
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
