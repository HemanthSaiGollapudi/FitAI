import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Dumbbell, Trash2, Copy, Edit3, 
  Check, X, Play, FolderPlus, ArrowLeft 
} from 'lucide-react';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { SpotlightCard } from './SpotlightCard';

export interface WorkoutRoutine {
  id: string;
  name: string;
  desc: string;
  exercises: string[]; // Array of exercise IDs
}

interface WorkoutBuilderProps {
  customRoutines: WorkoutRoutine[];
  onSaveRoutine: (routine: WorkoutRoutine) => void;
  onDeleteRoutine: (id: string) => void;
  onDuplicateRoutine: (routine: WorkoutRoutine) => void;
  onStartWorkout: (routine: WorkoutRoutine) => void;
  onBackToHub?: () => void;
}

export const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({
  customRoutines,
  onSaveRoutine,
  onDeleteRoutine,
  onDuplicateRoutine,
  onStartWorkout,
  onBackToHub
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<WorkoutRoutine | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [muscleFilter, setMuscleFilter] = useState<string>('All');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>([]);

  // Sync tempSelected whenever the search modal is opened
  useEffect(() => {
    if (isSearchOpen && activeRoutine) {
      setTempSelected(activeRoutine.exercises || []);
    }
  }, [isSearchOpen, activeRoutine]);

  const handleToggleTempExercise = (id: string) => {
    setTempSelected((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  // Intercept back button gesture inside Workout Logger
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.app === 'fitai' && e.state.view === 'logger') {
        setIsEditing(e.state.isEditing);
        setIsSearchOpen(e.state.isSearchOpen);
      } else {
        setIsEditing(false);
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial push state for routine listing
    if (!window.history.state || window.history.state.view !== 'logger') {
      window.history.pushState({ app: 'fitai', view: 'logger', isEditing: false, isSearchOpen: false }, '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Extract unique muscle groups for filters
  const muscleGroups = ['All', 'Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps', 'Legs', 'Abs'];

  const handleCreateNew = () => {
    setActiveRoutine({
      id: `routine-${Date.now()}`,
      name: 'Custom Workout split',
      desc: 'Formulate your sets and progression targets.',
      exercises: []
    });
    setIsEditing(true);
    window.history.pushState({ app: 'fitai', view: 'logger', isEditing: true, isSearchOpen: false }, '');
  };

  const handleEdit = (routine: WorkoutRoutine) => {
    setActiveRoutine({ ...routine });
    setIsEditing(true);
    window.history.pushState({ app: 'fitai', view: 'logger', isEditing: true, isSearchOpen: false }, '');
  };

  const handleSaveClick = () => {
    if (!activeRoutine || !activeRoutine.name.trim()) return;
    onSaveRoutine(activeRoutine);
    setIsEditing(false);
    setActiveRoutine(null);
  };

  const handleAddExerciseId = (id: string) => {
    if (!activeRoutine) return;
    if (activeRoutine.exercises.includes(id)) {
      // Remove it
      setActiveRoutine({
        ...activeRoutine,
        exercises: activeRoutine.exercises.filter((eid) => eid !== id)
      });
    } else {
      // Add it
      setActiveRoutine({
        ...activeRoutine,
        exercises: [...activeRoutine.exercises, id]
      });
    }
  };

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    window.history.pushState({ app: 'fitai', view: 'logger', isEditing: true, isSearchOpen: true }, '');
  };

  // Filter exercises for search modal
  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = muscleFilter === 'All' || ex.group === muscleFilter;
    return matchesSearch && matchesMuscle;
  });

  return (
    <section id="builder" className="relative py-24 overflow-hidden border-t border-white/5 bg-dark-950/20">
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-brand-violet/5 rounded-full blur-[80px] pointer-events-none" />

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
            Routine Planner
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight"
          >
            Custom Workout Builder
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Design custom training sessions, organize splits, and duplicate routines just like Strong or Hevy.
          </motion.p>
        </div>

        {/* View Switcher: List vs Editor */}
        {!isEditing ? (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Back to Training Hub Arrow */}
            {onBackToHub && (
              <div className="flex justify-start">
                <button
                  onClick={onBackToHub}
                  className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-black text-xs uppercase tracking-wider transition-colors min-h-[44px] py-2 px-4 bg-dark-900 border border-white/5 rounded-xl shadow-glass cursor-pointer"
                >
                  <ArrowLeft className="h-4.5 w-4.5 text-brand-cyan" /> Back to Training Hub
                </button>
              </div>
            )}

            {/* Create Bar */}
            <div className="flex justify-end">
              <button
                onClick={handleCreateNew}
                className="px-6 py-3.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-bold rounded-xl shadow-glow-purple hover:scale-[1.02] transition-transform flex items-center gap-2"
              >
                <FolderPlus className="h-4.5 w-4.5" /> Create Custom Routine
              </button>
            </div>

            {/* Routines Grid */}
            {customRoutines.length === 0 ? (
              <div className="py-16 border border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-dark-900/30 shadow-glass">
                <Dumbbell className="h-10 w-10 text-zinc-600 mx-auto" />
                <p className="text-zinc-400 text-sm">No custom routines constructed yet.</p>
                <button
                  onClick={handleCreateNew}
                  className="px-4 py-2 border border-brand-violet/40 hover:border-brand-violet text-brand-cyan text-xs font-bold rounded-xl bg-brand-violet/5"
                >
                  Create Your First split
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customRoutines.map((routine) => (
                  <SpotlightCard key={routine.id} className="p-6 bg-dark-900/40 border border-white/5 rounded-2xl flex flex-col justify-between hover:border-brand-violet/20 h-full">
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-display font-black text-white">{routine.name}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(routine)}
                            className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-white/5"
                            title="Edit Routine"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDuplicateRoutine(routine)}
                            className="p-1.5 text-zinc-500 hover:text-white rounded hover:bg-white/5"
                            title="Duplicate Routine"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRoutine(routine.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-white/5"
                            title="Delete Routine"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-normal min-h-[36px]">{routine.desc}</p>
                      
                      {/* Exercise chips list */}
                      <div className="pt-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-2">
                          Exercises ({routine.exercises.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {routine.exercises.slice(0, 4).map((eid) => {
                            const ex = EXERCISE_DATABASE.find((db) => db.id === eid);
                            return ex ? (
                              <span key={eid} className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[9px] font-bold text-zinc-300">
                                {ex.name}
                              </span>
                            ) : null;
                          })}
                          {routine.exercises.length > 4 && (
                            <span className="px-2 py-0.5 bg-brand-violet/10 border border-brand-violet/20 rounded text-[9px] font-bold text-brand-cyan">
                              +{routine.exercises.length - 4} More
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-white/5">
                      <button
                        onClick={() => onStartWorkout(routine)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-violet/40 text-brand-cyan hover:text-white rounded-xl text-xs font-bold transition-all"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" /> Start Active Workout
                      </button>
                    </div>
                  </SpotlightCard>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Routine Editor View
          <div className="max-w-3xl mx-auto bg-dark-900/60 border border-white/5 rounded-2xl backdrop-blur-xl p-8 space-y-6 text-left shadow-glass">
            
            {/* Prominent Back Button */}
            <div className="flex items-center mb-2">
              <button
                onClick={() => { setIsEditing(false); setActiveRoutine(null); }}
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-white font-black text-xs uppercase tracking-wider transition-colors min-h-[44px] py-2 px-4 bg-dark-900 border border-white/5 rounded-xl shadow-glass cursor-pointer"
              >
                <ArrowLeft className="h-4.5 w-4.5 text-brand-cyan" /> Back to Routines
              </button>
            </div>

            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-xl font-display font-extrabold text-white">Routine Composer</h3>
              <button
                onClick={() => { setIsEditing(false); setActiveRoutine(null); }}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Title Inputs */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Routine Title</label>
                <input
                  type="text"
                  value={activeRoutine?.name || ''}
                  onChange={(e) => setActiveRoutine(activeRoutine ? { ...activeRoutine, name: e.target.value } : null)}
                  className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-brand-violet transition-colors font-bold"
                  placeholder="e.g. Upper Body Hypertrophy"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Description</label>
                <textarea
                  value={activeRoutine?.desc || ''}
                  onChange={(e) => setActiveRoutine(activeRoutine ? { ...activeRoutine, desc: e.target.value } : null)}
                  className="w-full px-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet transition-colors h-16 resize-none"
                  placeholder="Summarize instructions or target progressive weight schedules."
                />
              </div>
            </div>

            {/* Selected Exercises checklist */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                  Workout Exercises ({activeRoutine?.exercises.length || 0})
                </h4>
                <button
                  onClick={handleOpenSearch}
                  className="px-3.5 py-2.5 bg-brand-violet/10 border border-brand-violet/20 hover:bg-brand-violet/20 rounded-lg text-xs font-bold text-brand-cyan transition-all flex items-center gap-1 min-h-[44px]"
                >
                  <Plus className="h-4 w-4" /> Add Exercise
                </button>
              </div>

              {activeRoutine?.exercises.length === 0 ? (
                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center text-xs text-zinc-500 bg-dark-950/20">
                  Empty list. Click 'Add Exercise' to search and construct your routine.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeRoutine?.exercises.map((eid, idx) => {
                    const ex = EXERCISE_DATABASE.find((db) => db.id === eid);
                    if (!ex) return null;

                    return (
                      <div key={eid} className="p-3 bg-dark-950/40 border border-white/5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="h-5 w-5 rounded-full bg-brand-violet/10 border border-brand-violet/20 flex items-center justify-center text-[10px] font-bold text-brand-violet">
                            {idx + 1}
                          </span>
                          <div>
                            <h5 className="text-xs font-bold text-white">{ex.name}</h5>
                            <span className="text-[10px] text-zinc-500">{ex.group} • {ex.equipment}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddExerciseId(eid)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
              <button
                onClick={() => { setIsEditing(false); setActiveRoutine(null); }}
                className="px-5 py-3 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 text-zinc-400 min-h-[44px] min-w-[80px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClick}
                className="px-6 py-3 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-bold rounded-xl shadow-glow-purple min-h-[44px]"
              >
                Save Routine Template
              </button>
            </div>
          </div>
        )}

        {/* Modal: Exercise Search Selector */}
        <AnimatePresence>
          {isSearchOpen && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSearchOpen(false)}
                className="absolute inset-0 bg-dark-950/80 backdrop-blur-md cursor-pointer"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-2xl max-h-[80vh] bg-dark-900 border border-white/10 rounded-2xl shadow-glass flex flex-col z-10 overflow-hidden text-left"
              >
                {/* Search Bar */}
                <div className="p-4 bg-dark-950/50 border-b border-white/5 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsSearchOpen(false)}
                        className="p-1.5 rounded-lg text-brand-violet hover:text-brand-cyan bg-brand-violet/10 hover:bg-brand-violet/20 border border-brand-violet/20 hover:border-brand-violet/30 transition-all flex items-center justify-center cursor-pointer h-9 w-9 shrink-0"
                        title="Back"
                      >
                        <ArrowLeft className="h-4.5 w-4.5" />
                      </button>
                      <h3 className="font-display font-bold text-white text-base">Select Exercises</h3>
                    </div>
                    <button
                      onClick={() => setIsSearchOpen(false)}
                      className="p-1 rounded text-zinc-500 hover:text-white min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Search exercises by name, target..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet transition-colors"
                    />
                  </div>

                  {/* Muscle Filter bar */}
                  <div className="flex flex-wrap gap-1">
                    {muscleGroups.map((g) => (
                      <button
                        key={g}
                        onClick={() => setMuscleFilter(g)}
                        className={`px-3 py-1 rounded text-[10px] font-bold border transition-colors min-h-[44px] ${
                          muscleFilter === g
                            ? 'bg-brand-violet/20 border-brand-violet text-brand-cyan'
                            : 'bg-dark-950 border-white/5 text-zinc-500 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredExercises.map((ex) => {
                    const isAdded = tempSelected.includes(ex.id);

                    return (
                      <div
                        key={ex.id}
                        onClick={() => handleToggleTempExercise(ex.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isAdded
                            ? 'bg-brand-violet/10 border-brand-violet/40 text-white'
                            : 'bg-dark-950/30 border-white/5 hover:border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                          <span className="text-[10px] text-zinc-500">{ex.group} • {ex.equipment} • {ex.difficulty}</span>
                        </div>
                        <div className={`h-5.5 w-5.5 rounded-full border flex items-center justify-center transition-all ${
                          isAdded
                            ? 'bg-brand-cyan border-brand-cyan text-dark-950'
                            : 'border-white/10 text-zinc-500 hover:text-white hover:border-zinc-500'
                        }`}>
                          {isAdded ? (
                            <Check className="h-3 w-3 stroke-[3]" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredExercises.length === 0 && (
                    <div className="py-8 text-center text-xs text-zinc-600">
                      No matching exercises found in library.
                    </div>
                  )}
                </div>

                {/* Sticky Footer */}
                <div className="p-4 bg-dark-950/50 border-t border-white/5 flex items-center justify-between gap-4">
                  <div className="text-xs text-zinc-400 font-semibold">
                    {tempSelected.length === 1
                      ? '1 exercise selected'
                      : `${tempSelected.length} exercises selected`
                    }
                  </div>
                  <button
                    onClick={() => {
                      if (activeRoutine) {
                        setActiveRoutine({
                          ...activeRoutine,
                          exercises: tempSelected
                        });
                      }
                      setIsSearchOpen(false);
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-brand-violet to-brand-cyan text-white text-xs font-bold rounded-xl shadow-glow-purple cursor-pointer min-h-[40px] hover:scale-101 transition-transform"
                  >
                    Save Exercises
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
};
