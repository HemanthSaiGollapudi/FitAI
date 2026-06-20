import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Check, Search, Info, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { VideoPlayer, validateVideoUrl } from './VideoPlayer';
import { SpotlightCard } from './SpotlightCard';

type CategoryType = 'Chest' | 'Back' | 'Shoulders' | 'Biceps' | 'Triceps' | 'Legs' | 'Abs' | 'Calisthenics' | 'Flexibility';

interface ExerciseLibraryProps {
  onSaveExercise: (id: string) => void;
  onCompleteExercise: (id: string) => void;
  savedExercises: string[];
  completedExercises: string[];
}

export const ExerciseLibrary: React.FC<ExerciseLibraryProps> = ({
  onSaveExercise,
  onCompleteExercise,
  savedExercises,
  completedExercises
}) => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Chest');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const categories: CategoryType[] = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Abs', 'Calisthenics', 'Flexibility'
  ];

  // Filter exercises
  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesCategory = ex.group === activeCategory;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleExpand = (id: string) => {
    setExpandedExerciseId(expandedExerciseId === id ? null : id);
  };

  return (
    <section id="library" className="relative py-24 overflow-hidden border-t border-white/5 bg-[#03000a]">
      {/* Background ambient lighting */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-brand-cyan/5 rounded-full blur-[90px] pointer-events-none" />

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
            Exercise Library
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-white"
          >
            Explore Master Movements
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Learn correct posture, explore alternate exercises, and watch verified visual walkthroughs.
          </motion.p>
        </div>

        {/* Search & Category Tabs */}
        <div className="space-y-6 max-w-6xl mx-auto mb-12">
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search library by name, equipment, target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-900/40 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet backdrop-blur-md"
            />
          </div>

          {/* Categories Horizontal Scroller */}
          <div className="flex justify-start md:justify-center overflow-x-auto pb-3 gap-2 px-1 max-w-full scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setExpandedExerciseId(null);
                }}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-bold border shrink-0 transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-brand-violet to-brand-cyan border-brand-violet/50 text-white shadow-glow-purple scale-[1.02]'
                    : 'bg-dark-900 border-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto text-left">
          <AnimatePresence mode="popLayout">
            {filteredExercises.map((ex) => {
              const isSaved = savedExercises.includes(ex.id);
              const isCompleted = completedExercises.includes(ex.id);
              const isExpanded = expandedExerciseId === ex.id;

              return (
                <motion.div
                  key={ex.id}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="h-fit"
                >
                  <SpotlightCard className={`p-6 border transition-all duration-300 flex flex-col justify-between ${
                    isExpanded ? 'border-brand-violet/40 bg-[#0c061d]/40' : 'border-white/5 hover:border-brand-violet/20 bg-dark-900/30'
                  }`}>
                    <div className="space-y-4">
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[9px] text-brand-cyan font-black uppercase tracking-wider bg-brand-cyan/10 px-2 py-0.5 rounded">
                              {ex.target}
                            </span>
                            <span className="text-[9px] text-brand-violet font-black uppercase tracking-wider bg-brand-violet/10 px-2 py-0.5 rounded">
                              {ex.equipment}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                              ex.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                              ex.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-rose-500/10 text-rose-400'
                            }`}>
                              {ex.difficulty}
                            </span>
                          </div>
                          <h3 className="text-lg font-display font-black text-white leading-tight mt-1.5">
                            {ex.name}
                          </h3>
                        </div>

                        {/* Favorite & Complete Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onSaveExercise(ex.id)}
                            className={`p-2 rounded-lg border transition-all duration-200 ${
                              isSaved
                                ? 'bg-brand-pink/20 border-brand-pink text-brand-pink'
                                : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-white'
                            }`}
                            title="Favorite exercise"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                          <button
                            onClick={() => onCompleteExercise(ex.id)}
                            className={`p-2 rounded-lg border transition-all duration-200 ${
                              isCompleted
                                ? 'bg-brand-lime/20 border-brand-lime text-brand-lime'
                                : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-white'
                            }`}
                            title="Log completed"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Brief description */}
                      <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                        {ex.desc}
                      </p>

                      {/* Card Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleExpand(ex.id)}
                          className="flex-1 flex items-center justify-center gap-1 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                        >
                          {isExpanded ? (
                            <>
                              Hide Instructions <ChevronUp className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              View Form & Video Guide <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                        {(() => {
                          const hasValidVideo = validateVideoUrl(ex.youtubeUrl) || validateVideoUrl(ex.backupYoutubeUrl);
                          return (
                            <button
                              disabled={!hasValidVideo}
                              onClick={() => {
                                console.log("Opening video:", ex.name, ex.youtubeUrl);
                                window.open(ex.youtubeUrl, '_blank', 'noopener,noreferrer');
                              }}
                              className={`px-4.5 py-2 border rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
                                hasValidVideo
                                  ? 'bg-brand-violet/10 border-brand-violet/25 hover:border-brand-violet hover:bg-brand-violet/20 text-brand-cyan hover:text-white cursor-pointer'
                                  : 'bg-zinc-800/40 border-zinc-700/25 text-zinc-500 cursor-not-allowed opacity-50'
                              }`}
                              title={hasValidVideo ? "Watch on YouTube" : "Video unavailable"}
                            >
                              {hasValidVideo ? "Watch on YouTube" : "Video unavailable"}
                            </button>
                          );
                        })()}
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="pt-4 border-t border-white/5 space-y-5 overflow-hidden text-xs"
                        >
                          {/* Working Demo Video with mirror backup switcher */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Video Demonstration</span>
                            <VideoPlayer
                              primaryUrl={ex.youtubeUrl}
                              backupUrl={ex.backupYoutubeUrl}
                              title={ex.name}
                            />
                          </div>

                          {/* Target/Equipment specs */}
                          <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Recommended Volume</span>
                              <span className="text-white font-bold">{ex.setsReps || '3 Sets x 10-12 Reps'}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Alternative Option</span>
                              <span className="text-brand-cyan font-bold">{ex.alternative || 'None'}</span>
                            </div>
                          </div>

                          {/* Proper Form Instructions */}
                          <div className="space-y-2">
                            <span className="text-[10px] text-brand-lime font-bold uppercase tracking-wider flex items-center gap-1">
                              <Info className="h-3.5 w-3.5" /> Proper Form & Instructions
                            </span>
                            <ol className="space-y-1.5 pl-4 list-decimal text-zinc-400 font-normal leading-relaxed">
                              {ex.form.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Common Mistakes */}
                          {ex.mistakes && ex.mistakes.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5" /> Common Pitfalls
                              </span>
                              <ul className="space-y-1.5 pl-4 list-disc text-zinc-400 font-normal leading-relaxed">
                                {ex.mistakes.map((m, i) => (
                                  <li key={i}>{m}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filteredExercises.length === 0 && (
            <div className="col-span-2 py-16 border border-dashed border-white/5 rounded-2xl text-center text-xs text-zinc-500 bg-dark-900/10">
              No exercises found in category matching query.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
