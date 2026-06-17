import React from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareQuote, TrendingUp } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Marcus Sterling",
      role: "Operations Manager",
      quote: "FitAI reorganized my training volume completely. The generated PPL hypertrophy program was easier on my shoulders than my old routine and I added 5kg of muscle mass in under 12 weeks.",
      metrics: { label: "Lean Muscle Gained", value: "+5.2 kg" },
      avatar: "MS",
      color: "text-brand-violet border-brand-violet/20 bg-brand-violet/10"
    },
    {
      name: "Eliza Vance",
      role: "UI/UX Researcher",
      quote: "I was highly skeptical of AI meal plans, but the dietary macros FitAI calculated fit my active metabolism perfectly. I lost 8kg of body fat without having to fast or crash diet.",
      metrics: { label: "Body Fat Shed", value: "-8.4 kg" },
      avatar: "EV",
      color: "text-brand-cyan border-brand-cyan/20 bg-brand-cyan/10"
    },
    {
      name: "Devon Cho",
      role: "Software Developer",
      quote: "The home workout progressions got me doing handstands and weighted pullups in my living room. I don't need a gym membership anymore. It updates my progression splits every single week.",
      metrics: { label: "Core Power Increase", value: "+30%" },
      avatar: "DC",
      color: "text-brand-pink border-brand-pink/20 bg-brand-pink/10"
    }
  ];

  return (
    <section id="testimonials" className="relative py-24 overflow-hidden border-t border-white/5">
      <div className="absolute top-[20%] left-[40%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-pink/10 border border-brand-pink/20 px-3.5 py-1 rounded-full text-brand-pink font-semibold text-xs tracking-wider uppercase"
          >
            Validations
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Athlete Transformations
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            See how athletes of all training backgrounds achieve physical gains using FitAI protocols.
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <SpotlightCard className="h-full flex flex-col justify-between p-8 bg-dark-900/60 border border-white/5 rounded-2xl relative group">
                <div className="space-y-6 text-left">
                  {/* Quote icon & stars */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <MessageSquareQuote className="h-5 w-5 text-brand-violet opacity-30 group-hover:opacity-75 transition-opacity" />
                  </div>

                  {/* Quote text */}
                  <p className="text-zinc-300 text-sm leading-relaxed font-normal min-h-[100px]">
                    "{test.quote}"
                  </p>

                  {/* Metrics widget */}
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      {test.metrics.label}
                    </span>
                    <span className="text-white text-sm font-extrabold font-display flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-brand-lime" /> {test.metrics.value}
                    </span>
                  </div>
                </div>

                {/* Profile row */}
                <div className="flex items-center space-x-3 pt-6 border-t border-white/5 mt-6 text-left">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-display font-black text-xs border ${test.color}`}>
                    {test.avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-display font-bold text-white leading-none">
                      {test.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide mt-1 block">
                      {test.role}
                    </span>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
