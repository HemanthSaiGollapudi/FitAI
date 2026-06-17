import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      question: "How does FitAI construct my personalized plan?",
      answer: "Our proprietary AI engine takes your bio-metrics (age, weight, height, gender), experience level, active training goals, and equipment locks, then applies classic sports-science programming splits (linear periodization, hypertrophy volume cycles) to formulate a customized calorie, macro, and lift target."
    },
    {
      question: "Can I connect my Apple Watch, Whoop, or Garmin device?",
      answer: "Yes! Our Elite tier provides direct API sync connections for major wearable frameworks. This allows FitAI to dynamically calibrate your daily calorie expenditure adjustments based on actual physical metabolic burn rather than baseline estimates."
    },
    {
      question: "Do I need gym equipment, or can I perform workouts at home?",
      answer: "We support both. When starting, you can specify whether you have a full commercial gym setup, a dumbbell-only home setup, or bodyweight-only. Our 'Home Workouts' calisthenics routines are specifically built to drive hypertrophic adaptation using gravity alone."
    },
    {
      question: "How frequently does the AI adjust my progression splits?",
      answer: "Weekly. When you finish a training cycle, you can check off completed weights or input your rate of perceived exertion (RPE). The system analyzes whether you exceeded targeted volume and increments loading cycles to prevent plateaus."
    },
    {
      question: "Can I cancel my Pro or Elite subscription at any time?",
      answer: "Absolutely. There are no lock-in contracts. You can downgrade or cancel your billing configuration instantly with a single click in your dashboard account settings."
    },
    {
      question: "Is my biological and fitness data stored securely?",
      answer: "Yes, privacy is a critical priority. FitAI uses modern database encryption, anonymized token systems for personal profiles, and strictly adheres to global privacy laws, meaning your personal biological data remains yours alone."
    }
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-24 overflow-hidden border-t border-white/5 bg-dark-950/20">
      <div className="absolute top-[40%] right-[10%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-cyan/10 border border-brand-cyan/20 px-3.5 py-1 rounded-full text-brand-cyan font-semibold text-xs tracking-wider uppercase"
          >
            Faq Support
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Frequently Asked Questions
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Have questions about calculations, subscriptions, or plans? We have answers.
          </motion.p>
        </div>

        {/* Accordions List */}
        <div className="space-y-4 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-dark-900/60 border border-white/5 rounded-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/10"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => handleToggle(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 font-display font-bold text-white text-base sm:text-lg"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-brand-violet shrink-0" /> {faq.question}
                  </span>
                  <div className={`p-1 bg-white/5 border border-white/10 rounded-lg text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>

                {/* Accordion Content Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm text-zinc-400 leading-relaxed font-normal border-t border-white/5">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
