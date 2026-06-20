import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Check, Plus, Trash2, X, Clock, 
  ChevronDown, Dumbbell, Volume2, VolumeX, Eye
} from 'lucide-react';
import { EXERCISE_DATABASE } from '../data/exerciseDatabase';
import { SpotlightCard } from './SpotlightCard';

export interface ActiveWorkoutSet {
  weight: number;
  reps: number;
  completed: boolean;
}

export interface ActiveWorkoutExercise {
  id: string;
  name: string;
  sets: ActiveWorkoutSet[];
  notes?: string;
}

export interface ActiveWorkout {
  id: string;
  name: string;
  exercises: ActiveWorkoutExercise[];
  startTime: number;
  isPaused?: boolean;
  pausedTime?: number;
  totalPausedDuration?: number;
}

interface ActiveWorkoutSessionProps {
  activeWorkout: ActiveWorkout;
  onUpdateActiveWorkout: (workout: ActiveWorkout) => void;
  onFinishActiveWorkout: () => void;
  onCancelActiveWorkout: () => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
  activeWorkout,
  onUpdateActiveWorkout,
  onFinishActiveWorkout,
  onCancelActiveWorkout,
  isExpanded,
  setIsExpanded
}) => {
  // Stopwatch state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Search modal state inside active session
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Rest Timer state
  const [restTimeRemaining, setRestTimeRemaining] = useState<number | null>(null);
  const [restTimeTotal, setRestTimeTotal] = useState<number>(60);
  const [isRestPaused, setIsRestPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shouldFlash, setShouldFlash] = useState(false);

  // Tick the stopwatch
  useEffect(() => {
    const updateTimer = () => {
      const start = activeWorkout.startTime;
      const totalPaused = activeWorkout.totalPausedDuration || 0;
      
      if (activeWorkout.isPaused && activeWorkout.pausedTime) {
        setElapsedSeconds(Math.max(0, Math.round((activeWorkout.pausedTime - start - totalPaused) / 1000)));
      } else {
        setElapsedSeconds(Math.max(0, Math.round((Date.now() - start - totalPaused) / 1000)));
      }
    };

    updateTimer();
    if (activeWorkout.isPaused) return;

    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Tick the Rest Timer
  useEffect(() => {
    if (restTimeRemaining === null || isRestPaused) return;

    if (restTimeRemaining <= 0) {
      handleRestComplete();
      return;
    }

    const timer = setTimeout(() => {
      setRestTimeRemaining(restTimeRemaining - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [restTimeRemaining, isRestPaused]);

  const handleRestComplete = () => {
    setRestTimeRemaining(null);
    setShouldFlash(true);
    setTimeout(() => setShouldFlash(false), 2000);

    if (soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch beep
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {
        console.warn("Audio Context blocked or unsupported:", e);
      }
    }
  };

  const startRestTimer = (seconds: number) => {
    setRestTimeTotal(seconds);
    setRestTimeRemaining(seconds);
    setIsRestPaused(false);
  };

  // Stopwatch controls
  const handlePauseResume = () => {
    const now = Date.now();
    const updated = { ...activeWorkout };
    
    if (activeWorkout.isPaused) {
      // Resume
      const pausedAt = activeWorkout.pausedTime || now;
      const duration = now - pausedAt;
      updated.isPaused = false;
      updated.pausedTime = 0;
      updated.totalPausedDuration = (activeWorkout.totalPausedDuration || 0) + duration;
    } else {
      // Pause
      updated.isPaused = true;
      updated.pausedTime = now;
    }
    onUpdateActiveWorkout(updated);
  };

  // Set Handlers
  const handleUpdateSet = (exIdx: number, setIdx: number, fields: Partial<ActiveWorkoutSet>) => {
    const updatedEx = [...activeWorkout.exercises];
    const prevSet = updatedEx[exIdx].sets[setIdx];
    const nextSet = { ...prevSet, ...fields };
    updatedEx[exIdx].sets[setIdx] = nextSet;

    // Start rest timer automatically if set just got completed
    if (fields.completed === true && !prevSet.completed) {
      startRestTimer(restTimeTotal);
    }

    onUpdateActiveWorkout({
      ...activeWorkout,
      exercises: updatedEx
    });
  };

  const handleAddSet = (exIdx: number) => {
    const updatedEx = [...activeWorkout.exercises];
    const prevSet = updatedEx[exIdx].sets[updatedEx[exIdx].sets.length - 1];
    updatedEx[exIdx].sets.push({
      weight: prevSet ? prevSet.weight : 0,
      reps: prevSet ? prevSet.reps : 10,
      completed: false
    });
    onUpdateActiveWorkout({
      ...activeWorkout,
      exercises: updatedEx
    });
  };

  const handleRemoveSet = (exIdx: number, setIdx: number) => {
    const updatedEx = [...activeWorkout.exercises];
    updatedEx[exIdx].sets.splice(setIdx, 1);
    
    if (updatedEx[exIdx].sets.length === 0) {
      updatedEx.splice(exIdx, 1);
    }
    
    onUpdateActiveWorkout({
      ...activeWorkout,
      exercises: updatedEx
    });
  };

  const handleAddExerciseToActive = (exId: string, exName: string) => {
    if (activeWorkout.exercises.some(e => e.id === exId)) return;
    onUpdateActiveWorkout({
      ...activeWorkout,
      exercises: [
        ...activeWorkout.exercises,
        {
          id: exId,
          name: exName,
          sets: [{ weight: 0, reps: 10, completed: false }],
          notes: ''
        }
      ]
    });
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleRemoveExercise = (exIdx: number) => {
    const updatedEx = [...activeWorkout.exercises];
    updatedEx.splice(exIdx, 1);
    onUpdateActiveWorkout({
      ...activeWorkout,
      exercises: updatedEx
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCompletedSetsCount = () => {
    let count = 0;
    activeWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) count++;
      });
    });
    return count;
  };

  const getTotalSetsCount = () => {
    let count = 0;
    activeWorkout.exercises.forEach(ex => {
      count += ex.sets.length;
    });
    return count;
  };

  // Filter exercise list inside search selector
  const filteredSearchExercises = EXERCISE_DATABASE.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ex.group.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sound alert render helper
  const SoundIcon = soundEnabled ? Volume2 : VolumeX;

  // Finish session validation wrapper
  const handleFinishClick = () => {
    // Validate: At least one exercise and each exercise must have completed sets
    if (activeWorkout.exercises.length === 0) {
      alert("Please add at least one exercise before finishing.");
      return;
    }
    const completedCount = getCompletedSetsCount();
    if (completedCount === 0) {
      alert("No sets were checked off. Please check off at least one set to finish!");
      return;
    }
    onFinishActiveWorkout();
  };

  return (
    <>
      {/* Rest Timer Visual Flash Effect */}
      {shouldFlash && (
        <div className="fixed inset-0 z-[200] bg-brand-cyan/20 animate-ping pointer-events-none" />
      )}

      {/* MINIMIZED VIEW BAR */}
      {!isExpanded && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-dark-900/90 border-t border-brand-violet/40 backdrop-blur-lg px-6 py-4 flex items-center justify-between shadow-glass text-left">
          <div 
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-3 cursor-pointer flex-1 group"
          >
            <div className="p-2 bg-brand-violet/10 rounded-lg text-brand-cyan group-hover:text-brand-violet transition-colors">
              <Dumbbell className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-brand-cyan font-black uppercase tracking-widest block">Workout In Progress</span>
              <h4 className="text-sm font-display font-black text-white truncate max-w-[200px] sm:max-w-[400px]">
                {activeWorkout.name}
              </h4>
            </div>
            <div className="h-4 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-xs">
              <Clock className="h-3.5 w-3.5 text-zinc-500" /> {formatTime(elapsedSeconds)}
            </div>
            {activeWorkout.isPaused && (
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8px] font-black uppercase rounded tracking-wider">
                Paused
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Sets: {getCompletedSetsCount()}/{getTotalSetsCount()}
            </span>
            <button
              onClick={() => setIsExpanded(true)}
              className="px-4 py-2 bg-white/5 border border-white/10 hover:border-brand-cyan/40 text-brand-cyan hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <Eye className="h-3.5 w-3.5" /> Maximize
            </button>
            <button
              onClick={handleFinishClick}
              className="px-4.5 py-2 bg-gradient-to-r from-brand-lime to-brand-cyan text-dark-950 text-xs font-black rounded-lg shadow-glow-lime hover:scale-[1.02] transition-transform"
            >
              Finish
            </button>
          </div>
        </div>
      )}

      {/* EXPANDED VIEW SCREEN */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-dark-950/95 backdrop-blur-xl flex flex-col min-h-screen text-left">
          
          {/* Header */}
          <div className="sticky top-0 bg-dark-950/80 backdrop-blur-md border-b border-white/5 p-6 z-10">
            <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-brand-cyan font-black uppercase tracking-widest bg-brand-cyan/10 px-2.5 py-0.5 rounded-full">
                    Active Workout Session
                  </span>
                  {activeWorkout.isPaused && (
                    <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                      Paused
                    </span>
                  )}
                </div>
                {/* Editable workout title */}
                <input 
                  type="text"
                  value={activeWorkout.name}
                  onChange={(e) => onUpdateActiveWorkout({ ...activeWorkout, name: e.target.value })}
                  className="text-2xl sm:text-3xl font-display font-black text-white mt-1 bg-transparent border-b border-transparent hover:border-white/10 focus:border-brand-violet focus:outline-none w-full"
                />
              </div>

              {/* Controls bar */}
              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-2 text-white font-mono bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 text-sm">
                  <Clock className="h-4 w-4 text-brand-cyan animate-pulse" /> {formatTime(elapsedSeconds)}
                </div>

                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <button
                    onClick={handlePauseResume}
                    className={`p-2.5 rounded-xl border transition-all text-xs font-bold ${
                      activeWorkout.isPaused
                        ? 'border-brand-lime/30 text-brand-lime hover:bg-brand-lime/10'
                        : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                    }`}
                    title={activeWorkout.isPaused ? "Resume session" : "Pause session"}
                  >
                    {activeWorkout.isPaused ? <Play className="h-4.5 w-4.5 fill-current" /> : <Pause className="h-4.5 w-4.5 fill-current" />}
                  </button>

                  <button
                    onClick={() => setIsExpanded(false)}
                    className="p-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5"
                    title="Minimize session"
                  >
                    <ChevronDown className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={onCancelActiveWorkout}
                    className="p-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    title="Discard Workout"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>

                  <button
                    onClick={handleFinishClick}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-lime to-brand-cyan text-dark-950 text-xs font-black shadow-glow-lime hover:scale-[1.02] transition-transform"
                  >
                    Finish Workout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="max-w-5xl w-full mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Workout Logger (8 Columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {activeWorkout.exercises.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 border border-dashed border-white/10 rounded-2xl bg-dark-900/10 flex flex-col items-center justify-center space-y-4">
                  <Dumbbell className="h-12 w-12 text-zinc-600" />
                  <p className="text-sm font-semibold">Your workout checklist is empty.</p>
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="px-4 py-2 bg-brand-violet/20 hover:bg-brand-violet border border-brand-violet/40 text-brand-cyan hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    + Add Exercise to Session
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeWorkout.exercises.map((ex, exIdx) => (
                    <SpotlightCard key={ex.id} className="p-5 border border-white/5 rounded-2xl bg-dark-900/30">
                      
                      {/* Exercise Header */}
                      <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                        <div>
                          <h4 className="text-base font-display font-black text-brand-cyan flex items-center gap-2">
                            <span className="h-5.5 w-5.5 rounded-full bg-brand-violet/10 text-brand-violet border border-brand-violet/20 text-[10px] font-black flex items-center justify-center">
                              {exIdx + 1}
                            </span>
                            {ex.name}
                          </h4>
                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block mt-1">
                            {EXERCISE_DATABASE.find(e => e.id === ex.id)?.group || 'Legs'} • {EXERCISE_DATABASE.find(e => e.id === ex.id)?.equipment || 'Barbell'}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveExercise(exIdx)}
                          className="text-[10px] text-zinc-500 hover:text-red-400 font-semibold flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5"
                        >
                          <X className="h-3 w-3" /> Remove
                        </button>
                      </div>

                      {/* Notes */}
                      <div className="mb-4">
                        <input 
                          type="text"
                          placeholder="Log notes, e.g. target weights, RPE rating..."
                          value={ex.notes || ''}
                          onChange={(e) => {
                            const updatedEx = [...activeWorkout.exercises];
                            updatedEx[exIdx].notes = e.target.value;
                            onUpdateActiveWorkout({ ...activeWorkout, exercises: updatedEx });
                          }}
                          className="w-full px-3.5 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-brand-violet"
                        />
                      </div>

                      {/* Sets Table */}
                      <div className="overflow-x-auto mb-4">
                        <table className="w-full text-xs font-semibold text-zinc-400">
                          <thead>
                            <tr className="border-b border-white/5 text-[9px] uppercase tracking-wider text-zinc-500 text-left">
                              <th className="py-2 px-1">Set</th>
                              <th className="py-2 px-1">Weight (kg)</th>
                              <th className="py-2 px-1">Reps</th>
                              <th className="py-2 px-1 text-center">Done</th>
                              <th className="py-2 px-1 text-right">Delete</th>
                            </tr>
                          </thead>
                          <tbody>
                            {ex.sets.map((set, setIdx) => (
                              <tr 
                                key={setIdx} 
                                className={`border-b border-white/5 transition-colors ${
                                  set.completed ? 'bg-brand-lime/5 text-brand-lime' : ''
                                }`}
                              >
                                <td className="py-3 px-1 text-white font-bold">{setIdx + 1}</td>
                                <td className="py-2 px-1">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={set.weight || ''}
                                    onChange={(e) => handleUpdateSet(exIdx, setIdx, { weight: parseFloat(e.target.value) || 0 })}
                                    placeholder="0"
                                    className="w-20 px-2.5 py-1.5 bg-dark-950 border border-white/5 rounded focus:outline-none focus:border-brand-violet text-white text-xs font-bold"
                                    disabled={set.completed}
                                  />
                                </td>
                                <td className="py-2 px-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={set.reps || ''}
                                    onChange={(e) => handleUpdateSet(exIdx, setIdx, { reps: parseInt(e.target.value) || 0 })}
                                    placeholder="10"
                                    className="w-20 px-2.5 py-1.5 bg-dark-950 border border-white/5 rounded focus:outline-none focus:border-brand-violet text-white text-xs font-bold"
                                    disabled={set.completed}
                                  />
                                </td>
                                <td className="py-2 px-1 text-center">
                                  <button
                                    onClick={() => handleUpdateSet(exIdx, setIdx, { completed: !set.completed })}
                                    className={`mx-auto h-5.5 w-5.5 rounded border flex items-center justify-center transition-all ${
                                      set.completed
                                        ? 'bg-brand-lime border-brand-lime text-dark-950 shadow-glow-lime'
                                        : 'border-white/20 hover:border-brand-lime/50 text-transparent'
                                    }`}
                                  >
                                    <Check className="h-3.5 w-3.5 stroke-[4]" />
                                  </button>
                                </td>
                                <td className="py-2 px-1 text-right">
                                  <button
                                    onClick={() => handleRemoveSet(exIdx, setIdx)}
                                    className="text-zinc-600 hover:text-red-400 p-1.5 rounded"
                                    title="Delete set"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <button
                        onClick={() => handleAddSet(exIdx)}
                        className="px-3.5 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-300 transition-all flex items-center gap-1.5 border border-white/5"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Set
                      </button>

                    </SpotlightCard>
                  ))}
                </div>
              )}

              {/* Add exercise trigger at the bottom of the list */}
              {activeWorkout.exercises.length > 0 && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full py-4 border border-dashed border-white/10 hover:border-brand-violet/40 bg-dark-900/10 text-zinc-400 hover:text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-4.5 w-4.5" /> Add Another Exercise
                </button>
              )}

            </div>

            {/* Right side: Controls panel (4 Columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* REST TIMER COMPONENT */}
              <SpotlightCard className="p-6 border border-white/5 rounded-2xl bg-dark-900/40 text-center space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-brand-cyan" /> Rest Timer
                  </h3>
                  
                  {/* Sound on/off trigger */}
                  <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded text-zinc-400 hover:text-white"
                    title={soundEnabled ? "Mute audio cues" : "Unmute audio cues"}
                  >
                    <SoundIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Big countdown indicator */}
                <div className="space-y-1">
                  {restTimeRemaining !== null ? (
                    <div className="text-4xl sm:text-5xl font-mono font-black text-brand-cyan tracking-tight animate-pulse">
                      {formatTime(restTimeRemaining)}
                    </div>
                  ) : (
                    <div className="text-4xl sm:text-5xl font-mono font-black text-zinc-600 tracking-tight">
                      00:00
                    </div>
                  )}
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">
                    {restTimeRemaining !== null 
                      ? (isRestPaused ? 'Rest Paused' : 'Ticking down rest...') 
                      : 'Rest timer ready'}
                  </span>
                </div>

                {/* Progress bar */}
                {restTimeRemaining !== null && (
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-cyan h-full rounded-full transition-all duration-300"
                      style={{ width: `${(restTimeRemaining / restTimeTotal) * 100}%` }}
                    />
                  </div>
                )}

                {/* Presets and custom settings */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[30, 60, 90].map(s => (
                      <button
                        key={s}
                        onClick={() => startRestTimer(s)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          restTimeTotal === s && restTimeRemaining !== null
                            ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                            : 'bg-white/5 border-white/5 hover:border-zinc-700 text-zinc-300'
                        }`}
                      >
                        {s}s
                      </button>
                    ))}
                  </div>

                  {/* Custom duration inputs */}
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      placeholder="Custom seconds"
                      min="5"
                      max="600"
                      onChange={(e) => {
                        const v = parseInt(e.target.value);
                        if (v > 0) setRestTimeTotal(v);
                      }}
                      className="flex-1 px-3 py-2 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-cyan font-bold text-center"
                    />
                    <button
                      onClick={() => startRestTimer(restTimeTotal)}
                      className="px-4 py-2 bg-brand-cyan text-dark-950 font-bold rounded-xl text-xs hover:scale-102 transition-transform"
                    >
                      Start
                    </button>
                  </div>

                  {/* Rest control buttons */}
                  {restTimeRemaining !== null && (
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <button
                        onClick={() => setIsRestPaused(!isRestPaused)}
                        className="flex-1 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-xs font-bold text-zinc-300"
                      >
                        {isRestPaused ? 'Resume' : 'Pause'}
                      </button>
                      <button
                        onClick={() => setRestTimeRemaining(null)}
                        className="flex-1 py-2 border border-rose-500/20 hover:bg-rose-500/10 rounded-lg text-xs font-bold text-rose-400"
                      >
                        Skip
                      </button>
                    </div>
                  )}
                </div>

              </SpotlightCard>

              {/* Status details card */}
              <SpotlightCard className="p-5 border border-white/5 rounded-2xl bg-dark-900/40 space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">
                  Session Specifications
                </h3>
                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Exercises Configured:</span>
                    <span className="text-white">{activeWorkout.exercises.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Sets Listed:</span>
                    <span className="text-white">{getTotalSetsCount()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Sets Checked:</span>
                    <span className="text-brand-lime">{getCompletedSetsCount()} Completed</span>
                  </div>
                </div>
              </SpotlightCard>

            </div>

          </div>

        </div>
      )}

      {/* MODAL: SELECT EXERCISE TO ADD */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div onClick={() => setIsSearchOpen(false)} className="absolute inset-0 bg-dark-950/80 backdrop-blur-md" />
          <div className="relative w-full max-w-xl max-h-[70vh] bg-dark-900 border border-white/10 rounded-2xl shadow-glass flex flex-col z-10 overflow-hidden text-left">
            <div className="p-4 bg-dark-950/50 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-display font-bold text-white text-base">Select Exercise to Add</h3>
              <button onClick={() => setIsSearchOpen(false)} className="p-1 rounded text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 bg-dark-950/50 border-b border-white/5">
              <input
                type="text"
                placeholder="Search exercise by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-950 border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-brand-violet"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredSearchExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToActive(ex.id, ex.name)}
                  className="p-3 bg-dark-950/30 border border-white/5 rounded-xl flex items-center justify-between cursor-pointer hover:border-brand-violet/40 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                    <span className="text-[9px] text-zinc-500">{ex.group} • {ex.equipment}</span>
                  </div>
                  <span className="text-[10px] text-brand-cyan font-bold">Add +</span>
                </div>
              ))}
              {filteredSearchExercises.length === 0 && (
                <div className="py-8 text-center text-xs text-zinc-600">
                  No matching exercises found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
