import React from 'react';
import { motion } from 'framer-motion';
import { FormInput, BrainCircuit, Activity } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: "01",
      icon: <FormInput className="h-6 w-6 text-brand-violet" />,
      title: "Tell Us Your Goals",
      desc: "Input your starting metrics, physical limitations, activity habits, and primary goals via our interactive onboarding portal."
    },
    {
      num: "02",
      icon: <BrainCircuit className="h-6 w-6 text-brand-cyan" />,
      title: "Get Your AI-Generated Plan",
      desc: "Our neural algorithms crunch your metrics in real-time, synthesizing custom macros, calorie ratios, and exercise splits tailored for you."
    },
    {
      num: "03",
      icon: <Activity className="h-6 w-6 text-brand-pink" />,
      title: "Track & Improve Progress",
      desc: "Log workouts and weight easily. The engine tracks your feedback and updates your plan volume weekly so you never plateau."
    }
  ];

  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden border-t border-white/5 bg-dark-950/20">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[10%] left-[45%] w-[400px] h-[400px] bg-brand-violet/5 rounded-full blur-[90px] animate-pulse-slow" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-cyan/10 border border-brand-cyan/20 px-3.5 py-1 rounded-full text-brand-cyan font-semibold text-xs tracking-wider uppercase"
          >
            Workflow
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Three Steps to Optimization
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            How FitAI builds your daily workout, diet, and recovery cycle.
          </motion.p>
        </div>

        {/* Timeline Grid */}
        <div className="relative">
          {/* Connecting glowing line (visible on desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-brand-violet via-brand-cyan to-brand-pink opacity-20" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="flex flex-col items-center text-center space-y-6 group"
              >
                {/* Visual bubble node */}
                <div className="relative">
                  <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-full group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur" />
                  
                  {/* Outer circle ring */}
                  <div className="relative w-24 h-24 rounded-full bg-dark-900 border-2 border-white/5 flex items-center justify-center group-hover:border-brand-violet/50 transition-colors duration-300 shadow-glass">
                    {step.icon}
                    {/* Floating number flag */}
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan text-[10px] font-black text-white shadow-md">
                      {step.num}
                    </span>
                  </div>
                </div>

                {/* Text explanation */}
                <div className="space-y-3 max-w-sm">
                  <h3 className="text-xl font-display font-extrabold text-white tracking-wide group-hover:text-brand-cyan transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
