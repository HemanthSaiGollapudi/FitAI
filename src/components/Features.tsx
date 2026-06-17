import React from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Apple, TrendingUp, Flame, Compass, Brain } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

export const Features: React.FC = () => {
  const features = [
    {
      icon: <Brain className="h-6 w-6 text-brand-violet" />,
      title: "AI Workout Planner",
      desc: "Our neural network generates optimal periodized splits and progression schedules built entirely around your training history and recovery capacity."
    },
    {
      icon: <Apple className="h-6 w-6 text-brand-cyan" />,
      title: "Personalized Diet Plans",
      desc: "Instant biological macro allocations. Generates complete whole-food grocery templates and daily diet protocols tailored to your metabolic speed."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-brand-pink" />,
      title: "Progress Tracking",
      desc: "Visual feedback dashboards that trace strength volume and metabolic adaptations so you know exactly when to push or load off."
    },
    {
      icon: <Flame className="h-6 w-6 text-brand-lime" />,
      title: "Calorie Calculator",
      desc: "Predicts adaptive expenditure based on active metabolic output, keeping calorie thresholds in tune with real-time progress."
    },
    {
      icon: <Compass className="h-6 w-6 text-brand-cyan" />,
      title: "Exercise Recommendations",
      desc: "Curated biomechanical exercise library that suggests alternatives for joint pain, gym limitations, or specific equipment locks."
    },
    {
      icon: <Dumbbell className="h-6 w-6 text-brand-violet" />,
      title: "Smart Fitness Insights",
      desc: "Receive daily micro-readouts analyzing sleep, recovery curves, and training logs to optimize the next day's physical output."
    }
  ];

  return (
    <section id="features" className="relative py-24 overflow-hidden border-t border-white/5">
      {/* Background visual accents */}
      <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] rounded-full radial-glow opacity-30 pointer-events-none" />
      <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] radial-glow-cyan opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1 rounded-full text-brand-violet font-semibold text-xs tracking-wider uppercase"
          >
            Capabilities
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Engineered to Optimize Your Body
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            FitAI goes beyond template routines. We synthesize real physiological inputs to drive absolute physical transformation.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
            >
              <SpotlightCard className="h-full flex flex-col justify-between group">
                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-brand-violet/40 transition-colors shadow-inner">
                    {feature.icon}
                  </div>
                  
                  {/* Text content */}
                  <div className="text-left space-y-2">
                    <h3 className="text-lg font-display font-bold text-white tracking-wide group-hover:text-brand-cyan transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                      {feature.desc}
                    </p>
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
