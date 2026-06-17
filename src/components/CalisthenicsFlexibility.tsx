import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

type CalCategory = 'Beginner' | 'Intermediate' | 'Advanced' | 'Flexibility';

interface Exercise {
  id: string;
  name: string;
  muscle: string;
  sets: string;
  instructions: string;
  videoUrl: string;
}

interface CalisthenicsFlexibilityProps {
  onSaveExercise: (id: string) => void;
  onCompleteExercise: (id: string) => void;
  savedExercises: string[];
  completedExercises: string[];
}

export const CalisthenicsFlexibility: React.FC<CalisthenicsFlexibilityProps> = ({
  onSaveExercise,
  onCompleteExercise,
  savedExercises,
  completedExercises
}) => {
  const [activeCategory, setActiveCategory] = useState<CalCategory>('Beginner');

  const categories: CalCategory[] = ['Beginner', 'Intermediate', 'Advanced', 'Flexibility'];

  const exercisesData: Record<CalCategory, Exercise[]> = {
    'Beginner': [
      {
        id: 'inc-pushups',
        name: 'Incline Push-Ups',
        muscle: 'Chest & Triceps',
        sets: '3 Sets x 12 Reps',
        instructions: 'Place hands on an elevated surface like a bench. Keep body straight and descend until chest touches, then push back up.',
        videoUrl: 'https://www.youtube.com/embed/5U0aK9Q_rFA'
      },
      {
        id: 'bw-squats',
        name: 'Bodyweight Squats',
        muscle: 'Quads & Glutes',
        sets: '3 Sets x 15 Reps',
        instructions: 'Stand with feet shoulder-width apart. Squat down as if sitting in a chair, keeping knees tracking over toes. Drive back up.',
        videoUrl: 'https://www.youtube.com/embed/U3HlEF_E9fo'
      },
      {
        id: 'knee-raises',
        name: 'Knee Raises',
        muscle: 'Lower Abdominals',
        sets: '3 Sets x 10 Reps',
        instructions: 'Hang from a bar or support yourself on parallel bars. Slowly pull your knees up toward your chest, contracting your core.',
        videoUrl: 'https://www.youtube.com/embed/e1A5Ew6W9Y4'
      },
      {
        id: 'ass-pullups',
        name: 'Assisted Pull-Ups',
        muscle: 'Lats & Biceps',
        sets: '3 Sets x 8 Reps',
        instructions: 'Use a loop resistance band anchored to the bar. Place feet or knees in the band, pull up until chin clears the bar.',
        videoUrl: 'https://www.youtube.com/embed/y2cO5S620r8'
      },
      {
        id: 'plank',
        name: 'Classic Plank',
        muscle: 'Core Stability',
        sets: '3 Sets x 45s Hold',
        instructions: 'Support bodyweight on forearms and toes. Keep body in a straight line, squeezing glutes and engaging the core.',
        videoUrl: 'https://www.youtube.com/embed/ASdvN_XEl_c'
      }
    ],
    'Intermediate': [
      {
        id: 'std-pushups',
        name: 'Standard Push-Ups',
        muscle: 'Chest, Shoulders & Triceps',
        sets: '3 Sets x 15-20 Reps',
        instructions: 'From a plank position, lower your chest to the floor keeping elbows tucked at 45 degrees. Squeeze chest to push up.',
        videoUrl: 'https://www.youtube.com/embed/IODxDxX7oi4'
      },
      {
        id: 'pullups',
        name: 'Standard Pull-Ups',
        muscle: 'Back & Biceps',
        sets: '4 Sets x 8 Reps',
        instructions: 'Hang from pull-up bar with overhand grip. Pull shoulder blades down, pull chest to bar, lower slowly with control.',
        videoUrl: 'https://www.youtube.com/embed/eGo4IYlbE5g'
      },
      {
        id: 'dips',
        name: 'Parallel Bar Dips',
        muscle: 'Chest & Triceps',
        sets: '3 Sets x 10 Reps',
        instructions: 'Support weight on parallel bars. Lower body by bending elbows to 90 degrees, leaning slightly forward. Push up.',
        videoUrl: 'https://www.youtube.com/embed/2z8JmcrW-As'
      },
      {
        id: 'hanging-leg-raises',
        name: 'Hanging Leg Raises',
        muscle: 'Core & Hip Flexors',
        sets: '3 Sets x 8-10 Reps',
        instructions: 'Hang from bar. Keeping legs completely straight, raise them up to a 90-degree angle with control, then lower slowly.',
        videoUrl: 'https://www.youtube.com/embed/jO_JgV44RKE'
      },
      {
        id: 'bulg-split-squats',
        name: 'Bulgarian Split Squats',
        muscle: 'Quads & Glutes',
        sets: '3 Sets x 12 Reps / leg',
        instructions: 'Place one foot back on an elevated bench. Squat down on the front leg until back knee almost touches. Return to start.',
        videoUrl: 'https://www.youtube.com/embed/2C-uNgKw12A'
      }
    ],
    'Advanced': [
      {
        id: 'muscle-ups',
        name: 'Bar Muscle-Ups',
        muscle: 'Lats, Chest & Triceps',
        sets: '3 Sets x 4 Reps',
        instructions: 'Pull up dynamically with a hollow-body arc. Transition your chest over the bar rapidly, then press out into dip lock.',
        videoUrl: 'https://www.youtube.com/embed/9G6kXoK5Wz4'
      },
      {
        id: 'front-lever',
        name: 'Front Lever Progressions',
        muscle: 'Core, Lats & Scapula',
        sets: '4 Sets x 10s Hold',
        instructions: 'Hang from bar. Pull straight arms down, lifting entire torso and legs horizontally. Keep body flat like a table.',
        videoUrl: 'https://www.youtube.com/embed/mG97_S1pLkw'
      },
      {
        id: 'hspu',
        name: 'Handstand Push-Ups',
        muscle: 'Shoulders & Triceps',
        sets: '3 Sets x 5 Reps',
        instructions: 'Kick up against a wall in a handstand. Lower body until head lightly touches ground, push up extending arms fully.',
        videoUrl: 'https://www.youtube.com/embed/7V2VlYpG_a0'
      },
      {
        id: 'pistol-squats',
        name: 'Pistol Squats',
        muscle: 'Legs & Balance',
        sets: '3 Sets x 8 Reps / leg',
        instructions: 'Stand on one leg, extending other leg straight out. Squat deep on standing leg until glute reaches calf. Stand up.',
        videoUrl: 'https://www.youtube.com/embed/q0_J3sKpxw4'
      },
      {
        id: 'dragon-flags',
        name: 'Dragon Flags',
        muscle: 'Entire Core & Lats',
        sets: '3 Sets x 6 Reps',
        instructions: 'Lie on bench, grip bar behind head. Lift entire body on shoulders, keep body rigid. Lower slowly as a single unit.',
        videoUrl: 'https://www.youtube.com/embed/Mh1v59yV-h0'
      }
    ],
    'Flexibility': [
      {
        id: 'hamstring-stretch',
        name: 'Hamstring Stretch',
        muscle: 'Hamstrings & Lower Back',
        sets: '3 Sets x 30s Hold',
        instructions: 'Sit with legs extended straight. Fold forward from the hips, reaching hands towards toes while keeping spine long.',
        videoUrl: 'https://www.youtube.com/embed/yC2y99Vz5b8'
      },
      {
        id: 'hip-flexor-stretch',
        name: 'Kneeling Hip Flexor Stretch',
        muscle: 'Psoas & Quads',
        sets: '3 Sets x 30s / leg',
        instructions: 'Kneel on one knee, step other foot forward in a lunge. Tuck pelvis and lean forward slightly to stretch hip front.',
        videoUrl: 'https://www.youtube.com/embed/ZqD3T95Ylq0'
      },
      {
        id: 'butterfly-stretch',
        name: 'Butterfly Stretch',
        muscle: 'Inner Thighs & Adductors',
        sets: '3 Sets x 40s Hold',
        instructions: 'Sit with knees bent, soles of feet pressed together. Hold feet, gently pull heels in, and press knees towards ground.',
        videoUrl: 'https://www.youtube.com/embed/v9C2K8u4W0E'
      },
      {
        id: 'cat-cow',
        name: 'Cat-Cow Stretch',
        muscle: 'Spinal Mobility',
        sets: '3 Sets x 10 Cycles',
        instructions: 'On hands and knees. Alternate between arching spine up (cat) and dropping belly low while lifting head (cow).',
        videoUrl: 'https://www.youtube.com/embed/w_Z20bV5Bw0'
      },
      {
        id: 'childs-pose',
        name: 'Child\'s Pose',
        muscle: 'Shoulders & Spine Decompression',
        sets: '2 Sets x 60s Hold',
        instructions: 'Kneel, sit back on heels. Fold chest forward over thighs, reaching arms out in front on floor, forehead resting down.',
        videoUrl: 'https://www.youtube.com/embed/2ATEo0Y4YFw'
      },
      {
        id: 'cobra-stretch',
        name: 'Cobra Stretch',
        muscle: 'Abdominals & Lower Back',
        sets: '3 Sets x 30s Hold',
        instructions: 'Lie flat on stomach. Place hands under shoulders, press down to arch spine up, keeping thighs in contact with floor.',
        videoUrl: 'https://www.youtube.com/embed/JDdCc7jK6pU'
      }
    ]
  };

  const activeExercises = exercisesData[activeCategory];

  return (
    <section id="calisthenics" className="relative py-24 overflow-hidden border-t border-white/5 bg-dark-950/20">
      {/* Visual background lights */}
      <div className="absolute top-[30%] left-[50%] w-[400px] h-[400px] bg-brand-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[80px] pointer-events-none" />

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
            Body Mastery
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Calisthenics & Flexibility Vault
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Train bodyweight strength, core stabilization, and motor control with video instructions.
          </motion.p>
        </div>

        {/* Level Toggles */}
        <div className="flex justify-center flex-wrap gap-2.5 sm:gap-3 mb-12 max-w-2xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gradient-to-r from-brand-violet to-brand-cyan border-brand-violet/50 text-white shadow-glow-purple scale-[1.02]'
                  : 'bg-dark-900 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Exercises list with videos */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto text-left"
          >
            {activeExercises.map((ex) => {
              const isSaved = savedExercises.includes(ex.id);
              const isCompleted = completedExercises.includes(ex.id);

              return (
                <SpotlightCard key={ex.id} className="p-6 bg-dark-900/40 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-brand-violet/30 h-full">
                  <div className="space-y-6">
                    {/* Header: Title, target, actions */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] text-brand-cyan font-black uppercase tracking-wider bg-brand-cyan/10 px-2 py-0.5 rounded">
                          {ex.muscle}
                        </span>
                        <h3 className="text-xl font-display font-black text-white mt-1.5 leading-none">
                          {ex.name}
                        </h3>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {/* Save Favorite */}
                        <button
                          onClick={() => onSaveExercise(ex.id)}
                          className={`p-2 rounded-lg border transition-all duration-200 ${
                            isSaved
                              ? 'bg-brand-pink/20 border-brand-pink text-brand-pink'
                              : 'bg-dark-950 border-white/5 text-zinc-400 hover:text-white'
                          }`}
                          title={isSaved ? "Saved to favorites" : "Save workout"}
                        >
                          <Heart className="h-4 w-4 fill-current" />
                        </button>
                        
                        {/* Mark Completed */}
                        <button
                          onClick={() => onCompleteExercise(ex.id)}
                          className={`p-2 rounded-lg border transition-all duration-200 ${
                            isCompleted
                              ? 'bg-brand-lime/20 border-brand-lime text-brand-lime'
                              : 'bg-dark-950 border-white/5 text-zinc-400 hover:text-white'
                          }`}
                          title={isCompleted ? "Workout Completed" : "Mark Workout Completed"}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stats & Instructions */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-400">
                        <span>Intensity: <span className="text-white">{activeCategory}</span></span>
                        <span>•</span>
                        <span>Volume: <span className="text-brand-violet">{ex.sets}</span></span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-normal min-h-[48px]">
                        {ex.instructions}
                      </p>
                    </div>

                    {/* YouTube Video Player Embed */}
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-dark-950 shadow-inner">
                      <iframe
                        src={ex.videoUrl}
                        title={ex.name}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  );
};
