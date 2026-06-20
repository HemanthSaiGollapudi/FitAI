import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Activity, ShieldCheck } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { SpotlightCard } from './SpotlightCard';

interface StretchItem {
  id: string;
  name: string;
  focus: string;
  reps: string;
  instructions: string;
  youtubeUrl: string;
  backupYoutubeUrl: string;
}

export const WarmUpProtocol: React.FC = () => {
  const [activeWarmupTab, setActiveWarmupTab] = useState<'Upper' | 'Legs' | 'Stretches'>('Upper');

  const stretches: StretchItem[] = [
    {
      id: 'hamstring-stretch',
      name: 'Hamstring Stretch',
      focus: 'Hamstrings & Lower Back',
      reps: '2 Sets x 30s hold',
      instructions: 'Extend legs forward, fold chest from the hips reaching for your ankles or toes. Keep spine neutral.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    },
    {
      id: 'hip-flexor-stretch',
      name: 'Hip Flexor Stretch',
      focus: 'Psoas & Quads',
      reps: '2 Sets x 30s / leg',
      instructions: 'Lunge kneeling on one knee. Lean pelvis forward slowly until you feel the stretch on the front of the hip.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    },
    {
      id: 'butterfly-stretch',
      name: 'Butterfly Stretch',
      focus: 'Adductors & Groin',
      reps: '2 Sets x 40s hold',
      instructions: 'Sit, pull feet together, wrap hands around toes and gently press knees downward.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    },
    {
      id: 'cat-cow-stretch',
      name: 'Cat-Cow Stretch',
      focus: 'Spinal Extension & Flexion',
      reps: '2 Sets x 10 cycles',
      instructions: 'Alternating between arching and curling back on hands and knees to mobilize spine.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    },
    {
      id: 'childs-pose',
      name: 'Child\'s Pose',
      focus: 'Spine Decompression',
      reps: '2 Sets x 60s hold',
      instructions: 'Kneel, push hips back onto heels, reach arms forward fully resting forehead on floor.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    },
    {
      id: 'cobra-stretch',
      name: 'Cobra Stretch',
      focus: 'Abdominals & Lower Back',
      reps: '2 Sets x 30s hold',
      instructions: 'Lie flat on stomach. Press hands down under shoulders to arch spine up, keeping thighs down.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    },
    {
      id: 'shoulder-mobility-stretch',
      name: 'Shoulder Mobility Stretch',
      focus: 'Rotator Cuffs & Scapula',
      reps: '2 Sets x 12 cycles',
      instructions: 'Perform slow arm circles, shoulder dislocations using a resistance band or wall slides.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    },
    {
      id: 'thoracic-rotation',
      name: 'Thoracic Rotation',
      focus: 'Upper Back Mobility',
      reps: '2 Sets x 8 / side',
      instructions: 'On hands and knees, place one hand behind head, rotate elbow up to sky, return under control.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    },
    {
      id: 'quad-stretch',
      name: 'Quad Stretch',
      focus: 'Quadriceps',
      reps: '2 Sets x 30s / leg',
      instructions: 'Stand on one leg, pull ankle behind body close to glute, keeping thighs aligned.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    },
    {
      id: 'calf-stretch',
      name: 'Calf Stretch',
      focus: 'Gastrocnemius & Achilles',
      reps: '2 Sets x 30s / leg',
      instructions: 'Press foot up against a wall, leaning body forward to feel stretch in the calf fibers.',
      youtubeUrl: 'https://www.youtube.com/watch?v=sOuKeVuej9E',
      backupYoutubeUrl: 'https://www.youtube.com/watch?v=E81GN-3A8XM'
    }
  ];

  return (
    <section id="warmup" className="relative py-24 overflow-hidden border-t border-white/5">
      <div className="absolute top-[20%] left-[30%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand-cyan/10 border border-brand-cyan/20 px-3.5 py-1 rounded-full text-brand-cyan font-semibold text-xs tracking-wider uppercase"
          >
            Preparation
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Daily Warm-Up & Mobility
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Prime your central nervous system before heavy lifting to prevent injury and maximize force splits.
          </motion.p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center border-b border-white/5 mb-12 max-w-xl mx-auto">
          {['Upper', 'Legs', 'Stretches'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveWarmupTab(tab as any)}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all ${
                activeWarmupTab === tab
                  ? 'border-brand-cyan text-white font-black'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'Upper' ? "Upper Body Warm-up" : tab === 'Legs' ? "Leg Day Warm-up" : "Flexibility & Stretches"}
            </button>
          ))}
        </div>

        {/* Displays */}
        <div className="max-w-6xl mx-auto text-left">
          
          {/* DISPLAY UPPER BODY WARMUP */}
          {activeWarmupTab === 'Upper' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Routine Card */}
              <SpotlightCard className="p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                    <Flame className="h-5 w-5 text-brand-cyan" /> Activation Protocol
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Perform these exercises consecutively to drive blood to the shoulder joints and pectorals before starting your press cycles.
                  </p>
                  
                  <div className="space-y-3 pt-4">
                    <div className="p-4 bg-dark-950/40 border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">Wide Grip Pull-Ups</h4>
                        <span className="text-[10px] text-zinc-500">Activates lats, scapula, and posterior delts</span>
                      </div>
                      <span className="text-xs text-brand-cyan font-bold font-display">10-12 reps x 2 sets</span>
                    </div>

                    <div className="p-4 bg-dark-950/40 border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">Standard Push-Ups</h4>
                        <span className="text-[10px] text-zinc-500">Waroms chest joints, shoulders, and triceps</span>
                      </div>
                      <span className="text-xs text-brand-cyan font-bold font-display">10-12 reps x 2 sets</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {/* Beginner Alternatives Card */}
              <SpotlightCard className="p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-brand-violet" /> Beginner Alternative Paths
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    If bodyweight pull-ups or floor push-ups exceed warm-up heart rate limits, substitute with these joint-friendly variations.
                  </p>
                  
                  <div className="space-y-3 pt-4">
                    <div className="p-4 bg-dark-950/40 border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">Assisted Pull-Ups</h4>
                        <span className="text-[10px] text-zinc-500">Use loop resistance bands to offset weight</span>
                      </div>
                      <span className="text-xs text-brand-violet font-bold font-display">Adaptable reps</span>
                    </div>

                    <div className="p-4 bg-dark-950/40 border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">Incline Push-Ups</h4>
                        <span className="text-[10px] text-zinc-500">Elevated surface to decrease chest load</span>
                      </div>
                      <span className="text-xs text-brand-violet font-bold font-display">Adaptable reps</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          )}

          {/* DISPLAY LEGS WARMUP */}
          {activeWarmupTab === 'Legs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Routine Card */}
              <SpotlightCard className="p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                    <Flame className="h-5 w-5 text-brand-cyan" /> Leg Day Activation
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Lubricate hip joints, knees, and ankles before heavy squat or deadlift cycles.
                  </p>
                  
                  <div className="space-y-3 pt-4">
                    <div className="p-4 bg-dark-950/40 border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">Bodyweight Squats</h4>
                        <span className="text-[10px] text-zinc-500">Greases knees, hips, and dynamic balance</span>
                      </div>
                      <span className="text-xs text-brand-cyan font-bold font-display">15-20 reps x 2 sets</span>
                    </div>
                  </div>
                </div>
              </SpotlightCard>

              {/* Optional Mobility Stretches */}
              <SpotlightCard className="p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-black text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-brand-violet" /> Optional Joint Mobility
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Complete 1 set of each dynamic mobility drill to open up tight glutes and tight lower back.
                  </p>
                  
                  <div className="space-y-3 pt-4">
                    {['Dynamic Leg Swings (10 reps / leg)', 'Hip Circles (10 rotations)', 'Walking Lunges (10 steps)'].map((mob, idx) => (
                      <div key={idx} className="p-3 bg-dark-950/40 border border-white/5 rounded-xl text-xs text-zinc-300 font-bold">
                        {mob}
                      </div>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </div>
          )}

          {/* DISPLAY STRETCHES & FLEXIBILITY LIST */}
          {activeWarmupTab === 'Stretches' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {stretches.map((stretch) => (
                <SpotlightCard key={stretch.id} className="p-5 flex flex-col justify-between border-white/5 hover:border-brand-cyan/20">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] text-brand-cyan font-black uppercase tracking-wider bg-brand-cyan/10 px-2 py-0.5 rounded">
                          {stretch.focus}
                        </span>
                        <h4 className="text-lg font-display font-black text-white mt-1.5">{stretch.name}</h4>
                      </div>
                      <span className="text-xs text-zinc-500 font-bold">{stretch.reps}</span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed font-normal min-h-[36px]">
                      {stretch.instructions}
                    </p>

                    {/* Integrated fallback video player */}
                    <div className="pt-2">
                      <VideoPlayer 
                        primaryUrl={stretch.youtubeUrl} 
                        backupUrl={stretch.backupYoutubeUrl} 
                        title={stretch.name} 
                      />
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
