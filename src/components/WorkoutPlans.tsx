import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Target, Clock, Zap, Flame, Award } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

type PlanCategory = 'Weight Loss' | 'Muscle Gain' | 'Home Workouts' | 'Strength Training';

export const WorkoutPlans: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PlanCategory>('Muscle Gain');

  const categories: PlanCategory[] = ['Weight Loss', 'Muscle Gain', 'Home Workouts', 'Strength Training'];

  const plansDetails: Record<PlanCategory, {
    title: string;
    focus: string;
    duration: string;
    frequency: string;
    difficulty: string;
    icon: React.ReactNode;
    color: string;
    exercises: string[];
    outcomes: string[];
  }> = {
    'Weight Loss': {
      title: 'HIIT Metabolic Burnout',
      focus: 'Fat Oxidation & Cardiovascular Efficiency',
      duration: '40 - 50 mins',
      frequency: '4 Days / Week',
      difficulty: 'Intermediate',
      icon: <Flame className="h-6 w-6 text-brand-pink" />,
      color: 'from-brand-pink/20 to-brand-violet/20 border-brand-pink/30',
      exercises: [
        'Kettlebell Goblet Squats (4 Sets x 40s work / 20s rest)',
        'Dumbbell Thrusters (4 Sets x 45s work / 15s rest)',
        'Assault Bike Intervals (8 Rounds x 20s sprint / 10s rest)',
        'Core Anti-rotation Planks & Hanging Leg Raises'
      ],
      outcomes: [
        'Maximize post-exercise oxygen consumption (EPOC)',
        'Accelerate fat loss while maintaining muscular structures',
        'Improve maximum oxygen uptake (VO2 Max)'
      ]
    },
    'Muscle Gain': {
      title: 'Hypertrophy Volume Protocol',
      focus: 'Mechanical Tension & Muscular Recomposition',
      duration: '60 - 75 mins',
      frequency: '5 Days / Week',
      difficulty: 'Advanced',
      icon: <Dumbbell className="h-6 w-6 text-brand-violet" />,
      color: 'from-brand-violet/20 to-brand-cyan/20 border-brand-violet/30',
      exercises: [
        'Barbell Squats (4 Sets x 8-10 Reps - 80% 1RM)',
        'Incline Dumbbell Press (4 Sets x 10 Reps - RPE 8.5)',
        'Weighted Pull-Ups (3 Sets x 8 Reps - Progressive Load)',
        'Barbell Romanian Deadlifts (4 Sets x 10-12 Reps)'
      ],
      outcomes: [
        'Stimulate muscle protein synthesis via progressive overload',
        'Increase cross-sectional muscle area (sarcoplasmic expansion)',
        'Optimize muscle density and definition'
      ]
    },
    'Home Workouts': {
      title: 'Calisthenics Conditioning',
      focus: 'Bodyweight Mastery & Joint Resilience',
      duration: '35 - 45 mins',
      frequency: '3 Days / Week',
      difficulty: 'Beginner',
      icon: <Target className="h-6 w-6 text-brand-lime" />,
      color: 'from-brand-lime/20 to-brand-cyan/20 border-brand-lime/30',
      exercises: [
        'Decline Push-Ups / Pike Push-Ups (3 Sets x 12-15 Reps)',
        'Bodyweight Bulgarian Split Squats (4 Sets x 15 Reps/leg)',
        'Resistance Band Face Pulls (3 Sets x 20 Reps)',
        'Sprinting / Jump Squat Power Complexes'
      ],
      outcomes: [
        'Develop superior relative body strength and core stability',
        'Increase flexibility, athletic agility, and movement mobility',
        'Minimal equipment needed - train anywhere, anytime'
      ]
    },
    'Strength Training': {
      title: '5x5 Compound Power Split',
      focus: 'Neurological Adaptation & Maximal Force Output',
      duration: '70 - 85 mins',
      frequency: '3 Days / Week',
      difficulty: 'Advanced',
      icon: <Award className="h-6 w-6 text-brand-cyan" />,
      color: 'from-brand-cyan/20 to-brand-violet/20 border-brand-cyan/30',
      exercises: [
        'Barbell Deadlifts (3 Sets x 5 Reps - 85% 1RM)',
        'Barbell Back Squats (5 Sets x 5 Reps - Linear Progression)',
        'Flat Barbell Bench Press (5 Sets x 5 Reps)',
        'Heavy Standing Military Press (5 Sets x 5 Reps)'
      ],
      outcomes: [
        'Develop maximum central nervous system (CNS) recruitment',
        'Significantly increase joint, bone, and tendon density',
        'Build massive physical strength foundation'
      ]
    }
  };

  const activePlan = plansDetails[activeTab];

  return (
    <section id="workout-plans" className="relative py-24 overflow-hidden border-t border-white/5 bg-dark-950/20">
      <div className="absolute top-[30%] right-[5%] w-[450px] h-[450px] bg-brand-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-violet/10 border border-brand-violet/20 px-3.5 py-1 rounded-full text-brand-violet font-semibold text-xs tracking-wider uppercase"
          >
            Programs
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Choose Your Training Category
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Explore pre-configured fitness cycles. Select a split to view sample exercises and expected results.
          </motion.p>
        </div>

        {/* Interactive Tabs */}
        <div className="flex justify-center flex-wrap gap-2 sm:gap-3 mb-12 max-w-2xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-5 py-3 rounded-full text-xs sm:text-sm font-bold border transition-all duration-300 ${
                activeTab === cat
                  ? 'bg-gradient-to-r from-brand-violet to-brand-cyan border-brand-violet/50 text-white shadow-glow-purple scale-[1.03]'
                  : 'bg-dark-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tabs Display Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
              
              {/* Plan Metadata & Exercises (Left) */}
              <div className="md:col-span-7 text-left space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  {/* Category Title Card */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                        {activePlan.icon}
                      </div>
                      <div>
                        <span className="text-[10px] text-brand-cyan font-black uppercase tracking-widest">
                          Target split
                        </span>
                        <h3 className="text-2xl font-display font-black text-white">
                          {activePlan.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm leading-relaxed italic">
                      Primary Focus: {activePlan.focus}
                    </p>
                  </div>

                  {/* Exercises Details list */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Sample Routine Split Structure
                    </h4>
                    <div className="space-y-3">
                      {activePlan.exercises.map((ex, idx) => (
                        <div key={idx} className="p-4 bg-dark-900/60 border border-white/5 rounded-xl flex items-center space-x-3 hover:border-white/10 transition-colors">
                          <span className="h-6 w-6 rounded-full bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-xs font-bold text-brand-violet">
                            {idx + 1}
                          </span>
                          <span className="text-zinc-300 text-sm font-semibold">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Metrics and Outcomes (Right SpotlightCard) */}
              <div className="md:col-span-5">
                <SpotlightCard className="h-full flex flex-col justify-between border-brand-violet/20 bg-gradient-to-br from-[#0c051a] via-[#090514] to-[#04010a]">
                  
                  {/* Key Metrics grid */}
                  <div className="space-y-6 text-left">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      Program Specifications
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Metric 1 */}
                      <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl">
                        <Clock className="h-4 w-4 text-brand-cyan mb-1.5" />
                        <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Session Time</span>
                        <span className="text-white text-sm font-bold font-display">{activePlan.duration}</span>
                      </div>
                      
                      {/* Metric 2 */}
                      <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl">
                        <Dumbbell className="h-4 w-4 text-brand-violet mb-1.5" />
                        <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wider">Volume Load</span>
                        <span className="text-white text-sm font-bold font-display">{activePlan.frequency}</span>
                      </div>
                      
                      {/* Metric 3 */}
                      <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl col-span-2">
                        <Zap className="h-4 w-4 text-brand-pink mb-1.5 inline-block mr-1.5" />
                        <span className="text-[10px] text-zinc-500 font-bold inline-block uppercase tracking-wider">Intensity Threshold</span>
                        <span className="text-white text-sm font-bold font-display block mt-0.5">{activePlan.difficulty}</span>
                      </div>
                    </div>

                    {/* Expected Outcomes list */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                        8-Week Outcomes
                      </h5>
                      <ul className="space-y-2">
                        {activePlan.outcomes.map((out, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan shrink-0 mt-1.5" />
                            <span>{out}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Plan CTA */}
                  <div className="pt-8 text-left">
                    <a
                      href="#bmi-calculator"
                      className="w-full inline-block text-center py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Calibrate This Program
                    </a>
                  </div>

                </SpotlightCard>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
