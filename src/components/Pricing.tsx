import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface PricingProps {}

export const Pricing: React.FC<PricingProps> = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleScrollToDashboard = () => {
    const el = document.getElementById('dashboard');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tiers = [
    {
      name: "Basic",
      price: { monthly: 999, yearly: 799 },
      desc: "Standard physiological diagnostics and custom workout template access.",
      features: [
        "Basic BMI calculations",
        "4 primary training templates",
        "Manual weight logging logs",
        "Community support forums"
      ],
      cta: "Get Started",
      popular: false,
      glow: "border-white/5",
    },
    {
      name: "Pro",
      price: { monthly: 1499, yearly: 1199 },
      desc: "Adaptive AI planning engine with custom biological nutrient distribution.",
      features: [
        "Everything in Basic plan",
        "Dynamic AI workout cycles",
        "Interactive dietary macro breakdowns",
        "Bi-weekly performance readouts",
        "Priority equipment lockouts options",
        "24/7 automated fitness assistant access"
      ],
      cta: "Unlock Pro Engine",
      popular: true,
      glow: "border-brand-violet/40 shadow-glow-purple bg-[#0d0720]",
    },
    {
      name: "Premium",
      price: { monthly: 2999, yearly: 2399 },
      desc: "Elite metabolic diagnostics and deep integration with wearable fitness data.",
      features: [
        "Everything in Pro plan",
        "Apple Watch & Garmin sensor Sync",
        "Wearable biomarkers integrations",
        "Real-time metabolic rate estimates",
        "Direct chat support from specialists",
        "Custom biomechanical alternatives library"
      ],
      cta: "Activate Premium Core",
      popular: false,
      glow: "border-white/5",
    }
  ];

  return (
    <section id="pricing" className="relative py-24 overflow-hidden border-t border-white/5">
      <div className="absolute top-[30%] left-[50%] w-[400px] h-[400px] bg-brand-violet/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1 rounded-full text-brand-violet font-semibold text-xs tracking-wider uppercase"
          >
            Pricing Plans
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Invest In Your Physiology
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Flexible tiers suited for beginners to elite performers. Save 20% by purchasing an annual subscription.
          </motion.p>
        </div>

        {/* Billing Toggle Switch */}
        <div className="flex items-center justify-center space-x-3 mb-16">
          <span className={`text-sm font-semibold transition-colors duration-200 ${billingPeriod === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 bg-dark-900 border border-white/10 rounded-full p-1 relative flex items-center transition-colors"
          >
            <div className={`w-5.5 h-5.5 bg-gradient-to-r from-brand-violet to-brand-cyan rounded-full shadow-md transition-all ${billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'text-white' : 'text-zinc-500'}`}>
            Yearly <span className="text-[10px] font-black text-brand-lime border border-brand-lime/30 bg-brand-lime/10 px-1.5 py-0.5 rounded-md uppercase">Save 20%</span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="h-full"
            >
              <SpotlightCard className={`h-full flex flex-col justify-between p-8 border ${tier.glow} relative`}>
                
                {/* Popular Glow tag */}
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan border border-brand-violet/50 text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </div>
                )}

                <div className="text-left space-y-6">
                  {/* Title & Desc */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-display font-black text-white">{tier.name}</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed font-normal min-h-[36px]">{tier.desc}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline space-x-1 font-display">
                    <span className="text-zinc-400 text-2xl font-bold">₹</span>
                    <span className="text-5xl font-black text-white tracking-tight">
                      {billingPeriod === 'monthly' ? tier.price.monthly : tier.price.yearly}
                    </span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider ml-1">/ Month</span>
                  </div>

                  <div className="h-px bg-white/5" />

                  {/* Features list */}
                  <ul className="space-y-3">
                    {tier.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-start space-x-2.5 text-xs text-zinc-300">
                        <Check className="h-4 w-4 text-brand-lime shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pricing CTA Button */}
                <div className="pt-8 text-left mt-6">
                  <button
                    onClick={handleScrollToDashboard}
                    className={`w-full py-3.5 text-xs font-bold rounded-xl text-center transition-all ${
                      tier.popular
                        ? 'bg-gradient-to-r from-brand-violet to-brand-cyan text-white shadow-glow-purple hover:scale-[1.01]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
                    }`}
                  >
                    {tier.cta}
                  </button>
                </div>

              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
